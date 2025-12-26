/**
 * Checks modulares para middleware
 * Funciones reutilizables para verificación de autenticación y permisos
 */

import type { Role } from "@/types/auth";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import {
  ROLE_COOKIE_NAME,
  AUTH_COOKIE_NAME,
  routeToTab,
  tabPermissionsByRoleConfig,
  isIgnoredRoute,
  getFirstAllowedRoute,
} from "./config";

// Re-export para uso en middleware
export { getFirstAllowedRoute };

/**
 * Tipo para cookies del request (compatible con Next.js middleware)
 */
type RequestCookies = {
  get: (name: string) => RequestCookie | undefined;
};

/**
 * Verifica si existe cookie de autenticación (token)
 */
export function checkAuthToken(cookies: RequestCookies): boolean {
  const authCookie = cookies.get(AUTH_COOKIE_NAME);
  return !!authCookie?.value && authCookie.value !== "";
}

/**
 * Obtiene el rol desde la cookie (si existe)
 * Nota: Si el usuario es superAdmin, la cookie de rol puede ser null o no estar presente
 */
export function checkRole(cookies: RequestCookies): Role | null {
  const roleCookie = cookies.get(ROLE_COOKIE_NAME);
  const role = roleCookie?.value as Role | undefined;
  if (!role) return null;

  // Validar que el rol sea válido (super_admin ya no es un rol válido)
  const validRoles: Role[] = ["ux_ui_designer", "product_designer", "product_design_lead", "admin"];
  return validRoles.includes(role) ? role : null;
}

/**
 * Verifica si una ruta es pública o debe ser ignorada
 */
export function checkPublicRoute(pathname: string): boolean {
  return isIgnoredRoute(pathname);
}

/**
 * Verifica si un rol tiene acceso a una ruta específica
 * Si role es null (superAdmin), retorna true (acceso total)
 */
export function checkRouteAccess(role: Role | null, pathname: string): boolean {
  // Si role es null (superAdmin), permitir acceso a todas las rutas
  if (role === null) return true;

  // Encontrar la ruta base (sin subrutas)
  const baseRoute = "/" + pathname.split("/").filter(Boolean)[0];
  const tab = routeToTab[baseRoute];

  // Si no es una ruta protegida (no está en routeToTab), permitir
  if (!tab) return true;

  // Verificar si el rol tiene acceso a este tab
  return tabPermissionsByRoleConfig[role]?.includes(tab) ?? false;
}
