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
  type LucideIcon,
} from "lucide-react";
import { RequireRole } from "@/components/auth/require-role";
import type { Kit } from "@/types/kit";
import type { ApiResponse } from "@/lib/api-utils";
import { apiFetch } from "@/lib/api-client";
import { CreateKitDialog } from "./create-kit-dialog";

// Mapeo de nombres de iconos a componentes
const iconMap: Record<string, LucideIcon> = {
  Github,
  FileText,
  SwatchBook,
  Package,
  Palette,
  ShoppingCart,
};

function getIcon(iconName: string): LucideIcon {
  // Intentar obtener el icono del mapa, si no existe, usar Package
  return iconMap[iconName] ?? Package;
}

// Función para obtener cualquier icono de Lucide dinámicamente
function getLucideIcon(iconName: string): LucideIcon {
  try {
    // Intentar importar dinámicamente el icono
    const iconModule = require(`lucide-react`);
    return (iconModule[iconName] as LucideIcon) ?? Package;
  } catch {
    return Package;
  }
}

function KitCardSkeleton() {
  return (
    <Card className="flex flex-col rounded-expressive shadow-e2 h-full">
      <CardHeader className="flex flex-row items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow" />
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function KitPage() {
  const router = useRouter();
  const [kits, setKits] = useState<Kit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch kits on mount
  useEffect(() => {
    async function fetchKits() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiFetch("/api/kit");
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
  }, []);

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
      <CreateKitDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Busca en los kits con IA..."
          className="w-full rounded-full bg-background/50 pl-12 pr-4 py-6 text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <KitCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Kits grid */}
      {!isLoading && !error && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredKits.map((kit) => {
            const Icon = getLucideIcon(kit.icon);
            return (
              <motion.div
                key={kit.id}
                className="h-full"
                whileHover={{ y: -4, boxShadow: "var(--tw-shadow-e8)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card className="flex flex-col rounded-expressive shadow-e2 h-full">
                  <CardHeader className="flex flex-row items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{kit.title}</CardTitle>
                      <CardDescription>{kit.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow" />
                  <CardFooter>
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
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No se encontraron kits</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
