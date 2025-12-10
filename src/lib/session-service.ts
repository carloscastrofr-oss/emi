/**
 * Servicio para trabajar con datos de sesión
 * Proporciona métodos helper para obtener clientes, workspaces y configuraciones por defecto
 */

import type { ClientWithWorkspaces, WorkspaceData, SessionData } from "@/types/session";

// =============================================================================
// SESSION SERVICE
// =============================================================================

export class SessionService {
  /**
   * Obtiene el cliente por defecto de una lista de clientes
   */
  static getDefaultClient(
    clients: ClientWithWorkspaces[],
    defaultClientId: string | null
  ): ClientWithWorkspaces | null {
    if (!defaultClientId || clients.length === 0) {
      return clients.length > 0 ? (clients[0] ?? null) : null;
    }

    const client = clients.find((c) => c.id === defaultClientId);
    return client ?? (clients.length > 0 ? (clients[0] ?? null) : null);
  }

  /**
   * Obtiene el workspace por defecto dentro de un cliente
   */
  static getDefaultWorkspace(
    client: ClientWithWorkspaces | null,
    defaultWorkspaceId: string | null
  ): WorkspaceData | null {
    if (!client || !client.workspaces || client.workspaces.length === 0) {
      return null;
    }

    if (!defaultWorkspaceId) {
      return client.workspaces[0] ?? null;
    }

    const workspace = client.workspaces.find((w) => w.id === defaultWorkspaceId);
    return workspace ?? (client.workspaces.length > 0 ? (client.workspaces[0] ?? null) : null);
  }

  /**
   * Obtiene un cliente por su ID
   */
  static getClientById(
    clients: ClientWithWorkspaces[],
    clientId: string
  ): ClientWithWorkspaces | null {
    return clients.find((c) => c.id === clientId) ?? null;
  }

  /**
   * Obtiene un workspace por su ID dentro de un cliente
   */
  static getWorkspaceById(
    client: ClientWithWorkspaces | null,
    workspaceId: string
  ): WorkspaceData | null {
    if (!client || !client.workspaces) {
      return null;
    }

    return client.workspaces.find((w) => w.id === workspaceId) ?? null;
  }

  /**
   * Obtiene el cliente y workspace actuales desde los datos de sesión
   */
  static getCurrentContext(sessionData: SessionData | null): {
    client: ClientWithWorkspaces | null;
    workspace: WorkspaceData | null;
  } {
    if (!sessionData) {
      return { client: null, workspace: null };
    }

    const client = this.getDefaultClient(sessionData.clients, sessionData.defaultClient);
    const workspace = this.getDefaultWorkspace(client, sessionData.defaultWorkspace);

    return { client, workspace };
  }

  /**
   * Valida que los datos de sesión tengan la estructura correcta
   */
  static validateSessionData(data: unknown): data is SessionData {
    if (!data || typeof data !== "object") {
      return false;
    }

    const sessionData = data as Partial<SessionData>;

    // Validar que tenga user
    if (!sessionData.user || typeof sessionData.user !== "object") {
      return false;
    }

    // Validar que tenga clients (array)
    if (!Array.isArray(sessionData.clients)) {
      return false;
    }

    return true;
  }
}
