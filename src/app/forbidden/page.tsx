"use client";

import { useRouter } from "next/navigation";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { getAllowedTabsConfig } from "@/lib/auth";
import { roleLabels } from "@/config/auth";

export default function ForbiddenPage() {
  const router = useRouter();
  const { user } = useAuthStore();

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
        {user && (
          <p className="mt-8 text-xs text-muted-foreground">
            Si crees que deberías tener acceso, contacta a tu administrador.
          </p>
        )}
      </div>
    </div>
  );
}
