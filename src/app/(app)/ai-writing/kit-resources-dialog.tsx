"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, Folder, AlertTriangle } from "lucide-react";
import { useCurrentWorkspace } from "@/stores/session-store";
import { useToast } from "@/hooks/use-toast";

type KitFileTreeNode =
  | {
      id: string;
      name: string;
      kind: "folder";
      children: KitFileTreeNode[];
    }
  | {
      id: string;
      name: string;
      kind: "file";
      kitId: string;
      mimeType?: string;
      isSupportedForAi: boolean;
      workspaceId?: string;
    };

interface KitFileTreeResponse {
  items: KitFileTreeNode[];
}

interface KitResourcesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedResourceIds: string[];
  onSelectionChange: (resourceIds: string[]) => void;
}

export function KitResourcesDialog({
  open,
  onOpenChange,
  selectedResourceIds,
  onSelectionChange,
}: KitResourcesDialogProps) {
  const currentWorkspace = useCurrentWorkspace();
  const { toast } = useToast();

  const [tree, setTree] = useState<KitFileTreeNode[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentFolderId, setCurrentFolderId] = useState<string>("root");
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([
    { id: "root", name: "Workspace" },
  ]);

  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedResourceIds);

  useEffect(() => {
    setLocalSelectedIds(selectedResourceIds);
  }, [selectedResourceIds]);

  useEffect(() => {
    if (open) {
      loadTree();
    } else {
      // Reset navegación cuando se cierra
      setCurrentFolderId("root");
      setBreadcrumbs([{ id: "root", name: "Workspace" }]);
      setError(null);
    }
  }, [open]);

  async function loadTree() {
    setLoadingTree(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (currentWorkspace?.id) {
        params.set("workspaceId", currentWorkspace.id);
      }
      const res = await fetch(`/api/kit/tree${params.toString() ? `?${params}` : ""}`);
      if (!res.ok) {
        throw new Error(`Error ${res.status} al cargar árbol de recursos`);
      }
      const data: { success: boolean; data?: KitFileTreeResponse } = await res.json();
      if (!data.success || !data.data) {
        throw new Error("Respuesta inválida del endpoint de árbol de recursos");
      }
      setTree(data.data.items);
    } catch (error) {
      console.error("Error loading kit file tree:", error);
      setError("No se pudo cargar el árbol de recursos de kits.");
    } finally {
      setLoadingTree(false);
    }
  }

  const currentNodes: KitFileTreeNode[] = useMemo(() => {
    if (currentFolderId === "root") {
      return tree;
    }

    const findFolder = (nodes: KitFileTreeNode[], id: string): KitFileTreeNode | null => {
      for (const node of nodes) {
        if (node.kind === "folder") {
          if (node.id === id) return node;
          const found = findFolder(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const folder = findFolder(tree, currentFolderId);
    if (folder && folder.kind === "folder") {
      return folder.children;
    }
    return [];
  }, [tree, currentFolderId]);

  function navigateToFolder(folder: KitFileTreeNode & { kind: "folder" }) {
    setCurrentFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  }

  function navigateBack() {
    setBreadcrumbs((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      setCurrentFolderId(next[next.length - 1]?.id ?? "root");
      return next;
    });
  }

  function handleResourceToggle(resourceId: string) {
    setLocalSelectedIds((prev) => {
      if (prev.includes(resourceId)) {
        return prev.filter((id) => id !== resourceId);
      } else {
        if (prev.length >= 3) {
          toast({
            title: "Límite de selección alcanzado",
            description: "Solo puedes seleccionar hasta 3 archivos como contexto.",
            variant: "destructive",
          });
          return prev;
        }
        return [...prev, resourceId];
      }
    });
  }

  function handleConfirm() {
    onSelectionChange(localSelectedIds);
    onOpenChange(false);
  }

  function handleCancel() {
    setLocalSelectedIds(selectedResourceIds);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Seleccionar Recursos de Kit</DialogTitle>
          <DialogDescription>
            Explora los kits y selecciona hasta 3 archivos que quieras usar como contexto para la
            generación de contenido.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Barra de navegación */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={navigateBack}
                disabled={breadcrumbs.length <= 1}
                className="h-8 w-8"
              >
                ←
              </Button>
              <div className="text-xs text-muted-foreground truncate">
                {breadcrumbs.map((bc, index) => (
                  <span key={bc.id}>
                    {index > 0 && " / "}
                    {bc.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {localSelectedIds.length} de 3 archivos seleccionados
            </div>
          </div>

          <Separator />

          {/* Lista de elementos del árbol */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Recursos de kit</label>
            <ScrollArea className="h-[300px] border rounded-md">
              {loadingTree ? (
                <div className="space-y-1 p-1 pr-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : error ? (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3 m-2 mr-4">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              ) : currentNodes.length > 0 ? (
                <div className="space-y-1 p-1 pr-4">
                  {currentNodes.map((node) => {
                    if (node.kind === "folder") {
                      return (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => navigateToFolder(node)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border bg-background hover:bg-muted/70 text-left transition-colors cursor-pointer"
                        >
                          <Folder className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium truncate">{node.name}</span>
                        </button>
                      );
                    }

                    const disabled = !node.isSupportedForAi;
                    const isSelected = localSelectedIds.includes(node.id);

                    return (
                      <div
                        key={node.id}
                        className="flex items-start gap-3 p-3 rounded-md border hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={disabled}
                          onCheckedChange={() => {
                            if (!disabled) {
                              handleResourceToggle(node.id);
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span
                              className={`font-medium text-sm truncate ${
                                disabled ? "text-muted-foreground/60" : ""
                              }`}
                            >
                              {node.name}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {node.mimeType || "Tipo desconocido"}
                            {disabled && " · No soportado para análisis con AI"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {/* Líneas vacías estilo Finder para mantener altura fija */}
                  {Array.from({ length: Math.max(0, 5 - currentNodes.length) }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="h-12 border-b border-border/30 last:border-b-0"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No se encontraron recursos de kits para este workspace.
                  </div>
                  {/* Líneas vacías para mantener altura */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="h-12 border-b border-border/30 last:border-b-0"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Resumen de selección */}
          {localSelectedIds.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {localSelectedIds.length} de 3 archivos seleccionados
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Confirmar Selección</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
