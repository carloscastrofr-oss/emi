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
