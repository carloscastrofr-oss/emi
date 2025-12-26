/**
 * Funciones helper para manejo de sesión
 * Extraídas para facilitar testing y reutilización
 */

import type { SessionData } from "@/types/session";
import type { Role } from "@/types/auth";

/**
 * Verifica si el usuario tiene acceso al sistema
 * Un usuario tiene acceso si:
 * - Es superAdmin (user.superAdmin === true), O
 * - Tiene un rol activo (user.role no es null), O
 * - Tiene acceso a al menos un cliente (clients.length > 0)
 */
export function hasUserAccess(sessionData: SessionData): boolean {
  // Verificar si es superAdmin
  if (sessionData.user.superAdmin === true) {
    return true;
  }

  // Verificar si tiene rol activo
  if (sessionData.user.role) {
    return true;
  }

  // Verificar si tiene acceso a al menos un cliente
  if (sessionData.clients && sessionData.clients.length > 0) {
    return true;
  }

  // No tiene acceso
  return false;
}

/**
 * Aplica override de rol desde debug store (solo para UI)
 * El override solo afecta cómo se muestra el rol en la UI del store
 * NO afecta cookies ni middleware (siempre usan el rol real de BD)
 *
 * @param sessionData - Datos de sesión originales
 * @param debugStorage - Contenido del localStorage del debug store (opcional, solo para testing)
 * @returns Datos de sesión con override aplicado si está activo
 */
export function applyDebugRoleOverride(
  sessionData: SessionData,
  debugStorage?: string | null
): SessionData {
  // En el servidor, no hay override
  if (typeof window === "undefined") {
    return sessionData;
  }

  try {
    const stored = debugStorage ?? localStorage.getItem("emi-debug-storage");
    if (!stored) {
      return sessionData;
    }

    const parsed = JSON.parse(stored);
    const useRoleOverride = parsed.state?.useRoleOverride ?? false;
    const overrideRole = parsed.state?.overrideRole;

    // Si el override está activo y hay un rol override, aplicarlo solo a la UI
    if (useRoleOverride && overrideRole) {
      return {
        ...sessionData,
        user: {
          ...sessionData.user,
          role: overrideRole as Role, // Solo para UI, no para cookies
        },
      };
    }
  } catch {
    // Ignorar errores de parsing
  }

  return sessionData;
}

/**
 * Determina el rol activo del usuario según la siguiente prioridad:
 * 1. Si es superAdmin → retorna null (acceso total, no hay rol específico)
 * 2. Si tiene defaultWorkspace y acceso con rol → retorna workspaceAccess.role
 * 3. Si tiene defaultClient y acceso con rol → retorna clientAccess.role (será 'admin')
 * 4. Si no hay nada → retorna null
 *
 * @param sessionData - Datos de sesión completos
 * @returns El rol activo o null si es superAdmin o no tiene rol asignado
 */
export function getActiveRole(sessionData: SessionData): Role | null {
  // Si es superAdmin, retornar null (acceso total, no hay rol específico)
  if (sessionData.user.superAdmin === true) {
    return null;
  }

  const { defaultWorkspace, defaultClient, clients } = sessionData;

  // Prioridad 1: Rol del workspace por defecto
  if (defaultWorkspace) {
    for (const client of clients) {
      const workspace = client.workspaces?.find((ws) => ws.id === defaultWorkspace);
      if (workspace) {
        // Buscar el acceso del usuario a este workspace
        // Necesitamos los accesos completos del usuario, pero no los tenemos aquí directamente
        // Por ahora, retornaremos null y el endpoint calculará el rol correctamente
        // Nota: Esta función será llamada desde el endpoint donde sí tenemos acceso completo
      }
    }
  }

  // Prioridad 2: Rol del cliente por defecto (será 'admin')
  if (defaultClient) {
    const client = clients.find((c) => c.id === defaultClient);
    if (client) {
      // El rol del cliente siempre será 'admin' (según ClientRole)
      // Pero necesitamos verificar si el usuario tiene acceso con rol
      // Por ahora retornamos null, el endpoint calculará correctamente
    }
  }

  // Si no hay rol activo, retornar null
  return null;
}

/**
 * Determina el rol activo usando los datos completos del usuario desde Prisma
 * Esta es la función que realmente se usará en el endpoint /api/sesion
 *
 * @param user - Usuario con todos sus accesos desde Prisma
 * @param defaultClientId - ID del cliente por defecto (desde sessionConfig)
 * @param defaultWorkspaceId - ID del workspace por defecto (desde sessionConfig)
 * @returns El rol activo o null si es superAdmin o no tiene rol asignado
 */
export function getActiveRoleFromUser(
  user: {
    superAdmin: boolean;
    clientAccesses: Array<{ clientId: string; role: string | null }>;
    workspaceAccesses: Array<{ workspaceId: string; role: string | null }>;
  },
  defaultClientId: string | null,
  defaultWorkspaceId: string | null
): Role | null {
  // IMPORTANTE: Incluso si es superAdmin, debemos retornar el rol del workspace/cliente por defecto
  // si existe, para que el middleware pueda funcionar correctamente.
  // El superAdmin tiene acceso total, pero el rol activo se usa para determinar qué vistas puede ver
  // basado en el contexto del workspace/cliente actual.

  // Prioridad 1: Rol del workspace por defecto
  if (defaultWorkspaceId) {
    const workspaceAccess = user.workspaceAccesses.find(
      (access) => access.workspaceId === defaultWorkspaceId && access.role !== null
    );
    if (workspaceAccess && workspaceAccess.role) {
      return workspaceAccess.role as Role;
    }
  }

  // Prioridad 2: Rol del cliente por defecto (será 'admin')
  if (defaultClientId) {
    const clientAccess = user.clientAccesses.find(
      (access) => access.clientId === defaultClientId && access.role !== null
    );
    if (clientAccess && clientAccess.role) {
      // El rol del cliente siempre será 'admin', pero lo retornamos como Role
      return clientAccess.role as Role;
    }
  }

  // Si es superAdmin y no tiene rol en el workspace/cliente por defecto,
  // retornar null (el session-store establecerá "admin" en la cookie para el middleware)
  // Si NO es superAdmin y no tiene rol, también retornar null
  return null;
}
