/**
 * Store de sesión con Zustand
 * Maneja el estado global de datos de sesión, clientes y workspaces
 */

import { create } from "zustand";
import type { SessionData, ClientWithWorkspaces, WorkspaceData } from "@/types/session";
import { SessionService } from "@/lib/session-service";
import { getSessionData } from "@/lib/api-client";

// =============================================================================
// TIPOS DEL STORE
// =============================================================================

interface SessionState {
  // Estado
  sessionData: SessionData | null;
  isLoading: boolean;
  error: string | null;
}

interface SessionActions {
  // Obtener datos de sesión desde el endpoint
  fetchSession: () => Promise<void>;

  // Limpiar datos de sesión
  clearSession: () => void;

  // Actualizar cliente por defecto (solo local, no persiste en servidor)
  setDefaultClient: (clientId: string) => void;

  // Actualizar workspace por defecto (solo local, no persiste en servidor)
  setDefaultWorkspace: (workspaceId: string) => void;
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
export const sessionStore = create<SessionStore>((set, get) => ({
  // Estado inicial
  sessionData: null,
  isLoading: false,
  error: null,

  // Obtener datos de sesión
  fetchSession: async () => {
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

  // Limpiar sesión
  clearSession: () => {
    set({
      sessionData: null,
      error: null,
      isLoading: false,
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
}));

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
