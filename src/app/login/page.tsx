"use client";

import { LoginDialog } from "@/components/auth/login-dialog";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  useEffect(() => {
    // Inicializar auth si no está inicializado
    if (!isInitialized) {
      initialize();
      return;
    }

    // Si ya está autenticado, el middleware se encargará de redirigir
    // Solo abrir el diálogo si no está autenticado
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
    } else {
      // Si está autenticado, redirigir a home - el middleware redirigirá al primer tab
      router.replace("/");
    }
  }, [isAuthenticated, isInitialized, initialize, router]);

  const handleLoginSuccess = () => {
    // El login-dialog ya maneja la redirección directamente a la ruta final
    // Solo necesitamos cerrar el diálogo si es necesario
    // No hacer redirección aquí - login-dialog lo hará
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <LoginDialog
          open={loginDialogOpen}
          onOpenChange={setLoginDialogOpen}
          onSuccess={handleLoginSuccess}
        />
      </div>
    </div>
  );
}
