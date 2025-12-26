/**
 * Store de sesión con Zustand
 * Maneja el estado global de datos de sesión, clientes y workspaces
 * Incluye persistencia en localStorage y cache con revalidación automática
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SessionData, ClientWithWorkspaces, WorkspaceData } from "@/types/session";
import { SessionService } from "@/lib/session-service";
import { getSessionData, updateSessionDefaults } from "@/lib/api-client";
import { setRoleCookie } from "@/lib/auth-cookies";
import type { SessionUser } from "@/types/auth";
import { hasUserAccess, applyDebugRoleOverride } from "@/lib/session-helpers";

/**
 * Tiempo de cache (TTL) para datos de sesión
 *
 * Recomendaciones por entorno:
 * - Desarrollo: 1-2 minutos (para testing rápido)
 * - Producción: 15-30 minutos (balance entre performance y frescura)
 *
 * Notas:
 * - Los datos de sesión (perfil, permisos, clientes, workspaces) cambian poco frecuentemente
 * - Los middlewares protegen las rutas, así que datos ligeramente desactualizados son aceptables
 * - Un TTL más largo reduce carga en el servidor y mejora la experiencia de usuario
 * - Si un usuario pierde acceso, se reflejará en la próxima revalidación o en el siguiente login
 */
const SESSION_CACHE_TTL = (() => {
  const env = process.env.NODE_ENV;

  // Desarrollo: 2 minutos para facilitar testing
  if (env === "development") {
    return 2 * 60 * 1000; // 2 minutos
  }

  // Producción: 15 minutos (recomendado para apps enterprise)
  // Puedes ajustar este valor según tus necesidades:
  // - 15 minutos: Balance óptimo para la mayoría de casos
  // - 30 minutos: Si los cambios de permisos son muy raros
  // - 5 minutos: Si necesitas datos más frescos (más carga en servidor)
  return 15 * 60 * 1000; // 15 minutos
})();

// =============================================================================
// TIPOS DEL STORE
// =============================================================================

/**
 * Estado de progreso granular para la carga de sesión
 * Usado por /auth-loading para mostrar el estado actual
 */
export type FetchProgress =
  | "idle"
  | "validating"
  | "loading-data"
  | "setting-cookies"
  | "complete"
  | "error";

/**
 * Mensajes correspondientes a cada estado de progreso
 */
export const FETCH_PROGRESS_MESSAGES: Record<FetchProgress, string> = {
  idle: "Iniciando...",
  validating: "Verificando sesión...",
  "loading-data": "Cargando permisos...",
  "setting-cookies": "Preparando tu espacio...",
  complete: "¡Listo!",
  error: "Error al cargar",
};

interface SessionState {
  // Estado
  sessionData: SessionData | null;
  isLoading: boolean;
  error: string | null;
  // Timestamp de última actualización para cache
  lastFetched: number | null;
  // Estado de progreso granular para UI de loading
  fetchProgress: FetchProgress;
}

interface SessionActions {
  // Obtener datos de sesión desde el endpoint
  fetchSession: (force?: boolean) => Promise<void>;

  // Revalidar datos si el cache está expirado
  revalidateIfNeeded: () => Promise<void>;

  // Limpiar datos de sesión
  clearSession: () => void;

  // Actualizar cliente por defecto (solo local, no persiste en servidor)
  setDefaultClient: (clientId: string) => void;

  // Actualizar workspace por defecto (solo local, no persiste en servidor)
  setDefaultWorkspace: (workspaceId: string) => void;

  // Actualizar defaults en el servidor y refrescar datos
  updateDefaults: (clientId: string, workspaceId: string) => Promise<void>;
}

interface SessionGetters {
  // Cliente por defecto
  defaultClient: ClientWithWorkspaces | null;

  // Workspace por defecto
  defaultWorkspace: WorkspaceData | null;

  // Cliente y workspace actuales
  currentClient: ClientWithWorkspaces | null;
  currentWorkspace: WorkspaceData | null;

  // Lista de todos los clientes
  allClients: ClientWithWorkspaces[];

  // Lista de todos los workspaces del cliente actual
  currentClientWorkspaces: WorkspaceData[];
}

type SessionStore = SessionState & SessionActions & SessionGetters;

// =============================================================================
// HELPERS
// =============================================================================
// Las funciones helper hasUserAccess y applyDebugRoleOverride están en @/lib/session-helpers
// para facilitar testing y reutilización

// =============================================================================
// STORE
// =============================================================================

