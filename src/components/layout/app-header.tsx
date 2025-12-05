"use client";

import { PanelLeft } from "lucide-react";
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
import { roleLabels } from "@/config/auth";

/**
 * Header principal de la aplicación
 * Incluye el trigger del sidebar en móvil y el menú de usuario
 */
export function AppHeader() {
  const { user, logout } = useAuthStore();

  return (
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

      {/* User menu */}
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
              <p className="text-sm font-medium leading-none">{user?.displayName ?? "Usuario"}</p>
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
    </header>
  );
}
