/**
 * Middleware de Next.js para protección de rutas
 * Verifica que el usuario tenga permiso para acceder a cada ruta
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Role, SidebarTab } from "@/types/auth";

// Nombres de las cookies (deben coincidir con auth-cookies.ts)
const ROLE_COOKIE_NAME = "emi_role";
const AUTH_COOKIE_NAME = "emi_auth";

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
  const referer = request.headers.get("referer") || "direct";

  // Ignorar rutas estáticas, API y página de login
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname === "/login" ||
    pathname === "/forbidden"
  ) {
    return NextResponse.next();
  }

  // Verificar autenticación primero - buscar el token de Firebase
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const hasAuthToken = !!authCookie?.value && authCookie.value !== "";

  // Logging para debugging (solo en desarrollo)
  if (process.env.NODE_ENV === "development") {
    console.log("[Middleware] Request:", {
      pathname,
      referer,
      hasAuthToken,
      authCookieValue: authCookie?.value ? `${authCookie.value.substring(0, 20)}...` : "null",
      allCookies: Object.fromEntries(
        request.cookies.getAll().map((c) => [c.name, c.value.substring(0, 20) + "..."])
      ),
    });
  }

  // Si no está autenticado, redirigir a página de login
  if (!hasAuthToken) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Middleware] ❌ No auth token - redirecting to /login from:", pathname);
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Obtener el rol de la cookie
  const roleCookie = request.cookies.get(ROLE_COOKIE_NAME);
  const role = roleCookie?.value as Role | undefined;

  // Logging para debugging (solo en desarrollo)
  if (process.env.NODE_ENV === "development") {
    console.log("[Middleware] Role check:", {
      hasRole: !!role,
      roleValue: role || "null",
    });
  }

  // Si está autenticado pero no tiene rol, redirigir a forbidden
  // (esto no debería pasar normalmente, pero es una validación de seguridad)
  if (!role) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "[Middleware] ❌ Auth token exists but no role - redirecting to /forbidden from:",
        pathname,
        "referer:",
        referer
      );
    }
    const forbiddenUrl = new URL("/forbidden", request.url);
    forbiddenUrl.searchParams.set("from", pathname);
    forbiddenUrl.searchParams.set("reason", "no-role");
    return NextResponse.redirect(forbiddenUrl);
  }

  // Ruta raíz: redirigir al primer tab permitido
  if (pathname === "/") {
    const firstRoute = getFirstAllowedRoute(role);
    return NextResponse.redirect(new URL(firstRoute, request.url));
  }

  // Verificar acceso a la ruta
  if (!canAccessRoute(role, pathname)) {
    // Redirigir a página de acceso denegado
    if (process.env.NODE_ENV === "development") {
      console.log(
        "[Middleware] ❌ Role",
        role,
        "cannot access",
        pathname,
        "- redirecting to /forbidden from:",
        referer
      );
    }
    const forbiddenUrl = new URL("/forbidden", request.url);
    forbiddenUrl.searchParams.set("from", pathname);
    forbiddenUrl.searchParams.set("reason", "insufficient-permissions");
    forbiddenUrl.searchParams.set("role", role);
    return NextResponse.redirect(forbiddenUrl);
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[Middleware] ✅ Access granted:", { pathname, role });
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
