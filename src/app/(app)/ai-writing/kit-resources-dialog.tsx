"use client";

import { useState, useEffect } from "react";
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
import { FileText, Link as LinkIcon, Package } from "lucide-react";
import { fetchKits, fetchKitResources } from "./actions";
import type { Kit, KitItem } from "@/types/kit";

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
  const [kits, setKits] = useState<Kit[]>([]);
  const [selectedKitId, setSelectedKitId] = useState<string | null>(null);
  const [resources, setResources] = useState<KitItem[]>([]);
  const [loadingKits, setLoadingKits] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedResourceIds);

  useEffect(() => {
    setLocalSelectedIds(selectedResourceIds);
  }, [selectedResourceIds]);

  useEffect(() => {
    if (open) {
      loadKits();
    }
  }, [open]);

  useEffect(() => {
    if (selectedKitId) {
      loadResources(selectedKitId);
    } else {
      setResources([]);
    }
  }, [selectedKitId]);

  async function loadKits() {
    setLoadingKits(true);
    try {
      const kitsData = await fetchKits();
      setKits(kitsData);
    } catch (error) {
      console.error("Error loading kits:", error);
    } finally {
      setLoadingKits(false);
    }
  }

  async function loadResources(kitId: string) {
    setLoadingResources(true);
    try {
      const resourcesData = await fetchKitResources(kitId);
      setResources(resourcesData);
    } catch (error) {
      console.error("Error loading resources:", error);
      setResources([]);
    } finally {
      setLoadingResources(false);
    }
  }

  function handleResourceToggle(resourceId: string) {
    setLocalSelectedIds((prev) => {
      if (prev.includes(resourceId)) {
        return prev.filter((id) => id !== resourceId);
      } else {
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
    setSelectedKitId(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Seleccionar Recursos de Kit</DialogTitle>
          <DialogDescription>
            Selecciona los recursos de kits que quieres incluir como contexto para la generación de
            contenido.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Selector de Kit */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Seleccionar Kit</label>
            {loadingKits ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {kits.map((kit) => (
                  <Button
                    key={kit.id}
                    variant={selectedKitId === kit.id ? "default" : "outline"}
                    onClick={() => setSelectedKitId(kit.id)}
                    className="justify-start"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    {kit.title}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Lista de Recursos */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <label className="text-sm font-medium mb-2">
              Recursos {selectedKitId && `(${resources.length})`}
            </label>
            <ScrollArea className="flex-1">
              {loadingResources ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : selectedKitId ? (
                resources.length > 0 ? (
                  <div className="space-y-2 pr-4">
                    {resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-start gap-3 p-3 rounded-md border hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          checked={localSelectedIds.includes(resource.id)}
                          onCheckedChange={() => handleResourceToggle(resource.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {resource.type === "file" ? (
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium text-sm">{resource.title}</span>
                          </div>
                          {resource.type === "link" && resource.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {resource.description}
                            </p>
                          )}
                          {resource.type === "file" && (
                            <p className="text-xs text-muted-foreground">{resource.name}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No hay recursos disponibles en este kit.
                  </div>
                )
              ) : (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Selecciona un kit para ver sus recursos.
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Resumen de selección */}
          {localSelectedIds.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {localSelectedIds.length} recurso{localSelectedIds.length !== 1 ? "s" : ""}{" "}
              seleccionado
              {localSelectedIds.length !== 1 ? "s" : ""}
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
