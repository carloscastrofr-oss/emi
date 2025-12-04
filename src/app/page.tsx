"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { getAllowedTabsConfig } from "@/lib/auth";

/**
 * Página raíz - Redirige al primer tab permitido según el rol del usuario
 * El middleware también maneja esto, pero este es un fallback client-side
 */
export default function Home() {
  const router = useRouter();
  const { user, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    // Inicializar auth si no está inicializado
    if (!isInitialized) {
      initialize();
      return;
    }

    // Una vez inicializado, redirigir al primer tab permitido
    if (user?.role) {
      const allowedTabs = getAllowedTabsConfig(user.role);
      const firstTab = allowedTabs[0];

      if (firstTab) {
        router.replace(firstTab.href);
      } else {
        // Fallback si no hay tabs (no debería pasar)
        router.replace("/kit");
      }
    }
  }, [user, isInitialized, initialize, router]);

  // Loading state mientras se inicializa y redirige
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
}
