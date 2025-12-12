"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Plus,
  FileText,
  Link as LinkIcon,
  Download,
  ExternalLink,
  Trash2,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-utils";
import type { Kit, KitItem } from "@/types/kit";
import { AddItemDialog } from "./add-item-dialog";
import { SortControl, type SortOption } from "./sort-control";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

function getLucideIcon(iconName: string): LucideIcon {
  const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon;
  return IconComponent ?? FileText;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "Tamaño desconocido";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function KitItemCard({
  item,
  kitId,
  onDelete,
}: {
  item: KitItem;
  kitId: string;
  onDelete: () => void;
}) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = () => {
    if (item.type === "file") {
      window.open(item.fileUrl, "_blank");
    } else {
      window.open(item.url, "_blank");
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await apiFetch(`/api/kit/${kitId}/files/${item.id}`, {
        method: "DELETE",
      });

      const data: ApiResponse<{ deleted: boolean; type: string }> = await response.json();

      if (data.success) {
        toast({
          title: "Eliminado",
          description: `El ${item.type === "file" ? "archivo" : "enlace"} ha sido eliminado exitosamente.`,
        });
        onDelete();
      } else {
        toast({
          title: "Error",
          description: data.error?.message || "Error al eliminar el elemento",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Error de conexión al eliminar el elemento",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              {item.type === "file" ? (
                <FileText className="h-5 w-5 text-primary" />
              ) : (
                <LinkIcon className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">
                {item.type === "file" ? item.title : item.title}
              </CardTitle>
              <CardDescription className="text-sm space-y-1">
                {item.type === "file" && (
                  <>
                    <div className="text-xs text-muted-foreground/80">{item.name}</div>
                    <div>
                      {formatFileSize(item.fileSize)}
                      {item.mimeType && ` • ${item.mimeType}`}
                    </div>
                  </>
                )}
                {item.type === "link" && <div>{item.description || item.url}</div>}
                {item.type === "file" && item.uploadedBy && (
                  <div className="text-xs text-muted-foreground/70">
                    Subido por: {item.uploadedBy}
                  </div>
                )}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {item.type === "file"
              ? formatDistanceToNow(new Date(item.uploadedAt), {
                  addSuffix: true,
                  locale: es,
                })
              : formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8 px-2">
              {item.type === "file" ? (
                <Download className="h-4 w-4" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 px-2 text-destructive hover:text-destructive"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function KitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [kit, setKit] = useState<Kit | null>(null);
  const [items, setItems] = useState<KitItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [kitId, setKitId] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      setKitId(id);
      setIsLoading(true);
      setError(null);

      try {
        // Cargar kit
        const kitResponse = await apiFetch(`/api/kit/${id}`);
        const kitData: ApiResponse<Kit> = await kitResponse.json();

        if (kitData.success && kitData.data) {
          setKit(kitData.data);
        } else {
          setError(kitData.error?.message ?? "Error al cargar el kit");
        }

        // Cargar archivos y enlaces
        const itemsResponse = await apiFetch(`/api/kit/${id}/files`);
        const itemsData: ApiResponse<KitItem[]> = await itemsResponse.json();

        if (itemsData.success && itemsData.data) {
          setItems(itemsData.data);
        }
      } catch (err) {
        console.error("Error loading kit:", err);
        setError("Error de conexión");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [params]);

  const handleItemAdded = async () => {
    // Recargar items
    try {
      const response = await apiFetch(`/api/kit/${kitId}/files`);
      const data: ApiResponse<KitItem[]> = await response.json();

      if (data.success && data.data) {
        setItems(data.data);
      }
    } catch (err) {
      console.error("Error reloading items:", err);
    }
  };

  // Función para ordenar items
  const sortItems = (itemsToSort: KitItem[], option: SortOption): KitItem[] => {
    const sorted = [...itemsToSort];

    switch (option) {
      case "alphabetical-asc":
        return sorted.sort((a, b) => {
          const titleA = a.type === "file" ? a.title : a.title;
          const titleB = b.type === "file" ? b.title : b.title;
          return titleA.localeCompare(titleB);
        });

      case "alphabetical-desc":
        return sorted.sort((a, b) => {
          const titleA = a.type === "file" ? a.title : a.title;
          const titleB = b.type === "file" ? b.title : b.title;
          return titleB.localeCompare(titleA);
        });

      case "recent":
        return sorted.sort((a, b) => {
          const dateA = a.type === "file" ? a.uploadedAt : a.createdAt;
          const dateB = b.type === "file" ? b.uploadedAt : b.createdAt;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

      case "oldest":
        return sorted.sort((a, b) => {
          const dateA = a.type === "file" ? a.uploadedAt : a.createdAt;
          const dateB = b.type === "file" ? b.uploadedAt : b.createdAt;
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        });

      case "size-desc":
        return sorted.sort((a, b) => {
          if (a.type === "file" && b.type === "file") {
            return (b.fileSize || 0) - (a.fileSize || 0);
          }
          if (a.type === "file") return -1;
          if (b.type === "file") return 1;
          return 0;
        });

      case "size-asc":
        return sorted.sort((a, b) => {
          if (a.type === "file" && b.type === "file") {
            return (a.fileSize || 0) - (b.fileSize || 0);
          }
          if (a.type === "file") return -1;
          if (b.type === "file") return 1;
          return 0;
        });

      default:
        return sorted;
    }
  };

  const handleToggleDirection = () => {
    // Invertir el orden actual
    const directionMap: Record<SortOption, SortOption> = {
      "alphabetical-asc": "alphabetical-desc",
      "alphabetical-desc": "alphabetical-asc",
      recent: "oldest",
      oldest: "recent",
      "size-desc": "size-asc",
      "size-asc": "size-desc",
    };
    setSortOption(directionMap[sortOption]);
  };

  const sortedItems = sortItems(items, sortOption);

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !kit) {
    return (
      <div>
        <Button variant="ghost" onClick={() => router.push("/kit")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="text-center py-12">
          <p className="text-destructive">{error || "Kit no encontrado"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/kit")}>
            Volver a Kits
          </Button>
        </div>
      </div>
    );
  }

  const KitIcon = getLucideIcon(kit.icon);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-2rem)] sm:h-[calc(100vh-4rem-3rem)] max-h-[calc(100vh-4rem-2rem)] sm:max-h-[calc(100vh-4rem-3rem)] overflow-hidden">
      {/* Header fijo - no hace scroll */}
      <div className="flex-shrink-0">
        <Button variant="ghost" onClick={() => router.push("/kit")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <PageHeader
          title={kit.title}
          description={kit.description}
          actions={
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          }
        />
        <div className="flex items-center gap-2 mt-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <KitIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "elemento" : "elementos"}
          </div>
        </div>

        {/* Controles de ordenamiento */}
        {items.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <SortControl
              value={sortOption}
              onValueChange={setSortOption}
              onToggleDirection={handleToggleDirection}
            />
          </div>
        )}
      </div>

      <AddItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        kitId={kitId}
        onItemAdded={handleItemAdded}
      />

      {/* Área de contenido con scroll independiente */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {items.length === 0 ? (
          <Card className="py-12 h-full flex items-center justify-center">
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Este kit está vacío. Agrega archivos o enlaces para comenzar.
              </p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar elemento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              {sortedItems.map((item) => (
                <KitItemCard key={item.id} item={item} kitId={kitId} onDelete={handleItemAdded} />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
