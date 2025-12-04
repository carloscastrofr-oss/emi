"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, Settings, BookUser, Bug } from "lucide-react";
import { useState, useEffect } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
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
import { AuthInitializer } from "@/components/auth/auth-initializer";
import { useAuthStore } from "@/stores/auth-store";
import { getAllowedTabsConfig } from "@/lib/auth";
import { roleLabels } from "@/config/auth";
import { getIcon } from "@/config/sidebar-icons";
import { DebugDialog } from "@/components/debug";
import { useDebugStore } from "@/stores/debug-store";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { openDialog: openDebugDialog } = useDebugStore();

  // Obtener las tabs permitidas para el rol del usuario
  const allowedTabs = user?.role ? getAllowedTabsConfig(user.role) : [];

  return (
    <SidebarProvider>
      {/* Debug dialog */}
      <DebugDialog />

      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {allowedTabs.map((tab) => {
                const Icon = getIcon(tab.icon);
                return (
                  <SidebarMenuItem key={tab.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(tab.href)}
                      className={`w-full justify-start ${tab.className ?? ""}`}
                    >
                      <Link href={tab.href}>
                        <Icon className="mr-2 h-5 w-5" />
                        <span>{tab.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="w-full justify-start">
                  <Link href="/onboarding">
                    <BookUser className="mr-2 h-5 w-5" />
                    <span>Inducción</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start">
                  <Settings className="mr-2 h-5 w-5" />
                  <span>Configuración</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={openDebugDialog}
                >
                  <Bug className="mr-2 h-5 w-5" />
                  <span>Debugging Tools</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <div className="md:hidden">
              <SidebarTrigger asChild>
                <Button variant="ghost" size="icon">
                  <PanelLeft className="h-6 w-6" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </SidebarTrigger>
            </div>
            <div className="flex-1" />
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
          </header>
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientOnly>
      <AuthInitializer>
        <AppLayoutContent>{children}</AppLayoutContent>
      </AuthInitializer>
    </ClientOnly>
  );
}
