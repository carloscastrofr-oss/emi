"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Github,
  FileText,
  SwatchBook,
  Package,
  Palette,
  ShoppingCart,
  ArrowRight,
  Search,
  Plus,
  User,
  Users,
  Building2,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { RequireRole } from "@/components/auth/require-role";
import type { Kit } from "@/types/kit";
import type { ApiResponse } from "@/lib/api-utils";
import { apiFetch } from "@/lib/api-client";
import { CreateKitDialog } from "./create-kit-dialog";
import { useCurrentClient, useCurrentWorkspace } from "@/stores/session-store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mapeo de nombres de iconos a componentes
const iconMap: Record<string, LucideIcon> = {
  Github,
  FileText,
  SwatchBook,
  Package,
  Palette,
  ShoppingCart,
};

const scopeConfig = {
  personal: {
    label: "Personal",
    icon: User,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  workspace: {
    label: "Equipo",
    icon: Users,
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  client: {
    label: "Empresa",
    icon: Building2,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
};

// Función para obtener cualquier icono de Lucide dinámicamente
function getLucideIcon(iconName: string): LucideIcon {
  // Intentar obtener el icono del mapa primero
  const mappedIcon = iconMap[iconName];
  if (mappedIcon) return mappedIcon;

  // Si no está en el mapa, intentar obtenerlo directamente de lucide-react
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const iconModule = require("lucide-react");
    return (iconModule[iconName] as LucideIcon) ?? Package;
  } catch {
    return Package;
  }
}

function KitCardSkeleton() {
  return (
    <Card className="flex flex-col rounded-expressive shadow-e2 h-full min-h-[200px]">
      <CardHeader className="flex flex-row items-start gap-4 pb-4">
        <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function KitPage() {
  const router = useRouter();
  const currentClient = useCurrentClient();
  const currentWorkspace = useCurrentWorkspace();
  const [kits, setKits] = useState<Kit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch kits on mount and when context changes
  useEffect(() => {
    async function fetchKits() {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (currentClient?.id) queryParams.set("clientId", currentClient.id);
        if (currentWorkspace?.id) queryParams.set("workspaceId", currentWorkspace.id);

        const response = await apiFetch(`/api/kit?${queryParams.toString()}`);
        const data: ApiResponse<Kit[]> = await response.json();

        if (data.success && data.data) {
          setKits(data.data);
        } else {
          setError(data.error?.message ?? "Error al cargar los kits");
        }
      } catch (err) {
        console.error("Error fetching kits:", err);
        setError("Error de conexión");
      } finally {
        setIsLoading(false);
      }
    }

    fetchKits();
  }, [currentClient?.id, currentWorkspace?.id]);

  // Filtrar kits por búsqueda (client-side para UX inmediata)
  const filteredKits = searchQuery
    ? kits.filter(
        (kit) =>
          kit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          kit.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : kits;

  return (
    <div>
      <PageHeader
        title="Kit"
        description="Descarga kits de inicio para arrancar tus proyectos."
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Kit
          </Button>
        }
      />
      <CreateKitDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          // Refrescar kits después de crear uno nuevo
          window.location.reload();
        }}
      />

      {/* Context info (debug/info) */}
      <div className="mb-6 flex flex-wrap gap-2">
        {currentClient && (
          <Badge variant="outline" className="flex items-center gap-1 py-1 px-3">
            <Building2 className="h-3 w-3" />
            Empresa: {currentClient.name}
          </Badge>
        )}
        {currentWorkspace && (
          <Badge variant="outline" className="flex items-center gap-1 py-1 px-3">
            <Users className="h-3 w-3" />
            Equipo: {currentWorkspace.name}
          </Badge>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Busca en los kits..."
          className="w-full rounded-full bg-background/50 pl-12 pr-4 py-6 text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <KitCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Kits grid */}
      {!isLoading && !error && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredKits.map((kit) => {
            const Icon = getLucideIcon(kit.icon);
            const scope =
              scopeConfig[kit.scope as keyof typeof scopeConfig] || scopeConfig.workspace;
            const ScopeIcon = scope.icon;

            return (
              <motion.div
                key={kit.id}
                className="h-full"
                whileHover={{ y: -4, boxShadow: "var(--tw-shadow-e8)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card className="flex flex-col rounded-expressive shadow-e2 h-full min-h-[250px] overflow-hidden">
                  <div className={cn("h-1.5 w-full", scope.className.split(" ")[0])} />
                  <CardHeader className="flex flex-row items-start gap-4 pb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider h-5 flex items-center gap-1",
                            scope.className
                          )}
                        >
                          <ScopeIcon className="h-2.5 w-2.5" />
                          {scope.label}
                        </Badge>
                      </div>
                      <CardTitle className="line-clamp-2 text-lg leading-tight">
                        {kit.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="line-clamp-3 text-sm mb-4">
                      {kit.description}
                    </CardDescription>
                    {kit.createdBy && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
                        <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-3 w-3" />
                        </div>
                        <span className="truncate">Por {kit.createdBy}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <RequireRole minRole="product_designer" showDisabled>
                      <Button className="w-full" onClick={() => router.push(`/kit/${kit.id}`)}>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Consultar
                      </Button>
                    </RequireRole>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}

          {/* Empty state */}
          {filteredKits.length === 0 && (
            <div className="col-span-full text-center py-24 bg-muted/20 rounded-xl border-2 border-dashed border-muted">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">
                No se encontraron kits en este contexto
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Prueba cambiando de alcance o ajustando tu búsqueda
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
