"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { getAllowedTabsConfig } from "@/lib/auth";
import { roleLabels } from "@/config/auth";

/**
 * Componente interno que usa useSearchParams
 * Debe estar envuelto en Suspense para evitar errores en build
 */
function ForbiddenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  // Obtener información de debugging desde los query params
  const fromPath = searchParams.get("from");
  const reason = searchParams.get("reason");
  const roleFromQuery = searchParams.get("role");

  // Obtener el primer tab permitido para redirigir
  const allowedTabs = user?.role ? getAllowedTabsConfig(user.role) : [];
  const firstTab = allowedTabs[0];

  const handleGoHome = () => {
    if (firstTab) {
      router.push(firstTab.href);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        {/* Icono */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-12 w-12 text-destructive" />
        </div>

        {/* Título */}
        <h1 className="mb-2 text-4xl font-bold tracking-tight">403</h1>
        <h2 className="mb-4 text-xl font-semibold text-muted-foreground">Acceso Denegado</h2>

        {/* Descripción */}
        <p className="mb-6 text-muted-foreground">
          No tienes permisos para acceder a esta página.
          {user?.role && (
            <>
              {" "}
              Tu rol actual es <strong>{roleLabels[user.role]}</strong>.
            </>
          )}
        </p>

        {/* Debug info - solo en desarrollo */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-left text-xs">
            <p className="font-semibold text-destructive">Debug Info:</p>
            <p>From: {fromPath || "unknown"}</p>
            <p>Reason: {reason || "unknown"}</p>
            <p>Role from query: {roleFromQuery || "none"}</p>
            <p>User role: {user?.role || "none"}</p>
            <p>Is authenticated: {user ? "yes" : "no"}</p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Button onClick={handleGoHome}>
            <Home className="mr-2 h-4 w-4" />
            Ir a {firstTab?.label ?? "Inicio"}
          </Button>
        </div>

        {/* Info adicional */}
        <p className="mt-8 text-xs text-muted-foreground">
          Si crees que deberías tener acceso, contacta a tu administrador.
        </p>
      </div>
    </div>
  );
}

/**
 * Página de acceso denegado (403)
 * Solo se muestra cuando el usuario está autenticado pero no tiene permisos
 * Si no está autenticado, el middleware redirige a /login
 */
export default function ForbiddenPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
          <div className="flex flex-col items-center text-center max-w-md">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
              <ShieldX className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight">403</h1>
            <h2 className="mb-4 text-xl font-semibold text-muted-foreground">Acceso Denegado</h2>
            <p className="mb-6 text-muted-foreground">Cargando...</p>
          </div>
        </div>
      }
    >
      <ForbiddenContent />
    </Suspense>
  );
}
