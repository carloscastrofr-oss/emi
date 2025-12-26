"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Componente que inicializa el store de auth cuando se monta
 * Debe estar en el layout principal de la app
 *
 * NOTA: No muestra loader propio - /auth-loading se encarga de eso
 * La inicialización es instantánea cuando hay cookie de token
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  // No mostrar loader aquí - la inicialización es instantánea
  // Si el usuario no está autenticado, el middleware redirige a /login
  // Si está autenticado pero sin rol, el middleware redirige a /auth-loading
  return <>{children}</>;
}
