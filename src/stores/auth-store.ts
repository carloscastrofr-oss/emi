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
  clearRoleCookie,
  setAuthCookie,
  clearAuthCookie,
  getAuthCookie,
  isTokenExpired,
} from "@/lib/auth-cookies";
import { sessionStore } from "./session-store";

// =============================================================================
// TIPOS DEL STORE
// =============================================================================

interface AuthState {
  // Estado
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  isLoggingOut: boolean;

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
// STORE
// =============================================================================

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Estado inicial
  isLoading: true,
  isInitialized: false,
  isAuthenticated: false,
  isLoggingOut: false,
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

    // Función helper para actualizar el estado del usuario cuando Firebase notifica cambios
    // Esta función corre en BACKGROUND después de que la app ya se mostró
    // Solo actualiza si hay cambios reales (ej: token revocado, usuario deshabilitado)
    const updateUserState = async (firebaseUser: FirebaseUser | null) => {
      // Si estamos en proceso de logout, no hacer nada
      if (get().isLoggingOut) return;

      if (firebaseUser) {
        // Usuario autenticado en Firebase - actualizar token en cookie
        try {
          const idToken = await getIdToken(firebaseUser, false);
          setAuthCookie(idToken);

          // Solo actualizar estado si no estaba autenticado antes
          // Esto evita re-renders innecesarios
          if (!get().isAuthenticated) {
            set({
              isAuthenticated: true,
              isInitialized: true,
              error: null,
            });
          }

          // Obtener datos de sesión en background si no los tenemos
          const sessionData = sessionStore.getState().sessionData;
          if (!sessionData && !get().isLoggingOut) {
            sessionStore
              .getState()
              .fetchSession(false)
              .catch((error) => {
                const isAbortError =
                  error instanceof Error &&
                  (error.name === "AbortError" ||
                    error.message.includes("canceled") ||
                    error.message.includes("aborted"));
                if (!isAbortError) {
                  console.warn("[Auth Store] Background fetchSession error:", error);
                }
              });
          }
        } catch (error) {
          console.error("Error getting ID token:", error);
          // Token inválido - limpiar todo y redirigir
          clearRoleCookie();
          clearAuthCookie();
          sessionStore.getState().clearSession();
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            error: error instanceof Error ? error.message : "Error de autenticación",
          });
          // Redirigir a login
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      } else {
        // Usuario no autenticado en Firebase
        // Solo actuar si TENÍAMOS una sesión activa (evitar limpiar en cold start)
        const wasAuthenticated = get().isAuthenticated;
        clearRoleCookie();
        clearAuthCookie();
        sessionStore.getState().clearSession();
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
          error: null,
        });
        // Solo redirigir si el usuario estaba autenticado antes
        if (wasAuthenticated && typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    };

    // OPTIMIZACIÓN CRÍTICA: No esperar a Firebase Auth para mostrar la app
    // Establecer estado inmediatamente basado en la cookie existente
    // Firebase Auth corregirá el estado si es necesario (token inválido, etc.)
    const authCookie = getAuthCookie();
    if (!authCookie) {
      // No hay cookie de token - usuario no autenticado
      clearRoleCookie();
      clearAuthCookie();
      sessionStore.getState().clearSession();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } else {
      // Hay cookie de token - CONFIAR en la cookie y mostrar app inmediatamente
      // Este es el patrón estándar: la cookie es la fuente de verdad inicial
      // Firebase Auth confirmará en background; si el token es inválido, corregirá
      set({
        isAuthenticated: true,
        isLoading: false, // NO bloquear la UI esperando Firebase
        isInitialized: true, // Marcar como inicializado INMEDIATAMENTE
        error: null,
      });

      // Iniciar fetchSession en background (no bloquear)
      // Si la sesión ya está en cache, no hará nada
      sessionStore
        .getState()
        .fetchSession(false)
        .catch((error) => {
          console.warn("[Auth Store] Background fetchSession error:", error);
        });
    }

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

  // Actualizar usuario (usado desde session-store después de obtener datos de /api/sesion)
  setUser: (user) => {
    // Si hay cookie de token, mantener isAuthenticated como true incluso si user es null
    // (puede ser que el token exista pero fetchSession aún no haya completado)
    const hasToken = getAuthCookie();
    set({
      user,
      isAuthenticated: !!user || !!hasToken,
    });
  },

  // Cambiar rol (útil para testing desde devtools)
  // NOTA: Esta función ya no debería usarse normalmente, el rol viene de BD
  setRole: (role) => {
    const currentUser = get().user;
    if (currentUser) {
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
    // Marcar como logging out inmediatamente para feedback visual
    set({ isLoggingOut: true });

    // Limpiar datos de sesión primero
    sessionStore.getState().clearSession();

    // Limpiar TODO el localStorage (flush completo) - hacer esto primero para feedback inmediato
    try {
      if (typeof window !== "undefined") {
        // Limpiar todos los items que empiezan con "emi-"
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("emi-")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        // También limpiar items conocidos por si acaso
        localStorage.removeItem("emi-debug-storage");
        localStorage.removeItem("emi-preferences-storage");
        localStorage.removeItem("emi-session-storage");
        localStorage.removeItem("emi-loading-preferences-storage");
      }
    } catch (error) {
      console.warn("Error limpiando localStorage:", error);
    }

    // Limpiar cookies y estado inmediatamente
    clearRoleCookie();
    clearAuthCookie();
    set({
      user: null,
      isAuthenticated: false,
      currentClient: null,
    });

    // Intentar hacer signOut de Firebase, pero con timeout para evitar delays
    // Si Firebase Auth no está disponible o tarda mucho, simplemente redirigir
    if (!isAuthAvailable() || !auth) {
      // Si Firebase Auth no está disponible, redirigir inmediatamente
      window.location.href = "/login";
      return;
    }

    // Intentar hacer signOut con timeout de 2 segundos máximo
    // Si tarda más, simplemente redirigir (ya limpiamos todo)
    try {
      const signOutPromise = firebaseSignOut(auth);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 2000)
      );

      await Promise.race([signOutPromise, timeoutPromise]);
    } catch (error) {
      // Si hay error o timeout, no importa - ya limpiamos todo
      // Solo loggear en desarrollo
      if (process.env.NODE_ENV === "development") {
        console.warn("SignOut timeout o error (no crítico):", error);
      }
    }

    // Redirigir inmediatamente después de limpiar todo
    // No esperar más - ya limpiamos cookies, localStorage y estado
    window.location.href = "/login";
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
