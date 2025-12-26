/**
 * Funciones helper para autenticación y permisos
 */

import type { Role, SidebarTab, SidebarTabConfig, SessionUser, Permission } from "@/types/auth";
import { roleHierarchy, tabPermissionsByRole, sidebarTabsConfig } from "@/config/auth";

// =============================================================================
// ROLES
// =============================================================================

/**
 * Verifica si un rol tiene al menos el nivel de otro rol
 */
export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Obtiene el rol más alto entre varios
 * @throws Error si el array está vacío
 */
export function getHighestRole(userRoles: Role[]): Role {
  if (userRoles.length === 0) {
    throw new Error("Cannot get highest role from empty array");
  }
  const firstRole = userRoles[0] as Role;
  return userRoles.reduce(
    (highest, current) => (roleHierarchy[current] > roleHierarchy[highest] ? current : highest),
    firstRole
  );
}

// =============================================================================
// PERMISOS
// =============================================================================

/**
 * Verifica si un usuario tiene un permiso específico
 * Los superAdmin tienen todos los permisos por defecto
 */
export function hasPermission(user: SessionUser | null, permission: Permission): boolean {
  if (!user) return false;
  if (user.superAdmin === true) return true;
  return user.permissions?.includes(permission) ?? false;
}

// =============================================================================
// TABS / NAVEGACIÓN
// =============================================================================

/**
 * Verifica si un rol tiene acceso a una tab específica
 * Si role es null (superAdmin), retorna true (acceso a todas las tabs)
 */
export function canAccessTab(role: Role | null, tab: SidebarTab): boolean {
  if (role === null) return true; // superAdmin tiene acceso a todas las tabs
  return tabPermissionsByRole[role]?.includes(tab) ?? false;
}

/**
 * Obtiene las tabs permitidas para un rol
 * Si role es null (superAdmin), retorna todas las tabs
 */
export function getAllowedTabs(role: Role | null): SidebarTab[] {
  if (role === null) {
    // superAdmin tiene acceso a todas las tabs
    return sidebarTabsConfig.map((tab) => tab.id);
  }
  return tabPermissionsByRole[role] ?? [];
}

/**
 * Obtiene la configuración completa de tabs permitidas para un rol
 * Si role es null (superAdmin), retorna todas las tabs configuradas
 */
export function getAllowedTabsConfig(role: Role | null): SidebarTabConfig[] {
  if (role === null) {
    // superAdmin tiene acceso a todas las tabs
    return sidebarTabsConfig;
  }
  const allowedTabs = getAllowedTabs(role);
  return sidebarTabsConfig.filter((tab) => allowedTabs.includes(tab.id));
}

/**
 * Mapeo de rutas a tabs del sidebar (debe coincidir con middleware.ts)
 */
const routeToTab: Record<string, SidebarTab> = {
  "/dashboard": "dashboard",
  "/kit": "kit",
  "/ai-writing": "ai_writing",
  "/ai-flow": "ai_flow",
  "/ai-toolkit": "ai_toolkit",
  "/workbench": "workbench",
  "/observer": "observer",
  "/risk": "risk",
  "/synthetic-users": "synthetic_users",
  "/strategy": "strategy",
  "/changelog": "changelog",
  "/labs": "labs",
  "/agent": "agent",
  "/onboarding": "onboarding",
};

/**
 * Obtiene el primer tab permitido para un rol
 * Si role es null (superAdmin), retorna "dashboard" como tab por defecto
 */
function getFirstAllowedTab(role: Role | null): SidebarTab {
  if (role === null) {
    // superAdmin por defecto va al dashboard
    return "dashboard";
  }
  const allowedTabs = getAllowedTabs(role);
  return allowedTabs[0] ?? "kit";
}

/**
 * Obtiene la ruta del primer tab permitido para un rol
 * Esta es la ruta a la que se debe redirigir después del login
 * Si role es null (superAdmin), retorna "/dashboard"
 */
export function getFirstAllowedRoute(role: Role | null): string {
  const tab = getFirstAllowedTab(role);
  // Buscar la ruta que corresponde a este tab
  for (const [route, tabId] of Object.entries(routeToTab)) {
    if (tabId === tab) return route;
  }
  return "/kit"; // Fallback
}
