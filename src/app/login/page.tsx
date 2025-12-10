"use client";

import { LoginDialog } from "@/components/auth/login-dialog";
import { useAuthStore } from "@/stores/auth-store";
import { getFirstAllowedRoute } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, initialize, user } = useAuthStore();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  useEffect(() => {
    // Inicializar auth si no está inicializado
    if (!isInitialized) {
      initialize();
      return;
    }

    // Si ya está autenticado, redirigir a la primera ruta permitida según su rol
    if (isAuthenticated && user?.role) {
      const firstRoute = getFirstAllowedRoute(user.role);
      router.replace(firstRoute);
    } else if (!isAuthenticated) {
      // Abrir el diálogo de login automáticamente
      setLoginDialogOpen(true);
    }
  }, [isAuthenticated, isInitialized, initialize, router, user]);

  const handleLoginSuccess = () => {
    // Obtener el rol del usuario (debería estar en el store después del login)
    // Si no está disponible aún, usar el rol por defecto
    const userRole = user?.role || "product_designer";
    const firstRoute = getFirstAllowedRoute(userRole);

    // Después de login exitoso, usar window.location para forzar recarga completa
    // Esto asegura que las cookies estén disponibles para el middleware
    window.location.href = firstRoute;
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
