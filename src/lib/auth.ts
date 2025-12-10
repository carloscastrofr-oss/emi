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
 * Los super_admin tienen todos los permisos por defecto
 */
export function hasPermission(user: SessionUser | null, permission: Permission): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return user.permissions?.includes(permission) ?? false;
}

// =============================================================================
// TABS / NAVEGACIÓN
// =============================================================================

/**
 * Verifica si un rol tiene acceso a una tab específica
 */
export function canAccessTab(role: Role, tab: SidebarTab): boolean {
  return tabPermissionsByRole[role]?.includes(tab) ?? false;
}

/**
 * Obtiene las tabs permitidas para un rol
 */
export function getAllowedTabs(role: Role): SidebarTab[] {
  return tabPermissionsByRole[role] ?? [];
}

/**
 * Obtiene la configuración completa de tabs permitidas para un rol
 */
export function getAllowedTabsConfig(role: Role): SidebarTabConfig[] {
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
 */
function getFirstAllowedTab(role: Role): SidebarTab {
  const allowedTabs = getAllowedTabs(role);
  return allowedTabs[0] ?? "kit";
}

/**
 * Obtiene la ruta del primer tab permitido para un rol
 * Esta es la ruta a la que se debe redirigir después del login
 */
export function getFirstAllowedRoute(role: Role): string {
  const tab = getFirstAllowedTab(role);
  // Buscar la ruta que corresponde a este tab
  for (const [route, tabId] of Object.entries(routeToTab)) {
    if (tabId === tab) return route;
  }
  return "/kit"; // Fallback
}
