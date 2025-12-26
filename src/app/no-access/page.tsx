"use client";

import { useEffect } from "react";
import { AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Página para usuarios sin acceso
 * Se muestra cuando un usuario está autenticado pero no tiene:
 * - Rol global, Y
 * - Acceso a ningún cliente/workspace
 *
 * Esta página desloguea automáticamente al usuario
 */
export default function NoAccessPage() {
  const { logout } = useAuthStore();

  useEffect(() => {
    // Desloguear automáticamente después de mostrar el mensaje
    // Dar un pequeño delay para que el usuario lea el mensaje
    const timer = setTimeout(() => {
      logout();
    }, 5000); // 5 segundos

    return () => clearTimeout(timer);
  }, [logout]);

  const handleLogoutNow = () => {
    logout();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Sin Acceso al Sistema</CardTitle>
          <CardDescription>No tienes permisos para acceder a esta plataforma</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Tu cuenta no tiene un rol asignado ni acceso a ningún cliente o workspace. Para poder
              usar el sistema, necesitas que un administrador te asigne:
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Un rol global, o</li>
              <li>Acceso a al menos un cliente/workspace</li>
            </ul>
          </div>

          <div className="rounded-md border border-muted bg-muted/50 p-3 text-sm">
            <p className="font-medium mb-1">¿Qué hacer ahora?</p>
            <p className="text-muted-foreground">
              Contacta a tu administrador del sistema para que te asigne los permisos necesarios.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={handleLogoutNow} variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión Ahora
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Serás redirigido automáticamente en unos segundos...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
