"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, BookUser, Bug } from "lucide-react";
import { useState, useEffect } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { AuthInitializer } from "@/components/auth/auth-initializer";
import { AppHeader } from "@/components/layout";
import { DebugDialog } from "@/components/debug";
import { useAuthStore } from "@/stores/auth-store";
import { useDebugStore } from "@/stores/debug-store";
import { getAllowedTabsConfig } from "@/lib/auth";
import { getIcon } from "@/config/sidebar-icons";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { openDialog: openDebugDialog } = useDebugStore();

  // Obtener las tabs permitidas para el rol del usuario
  const allowedTabs = user?.role ? getAllowedTabsConfig(user.role) : [];

  return (
    <SidebarProvider>
      {/* Debug dialog */}
      <DebugDialog />

      <div className="flex min-h-screen w-full">
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

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
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
