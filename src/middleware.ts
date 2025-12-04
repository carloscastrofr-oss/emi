/**
 * Middleware de Next.js para protección de rutas
 * Verifica que el usuario tenga permiso para acceder a cada ruta
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Role, SidebarTab } from "@/types/auth";

// Nombre de la cookie de rol (debe coincidir con auth-cookies.ts)
const ROLE_COOKIE_NAME = "emi_role";

// Mapeo de rutas a tabs del sidebar
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

// Permisos por rol (debe coincidir con config/auth.ts)
// Duplicado aquí porque el middleware corre en edge runtime
const tabPermissionsByRole: Record<Role, SidebarTab[]> = {
  ux_ui_designer: ["kit", "ai_writing", "ai_flow", "workbench", "strategy"],
  product_designer: ["kit", "ai_writing", "ai_flow", "workbench", "strategy"],
  product_design_lead: ["kit", "ai_writing", "ai_flow", "workbench", "strategy"],
  admin: [
    "dashboard",
    "kit",
    "ai_writing",
    "ai_flow",
    "ai_toolkit",
    "workbench",
    "observer",
    "risk",
    "synthetic_users",
    "strategy",
    "changelog",
    "labs",
    "agent",
    "onboarding",
  ],
  super_admin: [
    "dashboard",
    "kit",
    "ai_writing",
    "ai_flow",
    "ai_toolkit",
    "workbench",
    "observer",
    "risk",
    "synthetic_users",
    "strategy",
    "changelog",
    "labs",
    "agent",
    "onboarding",
  ],
};

/**
 * Obtiene el primer tab permitido para un rol
 */
function getFirstAllowedTab(role: Role): SidebarTab {
  return tabPermissionsByRole[role]?.[0] ?? "kit";
}

/**
 * Obtiene la ruta del primer tab permitido
 */
function getFirstAllowedRoute(role: Role): string {
  const tab = getFirstAllowedTab(role);
  // Buscar la ruta que corresponde a este tab
  for (const [route, tabId] of Object.entries(routeToTab)) {
    if (tabId === tab) return route;
  }
  return "/kit";
}

/**
 * Verifica si un rol tiene acceso a una ruta
 */
function canAccessRoute(role: Role, pathname: string): boolean {
  // Encontrar la ruta base (sin subrutas)
  const baseRoute = "/" + pathname.split("/").filter(Boolean)[0];
  const tab = routeToTab[baseRoute];

  // Si no es una ruta protegida, permitir
  if (!tab) return true;

  // Verificar si el rol tiene acceso a este tab
  return tabPermissionsByRole[role]?.includes(tab) ?? false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar rutas estáticas y API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname === "/forbidden"
  ) {
    return NextResponse.next();
  }

  // Obtener el rol de la cookie
  const roleCookie = request.cookies.get(ROLE_COOKIE_NAME);
  const role = roleCookie?.value as Role | undefined;

  // Si no hay rol (no autenticado), permitir acceso por ahora
  // TODO: Cuando tengamos auth real, redirigir a login
  if (!role) {
    return NextResponse.next();
  }

  // Ruta raíz: redirigir al primer tab permitido
  if (pathname === "/") {
    const firstRoute = getFirstAllowedRoute(role);
    return NextResponse.redirect(new URL(firstRoute, request.url));
  }

  // Verificar acceso a la ruta
  if (!canAccessRoute(role, pathname)) {
    // Redirigir a página de acceso denegado
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
