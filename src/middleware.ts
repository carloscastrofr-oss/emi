/**
 * Middleware de Next.js para protección de rutas
 * Verifica que el usuario tenga permiso para acceder a cada ruta
 *
 * Flujo simplificado:
 * 1. Verificar si es ruta pública/ignorada → Permitir
 * 2. Verificar cookie de token → Si no, redirigir a /login
 * 3. Verificar cookie de rol → Si no, redirigir a /auth-loading (espera que se establezca)
 * 4. Si es ruta raíz "/" → Redirigir al primer tab permitido
 * 5. Verificar acceso a ruta → Si no, redirigir a /forbidden
 * 6. Permitir acceso
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  checkPublicRoute,
  checkAuthToken,
  checkRole,
  checkRouteAccess,
  getFirstAllowedRoute,
} from "@/lib/middleware/checks";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Verificar si es ruta pública o debe ser ignorada
  if (checkPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 2. Verificar autenticación - buscar cookie de token
  if (!checkAuthToken(request.cookies)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Obtener y verificar rol desde cookie
  const role = checkRole(request.cookies);
  if (!role) {
    // Si hay token pero no hay rol, redirigir a la página de carga de auth
    // Esta página esperará a que session-store establezca la cookie de rol
    // y luego redirigirá automáticamente a la ruta correcta
    // Esto evita mostrar /forbidden durante el proceso de login
    return NextResponse.redirect(new URL("/auth-loading", request.url));
  }

  // 4. Ruta raíz: redirigir al primer tab permitido según el rol
  if (pathname === "/") {
    const firstRoute = getFirstAllowedRoute(role);
    return NextResponse.redirect(new URL(firstRoute, request.url));
  }

  // 5. Verificar acceso a la ruta específica
  if (!checkRouteAccess(role, pathname)) {
    const forbiddenUrl = new URL("/forbidden", request.url);
    forbiddenUrl.searchParams.set("from", pathname);
    forbiddenUrl.searchParams.set("reason", "insufficient-permissions");
    forbiddenUrl.searchParams.set("role", role);
    return NextResponse.redirect(forbiddenUrl);
  }

  // 6. Todo OK, permitir acceso
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
