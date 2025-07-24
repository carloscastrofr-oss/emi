
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookUser,
  FlaskConical,
  KanbanSquare,
  LayoutDashboard,
  Package,
  PanelLeft,
  Settings,
  Bot,
  View,
  Beaker,
  ClipboardList,
  FileText,
  Target,
  Users,
  ShieldAlert,
} from "lucide-react";

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
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { RequireRole } from "@/components/auth/require-role";
import { Badge } from "@/components/ui/badge";
import { ONBOARDING_STEPS } from "@/lib/onboarding-data";
import { useMemo } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Panel", roles: ["viewer", "producer", "core", "admin"], className: "dashboard-page-link" },
  { href: "/kit", icon: Package, label: "Kit", roles: ["viewer", "producer", "core", "admin"], className: "kit-page-link" },
  { href: "/contenido", icon: FileText, label: "Contenido", roles: ["producer", "core", "admin"], className: "content-page-link" },
  { href: "/labs", icon: FlaskConical, label: "Labs", roles: ["producer", "core", "admin"], className: "labs-page-link" },
  { href: "/workbench", icon: KanbanSquare, label: "Workbench", roles: ["producer", "core", "admin"], className: "workbench-page-link" },
  { href: "/agent", icon: Bot, label: "Agent", roles: ["core", "admin"], className: "agent-page-link" },
  { href: "/observer", icon: View, label: "Observer", roles: ["core", "admin"], className: "observer-page-link" },
  { href: "/risk", icon: ShieldAlert, label: "Riesgos", roles: ["core", "admin"], className: "risk-page-link" },
  { href: "/synthetic-users", icon: Users, label: "SynthUsers", roles: ["core", "admin"], className: "synthetic-users-page-link" },
  { href: "/playground", icon: Beaker, label: "Playground", roles: ["producer", "core", "admin"], className: "playground-page-link" },
  { href: "/strategy", icon: Target, label: "Strategy", roles: ["producer", "core", "admin"], className: "strategy-page-link" },
  { href: "/changelog", icon: ClipboardList, label: "Changelog", roles: ["viewer", "producer", "core", "admin"], className: "changelog-page-link" },
];


function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userProfile } = useAuth();
  
  const relevantSteps = useMemo(() => {
    return ONBOARDING_STEPS.filter(step => step.roles.includes(userProfile?.role || 'viewer'));
  }, [userProfile?.role]);

  const completedStepsCount = useMemo(() => {
    return userProfile?.onboarding?.completed?.length || 0;
  }, [userProfile?.onboarding]);

  const remainingSteps = relevantSteps.length - completedStepsCount;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <RequireRole key={item.href} roles={item.roles}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href)}
                      className={`w-full justify-start ${item.className}`}
                    >
                      <Link href={item.href}>
                        <item.icon className="mr-2 h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </RequireRole>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton asChild className="w-full justify-start" href="/onboarding">
                    <Link href="/onboarding" className="relative">
                      <BookUser className="mr-2 h-5 w-5" />
                      <span>Inducción</span>
                      {remainingSteps > 0 && (
                        <Badge variant="destructive" className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 p-0 flex items-center justify-center">
                            {remainingSteps}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="w-full justify-start">
                    <Settings className="mr-2 h-5 w-5" />
                    <span>Configuración</span>
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
            <div className="flex-1">
              {/* Header content like search can go here */}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/40x40.png" alt="@shadcn" data-ai-hint="person avatar" />
                    <AvatarFallback>{userProfile?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile?.displayName || "Usuario"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userProfile?.email || "usuario@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userProfile && <Badge variant="secondary" className="w-fit m-2 capitalize">{userProfile.role}</Badge>}
                <DropdownMenuSeparator />
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configuración</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </AuthProvider>
  )
}
