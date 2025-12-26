/**
 * Configuración centralizada para middleware
 * Evita duplicación entre middleware.ts y otros lugares
 */

import type { Role, SidebarTab } from "@/types/auth";
import { tabPermissionsByRole } from "@/config/auth";

/**
 * Nombres de las cookies (deben coincidir con auth-cookies.ts)
 * NOTA: En Edge Runtime no podemos importar de auth-cookies.ts directamente
 * así que duplicamos los nombres aquí para evitar problemas
 */
export const ROLE_COOKIE_NAME = "emi_role";
export const AUTH_COOKIE_NAME = "emi_auth";

/**
 * Mapeo de rutas a tabs del sidebar
 */
export const routeToTab: Record<string, SidebarTab> = {
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
 * Permisos por rol (re-exportado desde config/auth.ts para consistencia)
 */
export const tabPermissionsByRoleConfig = tabPermissionsByRole;

/**
 * Obtiene el primer tab permitido para un rol
 * Si role es null (superAdmin), retorna "dashboard"
 */
export function getFirstAllowedTab(role: Role | null): SidebarTab {
  if (role === null) {
    // superAdmin por defecto va al dashboard
    return "dashboard";
  }
  return tabPermissionsByRole[role]?.[0] ?? "kit";
}

/**
 * Obtiene la ruta del primer tab permitido para un rol
 * Exportado para uso en middleware
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

/**
 * Rutas públicas que no requieren autenticación
 */
export const PUBLIC_ROUTES: readonly string[] = [
  "/login",
  "/forbidden",
  "/no-access",
  "/auth-loading",
] as const;

/**
 * Rutas que deben ser ignoradas por el middleware (estáticas, API, etc.)
 */
export function isIgnoredRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_ROUTES.includes(pathname)
  );
}
