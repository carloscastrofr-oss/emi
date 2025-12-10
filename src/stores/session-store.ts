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

interface SessionState {
  // Estado
  sessionData: SessionData | null;
  isLoading: boolean;
  error: string | null;
  // Timestamp de última actualización para cache
  lastFetched: number | null;
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

      // Obtener datos de sesión
      fetchSession: async (force = false) => {
        // Verificar si el cache está expirado
        const isCacheExpired = () => {
          const { lastFetched } = get();
          if (!lastFetched) return true;
          return Date.now() - lastFetched > SESSION_CACHE_TTL;
        };

        // Si no es forzado y tenemos datos frescos, no hacer nada
        if (!force && !isCacheExpired() && get().sessionData) {
          return;
        }

        // Evitar llamadas duplicadas
        if (get().isLoading) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const sessionData = await getSessionData();
          set({
            sessionData,
            isLoading: false,
            error: null,
            lastFetched: Date.now(),
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Error al obtener datos de sesión";
          console.error("Error fetching session:", error);
          set({
            sessionData: null,
            isLoading: false,
            error: errorMessage,
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
