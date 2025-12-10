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
import {
  setRoleCookie,
  clearRoleCookie,
  setAuthCookie,
  clearAuthCookie,
  getAuthCookie,
  isTokenExpired,
} from "@/lib/auth-cookies";
import { sessionStore } from "./session-store";

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

  // Verificar y renovar token si es necesario
  checkAndRefreshToken: () => Promise<void>;

  // Actualizar usuario manualmente
  setUser: (user: SessionUser | null) => void;

  // Actualizar rol (útil para testing)
  setRole: (role: Role) => void;

  // Logout
  logout: () => Promise<void>;

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

          // Obtener datos de sesión después de autenticación exitosa
          // Usar revalidateIfNeeded para no hacer llamadas innecesarias si hay cache válido
          try {
            await sessionStore.getState().revalidateIfNeeded();
            // Si no hay datos en cache, hacer fetch forzado
            if (!sessionStore.getState().sessionData) {
              await sessionStore.getState().fetchSession(true);
            }
          } catch (error) {
            console.error("Error fetching session data:", error);
            // No fallar la autenticación si falla la sesión, solo loggear
          }
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
        sessionStore.getState().clearSession(); // Limpiar datos de sesión
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
    // También maneja el caso cuando Firebase hace logout automático (token revocado, etc.)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _unsubscribeToken = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obtener el nuevo token (forzar renovación si es necesario)
          const idToken = await getIdToken(firebaseUser, true);
          setAuthCookie(idToken);
        } catch (error) {
          console.error("Error refreshing ID token:", error);
          // Si no podemos obtener el token, el usuario podría haber sido deshabilitado
          // Firebase Auth manejará esto automáticamente, pero limpiamos nuestro estado
          clearAuthCookie();
          clearRoleCookie();
          sessionStore.getState().clearSession();
        }
      } else {
        // Token revocado o usuario deslogueado
        // Firebase Auth ya notificó a onAuthStateChanged, pero limpiamos cookies también
        clearAuthCookie();
        clearRoleCookie();
        sessionStore.getState().clearSession();
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

  // Verificar y renovar token si es necesario
  checkAndRefreshToken: async () => {
    if (!isAuthAvailable() || !auth || !get().isAuthenticated) {
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      // Usuario no autenticado, limpiar todo
      get().logout();
      return;
    }

    const token = getAuthCookie();
    if (!token) {
      // No hay token en cookie, obtener uno nuevo
      try {
        const idToken = await getIdToken(currentUser, false);
        setAuthCookie(idToken);
      } catch (error) {
        console.error("Error getting new token:", error);
        get().logout();
      }
      return;
    }

    // Verificar si el token está expirado o cerca de expirar
    if (isTokenExpired(token, 60)) {
      // Token expirado o cerca de expirar, renovar
      try {
        const idToken = await getIdToken(currentUser, true); // Forzar renovación
        setAuthCookie(idToken);
      } catch (error) {
        console.error("Error refreshing expired token:", error);
        // Si no podemos renovar, hacer logout
        get().logout();
      }
    }
  },

  // Logout
  logout: async () => {
    // Limpiar datos de sesión primero
    sessionStore.getState().clearSession();

    // Limpiar localStorage de stores que persisten datos
    try {
      if (typeof window !== "undefined") {
        // Limpiar debug store
        localStorage.removeItem("emi-debug-storage");
        // Limpiar preferences store si existe
        localStorage.removeItem("emi-preferences-storage");
        // Limpiar cualquier otro dato de sesión
        localStorage.removeItem("emi-session-storage");
      }
    } catch (error) {
      console.warn("Error limpiando localStorage:", error);
    }

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

/**
 * Hook para verificar y renovar token
 * Útil para llamar antes de operaciones críticas o periódicamente
 */
export const useCheckAndRefreshToken = () => {
  const checkAndRefreshToken = useAuthStore((state) => state.checkAndRefreshToken);
  return checkAndRefreshToken;
};
