"use client";

import { useRouter } from "next/navigation";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { getAllowedTabsConfig } from "@/lib/auth";

export default function NotFoundPage() {
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
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>

        {/* Título */}
        <h1 className="mb-2 text-4xl font-bold tracking-tight">404</h1>
        <h2 className="mb-4 text-xl font-semibold text-muted-foreground">Página no encontrada</h2>

        {/* Descripción */}
        <p className="mb-6 text-muted-foreground">
          La página que buscas no existe o ha sido movida a otra ubicación.
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
      </div>
    </div>
  );
}
