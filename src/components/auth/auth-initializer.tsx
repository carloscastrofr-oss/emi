"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Componente que inicializa el store de auth cuando se monta
 * Debe estar en el layout principal de la app
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initialize, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  // Mostrar loading mientras se inicializa
  if (isLoading && !isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
