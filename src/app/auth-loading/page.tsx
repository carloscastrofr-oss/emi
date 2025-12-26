"use client";

import { useEffect, useRef } from "react";
import { getRoleCookie, getAuthCookie } from "@/lib/auth-cookies";
import { getFirstAllowedRoute } from "@/lib/middleware/config";
import type { Role } from "@/types/auth";
import {
  useSessionStore,
  useFetchProgressMessage,
  FETCH_PROGRESS_MESSAGES,
} from "@/stores/session-store";

/**
 * Página de carga unificada durante la autenticación
 * Se muestra cuando hay un token válido pero la cookie de rol aún no está establecida
 * Se subscribe al session-store para mostrar el progreso real y redirige cuando está listo
 */
export default function AuthLoadingPage() {
  const hasRedirected = useRef(false);
  const progressMessage = useFetchProgressMessage();
  const fetchProgress = useSessionStore((state) => state.fetchProgress);
  const sessionData = useSessionStore((state) => state.sessionData);
  const error = useSessionStore((state) => state.error);
  const fetchSession = useSessionStore((state) => state.fetchSession);

  // Efecto para iniciar la carga de sesión si no está en progreso
  useEffect(() => {
    const authCookie = getAuthCookie();

    // Si no hay cookie de auth, redirigir a login inmediatamente
    if (!authCookie) {
      console.log("[Auth Loading] No hay cookie de auth, redirigiendo a login");
      window.location.href = "/login";
      return;
    }

    // Iniciar fetchSession si no está ya en progreso
    if (fetchProgress === "idle") {
      console.log("[Auth Loading] Iniciando fetchSession...");
      fetchSession(true);
    }
  }, [fetchProgress, fetchSession]);

  // Efecto para redirigir cuando la sesión está lista
  useEffect(() => {
    // Prevenir múltiples redirecciones
    if (hasRedirected.current) return undefined;

    // Si hay error, redirigir a forbidden
    if (fetchProgress === "error" || error) {
      hasRedirected.current = true;
      console.log("[Auth Loading] Error en sesión, redirigiendo a forbidden:", error);
      window.location.href = "/forbidden?reason=session-error";
      return undefined;
    }

    // Si la sesión está completa y hay datos
    if (fetchProgress === "complete" && sessionData) {
      const roleCookie = getRoleCookie();

      if (roleCookie) {
        hasRedirected.current = true;
        const targetRoute = getFirstAllowedRoute(roleCookie as Role);
        console.log("[Auth Loading] Sesión lista, redirigiendo a:", targetRoute);
        window.location.href = targetRoute;
        return undefined;
      }

      // Si hay sessionData pero no cookie de rol, esperar un poco más
      // (la cookie puede tardar un ciclo de render en estar disponible)
      const checkCookie = setTimeout(() => {
        const finalRoleCookie = getRoleCookie();
        if (finalRoleCookie && !hasRedirected.current) {
          hasRedirected.current = true;
          const targetRoute = getFirstAllowedRoute(finalRoleCookie as Role);
          console.log(
            "[Auth Loading] Cookie de rol encontrada (delayed), redirigiendo a:",
            targetRoute
          );
          window.location.href = targetRoute;
        }
      }, 100);

      return () => clearTimeout(checkCookie);
    }

    return undefined;
  }, [fetchProgress, sessionData, error]);

  // Timeout de seguridad: si después de 10 segundos no hay progreso, redirigir
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasRedirected.current) {
        console.warn("[Auth Loading] Timeout de seguridad alcanzado, redirigiendo a login");
        hasRedirected.current = true;
        window.location.href = "/login";
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  // Calcular el progreso de la barra (0-100)
  const getProgressWidth = (): string => {
    switch (fetchProgress) {
      case "idle":
        return "5%";
      case "validating":
        return "25%";
      case "loading-data":
        return "50%";
      case "setting-cookies":
        return "75%";
      case "complete":
        return "100%";
      case "error":
        return "100%";
      default:
        return "10%";
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="flex w-full max-w-xs flex-col items-center gap-8 px-4">
        {/* Logo / Branding */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-foreground">EMI Design OS</h1>
        </div>

        {/* Barra de progreso */}
        <div className="w-full space-y-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: getProgressWidth() }}
            />
          </div>

          {/* Mensaje de estado actual */}
          <p className="text-center text-sm text-muted-foreground">{progressMessage}</p>
        </div>

        {/* Indicador de carga sutil */}
        {fetchProgress !== "complete" && fetchProgress !== "error" && (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/40"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
