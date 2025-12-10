/**
 * Store de autenticación con Zustand
 * Maneja el estado global de auth, usuario y permisos
 */

import { create } from "zustand";
import {
  onAuthStateChanged,
  onIdTokenChanged,
  User as FirebaseUser,
  signOut as firebaseSignOut,
  getIdToken,
} from "firebase/auth";
import { auth, isAuthAvailable } from "@/lib/firebase";
import type { Role, SessionUser, Client } from "@/types/auth";
import { setRoleCookie, clearRoleCookie, setAuthCookie, clearAuthCookie } from "@/lib/auth-cookies";

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Obtiene el rol seleccionado del debug store (desde localStorage)
 * Esto evita dependencia circular entre stores
 */
function getDebugRole(): Role | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem("emi-debug-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.selectedRole ?? null;
    }
  } catch {
    // Ignorar errores de parsing
  }
  return null;
}

// =============================================================================
// TIPOS DEL STORE
// =============================================================================

interface AuthState {
  // Estado
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;

  // Usuario
  user: SessionUser | null;

  // Cliente/workspace actual (para futuro multi-tenant)
  currentClient: Client | null;

  // Error
  error: string | null;
}

interface AuthActions {
  // Inicializar auth (llamar al montar la app)
  initialize: () => Promise<void>;

  // Actualizar usuario manualmente
  setUser: (user: SessionUser | null) => void;

  // Actualizar rol (útil para testing)
  setRole: (role: Role) => void;

  // Logout
  logout: () => void;

  // Reset error
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// =============================================================================
// HELPERS: Conversión de Firebase User a SessionUser
// =============================================================================

/**
 * Convierte un Firebase User a SessionUser
 * Por ahora usa un rol por defecto, en el futuro se puede obtener desde Firestore
 */
function convertFirebaseUserToSessionUser(firebaseUser: FirebaseUser): SessionUser {
  // Obtener rol del debug store (si existe) o usar default
  const debugRole = getDebugRole();
  const role: Role = debugRole ?? "product_designer";

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoUrl: firebaseUser.photoURL,
    role,
    permissions: [],
    emailVerified: firebaseUser.emailVerified,
    lastLoginAt: new Date(),
    createdAt: firebaseUser.metadata.creationTime
      ? new Date(firebaseUser.metadata.creationTime)
      : new Date(),
    onboarding: {
      completed: [],
      currentStep: undefined,
    },
    preferences: {
      theme: "system",
      language: "es",
      notifications: {
        email: true,
        push: true,
        inApp: true,
      },
    },
  };
}

// =============================================================================
// STORE
// =============================================================================

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Estado inicial
  isLoading: true,
  isInitialized: false,
  isAuthenticated: false,
  user: null,
  currentClient: null,
  error: null,

  // Inicializar - llamar una vez al montar la app
  initialize: async () => {
    // Evitar re-inicialización
    if (get().isInitialized) return;

    set({ isLoading: true, error: null });

    // Verificar si Firebase Auth está disponible
    if (!isAuthAvailable() || !auth) {
      console.warn(
        "Firebase Auth no está disponible. Verifica que las variables de entorno estén configuradas correctamente."
      );
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: "Firebase Auth no está configurado. Por favor, verifica las variables de entorno.",
      });
      return;
    }

    // Función helper para actualizar el token y el estado del usuario
    const updateUserState = async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Usuario autenticado - obtener ID token y guardarlo
        try {
          const idToken = await getIdToken(firebaseUser, false);
          const sessionUser = convertFirebaseUserToSessionUser(firebaseUser);
          setRoleCookie(sessionUser.role);
          setAuthCookie(idToken); // Establecer cookie con el ID token
          set({
            user: sessionUser,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
            error: null,
          });
        } catch (error) {
          console.error("Error getting ID token:", error);
          // Aún así establecer el usuario, pero sin token
          const sessionUser = convertFirebaseUserToSessionUser(firebaseUser);
          setRoleCookie(sessionUser.role);
          set({
            user: sessionUser,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
            error: null,
          });
        }
      } else {
        // Usuario no autenticado
        clearRoleCookie();
        clearAuthCookie(); // Limpiar cookie de autenticación
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      }
    };

    // Escuchar cambios en el estado de autenticación de Firebase
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _unsubscribeAuth = onAuthStateChanged(auth, updateUserState, (error) => {
      console.error("Error in auth state change:", error);
      clearRoleCookie();
      clearAuthCookie();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: error.message || "Error de autenticación",
      });
    });

    // Escuchar cambios en el ID token para renovarlo automáticamente
    // Esto asegura que el token se renueve cuando esté cerca de expirar
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _unsubscribeToken = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obtener el nuevo token (forzar renovación si es necesario)
          const idToken = await getIdToken(firebaseUser, true);
          setAuthCookie(idToken);
        } catch (error) {
          console.error("Error refreshing ID token:", error);
        }
      }
    });

    // Guardar unsubscribe para limpiar cuando sea necesario
    // Nota: En un store de Zustand, esto se puede manejar mejor con un cleanup
    // Por ahora, el listener se mantiene activo durante toda la sesión
  },

  // Actualizar usuario
  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  // Cambiar rol (útil para testing desde devtools)
  setRole: (role) => {
    const currentUser = get().user;
    if (currentUser) {
      // Actualizar cookie
      setRoleCookie(role);
      set({
        user: { ...currentUser, role },
      });
    }
  },

  // Logout
  logout: async () => {
    if (!isAuthAvailable() || !auth) {
      // Si Firebase Auth no está disponible, solo limpiamos el estado local
      clearRoleCookie();
      clearAuthCookie();
      set({
        user: null,
        isAuthenticated: false,
        currentClient: null,
      });
      // Recargar la página para asegurar que el middleware redirija a /login
      window.location.href = "/login";
      return;
    }

    try {
      await firebaseSignOut(auth);
      // Limpiar cookies y estado
      clearRoleCookie();
      clearAuthCookie();
      set({
        user: null,
        isAuthenticated: false,
        currentClient: null,
      });
      // Recargar la página para asegurar que el middleware redirija a /login
      // Esto garantiza que todas las cookies se limpien y el estado se resetee
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
      // Aún así limpiamos el estado local
      clearRoleCookie();
      clearAuthCookie();
      set({
        user: null,
        isAuthenticated: false,
        currentClient: null,
      });
      // Recargar la página incluso si hay error
      window.location.href = "/login";
    }
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  },
}));

// =============================================================================
// HOOKS DERIVADOS (para conveniencia)
// =============================================================================

/**
 * Hook para obtener solo el usuario actual
 */
export const useCurrentUser = () => useAuthStore((state) => state.user);

/**
 * Hook para obtener solo el rol actual
 */
export const useCurrentRole = () => useAuthStore((state) => state.user?.role ?? null);

/**
 * Hook para verificar si está autenticado
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

/**
 * Hook para obtener el estado de carga
 */
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
