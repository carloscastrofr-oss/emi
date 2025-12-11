"use client";

import { useRouter } from "next/navigation";
import { PanelLeft, LogIn, Building2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { useSessionStore } from "@/stores/session-store";
import { SessionService } from "@/lib/session-service";
import { roleLabels } from "@/config/auth";
import { useEffect } from "react";

/**
 * Header principal de la aplicación
 * Incluye el trigger del sidebar en móvil y el menú de usuario o botón de login
 */
export function AppHeader() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const fetchSession = useSessionStore((state) => state.fetchSession);

  // Obtener cliente y workspace actuales desde el store
  // Usar sessionData como selector para que se reactive cuando cambie
  const currentClient = useSessionStore((state) => {
    if (!state.sessionData) return null;
    return SessionService.getDefaultClient(
      state.sessionData.clients,
      state.sessionData.defaultClient
    );
  });
  const currentWorkspace = useSessionStore((state) => {
    if (!state.sessionData) return null;
    const client = SessionService.getDefaultClient(
      state.sessionData.clients,
      state.sessionData.defaultClient
    );
    if (!client) return null;
    return SessionService.getDefaultWorkspace(client, state.sessionData.defaultWorkspace);
  });

  // Cargar sesión cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      const storeState = useSessionStore.getState();

      // Si no hay datos de sesión, cargar forzadamente
      if (!storeState.sessionData) {
        storeState.fetchSession(true).catch((error) => {
          console.error("Error cargando sesión:", error);
        });
      } else {
        // Si ya hay datos, solo revalidar si es necesario (puede haber expirado)
        storeState.revalidateIfNeeded().catch((error) => {
          console.error("Error revalidando sesión:", error);
        });
      }
    }
  }, [isAuthenticated, user]);

  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        {/* Mobile sidebar trigger */}
        <div className="md:hidden">
          <SidebarTrigger>
            <PanelLeft className="h-6 w-6" />
            <span className="sr-only">Toggle Sidebar</span>
          </SidebarTrigger>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Cliente y Workspace actuales */}
        {isAuthenticated && (currentClient || currentWorkspace) && (
          <div className="hidden md:flex items-center gap-3 mr-4">
            {currentClient && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted/80 transition-colors border border-border/40">
                <Building2 className="h-4 w-4 text-primary/70" />
                <span className="text-sm font-medium text-foreground/90">{currentClient.name}</span>
              </div>
            )}
            {currentWorkspace && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted/80 transition-colors border border-border/40">
                <FolderOpen className="h-4 w-4 text-primary/70" />
                <span className="text-sm font-medium text-foreground/90">
                  {currentWorkspace.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* User menu o Login button */}
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.photoUrl ?? "https://placehold.co/40x40.png"}
                    alt={user?.displayName ?? "Usuario"}
                  />
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.displayName ?? "Usuario"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email ?? "usuario@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user?.role && (
                <>
                  <div className="px-2 py-1.5">
                    <Badge variant="secondary" className="w-fit">
                      {roleLabels[user.role]}
                    </Badge>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={handleLoginClick} variant="default">
            <LogIn className="mr-2 h-4 w-4" />
            Iniciar sesión
          </Button>
        )}
      </header>
    </>
  );
}