// Store directo (para uso fuera de componentes React)
export const sessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      sessionData: null,
      isLoading: false,
      error: null,
      lastFetched: null,
      fetchProgress: "idle" as FetchProgress,

      // Obtener datos de sesión
      fetchSession: async (force = false) => {
        const fetchId = `fetch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log(`[Session Store] 🟢 fetchSession iniciado (${fetchId})`, {
          force,
          isLoading: get().isLoading,
          hasSessionData: !!get().sessionData,
          lastFetched: get().lastFetched,
        });

        // Verificar si estamos en proceso de logout antes de hacer cualquier petición
        // Importar auth-store dinámicamente para evitar dependencia circular
        try {
          const { useAuthStore } = await import("./auth-store");
          const authState = useAuthStore.getState();
          if (authState.isLoggingOut) {
            // Si estamos haciendo logout, no iniciar peticiones nuevas
            console.log(`[Session Store] 🟡 fetchSession cancelado por logout (${fetchId})`);
            return;
          }
        } catch {
          // Si hay error al importar, continuar (no crítico)
        }

        // Verificar si el cache está expirado
        const isCacheExpired = () => {
          const { lastFetched } = get();
          if (!lastFetched) return true;
          return Date.now() - lastFetched > SESSION_CACHE_TTL;
        };

        // Si no es forzado y tenemos datos frescos, no hacer nada
        if (!force && !isCacheExpired() && get().sessionData) {
          console.log(`[Session Store] ⚪ fetchSession omitido - cache válido (${fetchId})`);
          return;
        }

        // Evitar llamadas duplicadas
        if (get().isLoading) {
          console.log(
            `[Session Store] 🟡 fetchSession cancelado - ya hay una petición en curso (${fetchId})`
          );
          return;
        }

        console.log(`[Session Store] 🔵 fetchSession iniciando petición HTTP (${fetchId})`);
        set({ isLoading: true, error: null, fetchProgress: "validating" });

        try {
          // Paso 1: Validar y obtener datos
          set({ fetchProgress: "loading-data" });
          console.log(`[Session Store] 📡 Llamando a getSessionData() (${fetchId})`);
          const sessionData = await getSessionData();
          console.log(`[Session Store] ✅ getSessionData() completado exitosamente (${fetchId})`, {
            userId: sessionData.user.id,
            email: sessionData.user.email,
            role: sessionData.user.role,
            superAdmin: sessionData.user.superAdmin,
          });

          // Verificar si el usuario tiene acceso (rol global O acceso a clientes)
          if (!hasUserAccess(sessionData)) {
            // Usuario sin acceso - desloguear y redirigir a página especial
            set({
              sessionData: null,
              isLoading: false,
              error: null,
              lastFetched: null,
            });

            // Importar auth-store dinámicamente para evitar dependencia circular
            const { useAuthStore } = await import("./auth-store");
            await useAuthStore.getState().logout();

            // Redirigir a página de no acceso (se hace en logout, pero por si acaso)
            if (typeof window !== "undefined") {
              window.location.href = "/no-access";
            }
            return;
          }

          // Usuario tiene acceso - actualizar estado y cookie de rol
          // Paso 2: Configurar cookies
          set({ fetchProgress: "setting-cookies" });

          const userRole = sessionData.user.role;
          const isSuperAdmin = sessionData.user.superAdmin === true;
          const defaultClient = sessionData.defaultClient;
          const defaultWorkspace = sessionData.defaultWorkspace;

          // IMPORTANTE: Establecer la cookie de rol ANTES de aplicar cualquier override
          // El override solo afecta la UI, pero la cookie DEBE ser siempre el rol real de la BD
          // El rol activo viene del workspace/cliente por defecto, incluso para superAdmin
          if (userRole) {
            // Actualizar cookie de rol con el rol real de la BD (del workspace/cliente por defecto)
            setRoleCookie(userRole);

            // Log para debugging (solo en desarrollo)
            if (process.env.NODE_ENV === "development") {
              console.log("[Session Store] ✅ Rol recibido del endpoint y establecido en cookie:", {
                role: userRole,
                superAdmin: isSuperAdmin,
                defaultClient,
                defaultWorkspace,
                userId: sessionData.user.id,
                email: sessionData.user.email,
              });
            }
          } else if (isSuperAdmin) {
            // Si es superAdmin sin rol activo en el workspace/cliente por defecto,
            // establecer "admin" como cookie para el middleware
            // El middleware necesita un rol válido, pero la lógica de permisos se maneja en el código
            setRoleCookie("admin");

            // Log para debugging (solo en desarrollo)
            if (process.env.NODE_ENV === "development") {
              console.log(
                "[Session Store] ⚠️ Usuario superAdmin sin rol en workspace/cliente por defecto, estableciendo cookie 'admin' para middleware:",
                {
                  superAdmin: true,
                  defaultClient,
                  defaultWorkspace,
                  userId: sessionData.user.id,
                  email: sessionData.user.email,
                  nota: "El superAdmin tiene acceso total, pero el middleware necesita un rol válido",
                }
              );
            }
          } else {
            // Usuario sin rol y sin superAdmin - esto no debería pasar si hasUserAccess está funcionando correctamente
            console.warn("[Session Store] ⚠️ Usuario sin rol asignado y sin superAdmin:", {
              userId: sessionData.user.id,
              email: sessionData.user.email,
              superAdmin: isSuperAdmin,
              defaultClient,
              defaultWorkspace,
            });
          }

          // Aplicar override de debug si está activo (solo para UI del store)
          // El override solo afecta cómo se muestra el rol en la UI, NO las cookies ni middleware
          // IMPORTANTE: Esto se hace DESPUÉS de establecer la cookie
          const finalSessionData = applyDebugRoleOverride(sessionData, undefined);

          // Log para debugging si hay override activo
          if (process.env.NODE_ENV === "development") {
            if (finalSessionData.user.role !== userRole) {
              console.log("[Session Store] ⚠️ Debug override activo:", {
                rolOriginal: userRole,
                rolOverride: finalSessionData.user.role,
                nota: "El override solo afecta la UI, la cookie tiene el rol real",
              });
            }
          }

          // Paso 3: Completar
          set({
            sessionData: finalSessionData,
            isLoading: false,
            error: null,
            lastFetched: Date.now(),
            fetchProgress: "complete",
          });

          // Convertir SessionUserData a SessionUser para auth-store
          const sessionUser: SessionUser = {
            uid: finalSessionData.user.id,
            email: finalSessionData.user.email,
            displayName: finalSessionData.user.displayName || null,
            photoUrl: finalSessionData.user.photoUrl || null,
            role: finalSessionData.user.role, // Puede ser null si es superAdmin
            superAdmin: finalSessionData.user.superAdmin,
            permissions: [],
            emailVerified: finalSessionData.user.emailVerified,
            lastLoginAt: finalSessionData.user.lastLoginAt || new Date(),
            createdAt: finalSessionData.user.createdAt,
            preferences: finalSessionData.user.preferences || {
              theme: "system",
              language: "es",
              notifications: {
                email: true,
                push: true,
                inApp: true,
              },
            },
            onboarding: {
              completed: [],
              currentStep: undefined,
            },
          };

          // Actualizar usuario en auth-store para mantener sincronización
          const { useAuthStore } = await import("./auth-store");
          useAuthStore.getState().setUser(sessionUser);
        } catch (error) {
          // Si el error es por cancelación (AbortError o DOMException con name 'AbortError'),
          // no loggearlo como error - es normal cuando la página navega durante una petición
          const isAbortError =
            error instanceof Error &&
            (error.name === "AbortError" ||
              error.message.includes("canceled") ||
              error.message.includes("aborted"));

          if (isAbortError) {
            // Petición cancelada - probablemente porque la página está navegando
            // Solo resetear el estado de loading, no marcar como error
            console.log(`[Session Store] 🔴 fetchSession cancelado (AbortError) (${fetchId})`, {
              errorName: error instanceof Error ? error.name : "unknown",
              errorMessage: error instanceof Error ? error.message : String(error),
            });
            set({
              isLoading: false,
            });
            return;
          }

          const errorMessage =
            error instanceof Error ? error.message : "Error al obtener datos de sesión";
          console.error(`[Session Store] ❌ Error fetching session (${fetchId}):`, error);
          console.error(`[Session Store] Error details (${fetchId}):`, {
            message: errorMessage,
            error,
            errorName: error instanceof Error ? error.name : "unknown",
            errorStack: error instanceof Error ? error.stack : undefined,
            hasAuthCookie:
              typeof document !== "undefined" ? !!document.cookie.includes("emi_auth") : "N/A",
            currentUrl: typeof window !== "undefined" ? window.location.href : "N/A",
          });
          set({
            sessionData: null,
            isLoading: false,
            error: errorMessage,
            fetchProgress: "error",
          });
        }
      },

      // Revalidar si es necesario
      revalidateIfNeeded: async () => {
        const { lastFetched } = get();
        const isExpired = !lastFetched || Date.now() - lastFetched > SESSION_CACHE_TTL;
        if (isExpired) {
          await get().fetchSession(false);
        }
      },

      // Limpiar sesión
      clearSession: () => {
        set({
          sessionData: null,
          error: null,
          isLoading: false,
          lastFetched: null,
          fetchProgress: "idle",
        });

        // Limpiar cualquier dato persistido en localStorage relacionado con sesión
        try {
          if (typeof window !== "undefined") {
            localStorage.removeItem("emi-session-storage");
          }
        } catch (error) {
          console.warn("Error limpiando localStorage de sesión:", error);
        }
      },

      // Actualizar cliente por defecto (local)
      setDefaultClient: (clientId: string) => {
        const currentData = get().sessionData;
        if (!currentData) {
          console.warn("No hay datos de sesión para actualizar cliente por defecto");
          return;
        }

        set({
          sessionData: {
            ...currentData,
            defaultClient: clientId,
            // Si cambiamos de cliente, también actualizar el workspace por defecto al primero del nuevo cliente
            defaultWorkspace: (() => {
              const client = SessionService.getClientById(currentData.clients, clientId);
              return client?.workspaces?.[0]?.id || null;
            })(),
          },
        });
      },

      // Actualizar workspace por defecto (local)
      setDefaultWorkspace: (workspaceId: string) => {
        const currentData = get().sessionData;
        if (!currentData) {
          console.warn("No hay datos de sesión para actualizar workspace por defecto");
          return;
        }

        set({
          sessionData: {
            ...currentData,
            defaultWorkspace: workspaceId,
          },
        });
      },

      // Actualizar defaults en el servidor y refrescar datos
      updateDefaults: async (clientId: string, workspaceId: string) => {
        try {
          // Actualizar en el servidor
          await updateSessionDefaults(clientId, workspaceId);

          // Refrescar datos de sesión para obtener los nuevos defaults
          await get().fetchSession(true);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Error al actualizar los defaults";
          console.error("Error updating defaults:", error);
          throw new Error(errorMessage);
        }
      },

      // Getters derivados
      get defaultClient() {
        const { sessionData } = get();
        if (!sessionData) return null;
        return SessionService.getDefaultClient(sessionData.clients, sessionData.defaultClient);
      },

      get defaultWorkspace() {
        const { defaultClient, sessionData } = get();
        if (!sessionData || !defaultClient) return null;
        return SessionService.getDefaultWorkspace(defaultClient, sessionData.defaultWorkspace);
      },

      get currentClient() {
        return get().defaultClient;
      },

      get currentWorkspace() {
        return get().defaultWorkspace;
      },

      get allClients() {
        return get().sessionData?.clients || [];
      },

      get currentClientWorkspaces() {
        const currentClient = get().currentClient;
        return currentClient?.workspaces || [];
      },
    }),
    {
      name: "emi-session-storage",
      storage: createJSONStorage(() => localStorage),
      // Solo persistir sessionData y lastFetched, no isLoading ni error
      partialize: (state) => ({
        sessionData: state.sessionData,
        lastFetched: state.lastFetched,
      }),
      onRehydrateStorage: () => (state) => {
        // Revalidar datos si el cache está expirado al rehidratar
        if (state) {
          const isExpired =
            !state.lastFetched || Date.now() - state.lastFetched > SESSION_CACHE_TTL;
          if (isExpired && state.sessionData) {
            // Revalidar en background sin bloquear
            state.revalidateIfNeeded().catch((error) => {
              console.warn("Error revalidando sesión al rehidratar:", error);
            });
          }
        }
      },
    }
  )
);

// Hook para usar en componentes React (wrapper del store)
export const useSessionStore = sessionStore;

// =============================================================================
// HOOKS DERIVADOS (para conveniencia)
// =============================================================================

/**
 * Hook para obtener solo los datos de sesión
 */
export const useSessionData = () => useSessionStore((state) => state.sessionData);

/**
 * Hook para obtener el cliente actual
 */
export const useCurrentClient = () => useSessionStore((state) => state.currentClient);

/**
 * Hook para obtener el workspace actual
 */
export const useCurrentWorkspace = () => useSessionStore((state) => state.currentWorkspace);

/**
 * Hook para obtener el estado de carga
 */
export const useSessionLoading = () => useSessionStore((state) => state.isLoading);

/**
 * Hook para obtener el error de sesión
 */
export const useSessionError = () => useSessionStore((state) => state.error);

/**
 * Hook para revalidar sesión si es necesario
 * Útil para llamar en componentes que necesitan datos frescos
 */
export const useRevalidateSession = () => {
  const revalidateIfNeeded = useSessionStore((state) => state.revalidateIfNeeded);
  return revalidateIfNeeded;
};

/**
 * Hook para forzar actualización de sesión
 */
export const useRefreshSession = () => {
  const fetchSession = useSessionStore((state) => state.fetchSession);
  return () => fetchSession(true);
};

/**
 * Hook para obtener el progreso de carga de sesión
 * Útil para mostrar estados de carga en UI
 */
export const useFetchProgress = () => useSessionStore((state) => state.fetchProgress);

/**
 * Hook para obtener el mensaje de progreso actual
 */
export const useFetchProgressMessage = () => {
  const progress = useSessionStore((state) => state.fetchProgress);
  return FETCH_PROGRESS_MESSAGES[progress];
};
