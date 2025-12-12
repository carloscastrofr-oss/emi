"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { KitItem } from "@/types/kit";
import { getFileTypeCategory, isPreviewableFile } from "@/lib/file-preview-utils";
import { cn } from "@/lib/utils";
import { PdfViewer } from "./pdf-viewer";

interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: KitItem | null;
  items: KitItem[];
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "Tamaño desconocido";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Visor de archivos estilo macOS con preview de PDF e imágenes
 */
export function FilePreviewDialog({ open, onOpenChange, item, items }: FilePreviewDialogProps) {
  const [currentItem, setCurrentItem] = useState<KitItem | null>(item);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageZoomRef = useRef(1); // Ref para mantener el valor actual de zoom sin recrear listeners
  const listenersAddedRef = useRef(false); // Ref para rastrear si los listeners ya fueron agregados

  // Filtrar solo archivos previewables (memoizado para evitar recálculos)
  const previewableItems = useMemo(
    () =>
      items.filter((i) => i.type === "file" && isPreviewableFile(i.mimeType)) as Array<
        Extract<KitItem, { type: "file" }>
      >,
    [items]
  );

  // Determinar el tipo de archivo
  const fileType = currentItem
    ? getFileTypeCategory(currentItem.type === "file" ? currentItem.mimeType : null)
    : null;
  const isPdf = fileType === "pdf";
  const isImage = fileType === "image";

  // Actualizar item actual cuando cambia el prop (solo cuando se abre el dialog)
  const prevOpenRef = useRef(false);
  useEffect(() => {
    // Solo actualizar cuando el dialog se abre (transición de closed a open)
    if (item && open && !prevOpenRef.current) {
      const index = previewableItems.findIndex((i) => i.id === item.id);
      if (index !== -1) {
        setCurrentIndex(index);
        setCurrentItem(item);
      } else if (previewableItems.length > 0 && previewableItems[0]) {
        // Si el item no está en previewableItems, usar el primero disponible
        setCurrentIndex(0);
        setCurrentItem(previewableItems[0]);
      }
    }
    prevOpenRef.current = open;
  }, [item?.id, open, previewableItems]); // Solo cuando cambia el ID del item o se abre/cierra el dialog

  // Reset zoom y posición al cambiar de archivo
  useEffect(() => {
    if (currentItem) {
      setImageZoom(1);
      imageZoomRef.current = 1; // Sincronizar el ref también
      setImagePosition({ x: 0, y: 0 });
      setError(null);
      // Solo mostrar loading para imágenes
      const fileType = getFileTypeCategory(
        currentItem.type === "file" ? currentItem.mimeType : null
      );
      if (fileType === "image") {
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }
    }
  }, [currentItem]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const newItem = previewableItems[newIndex];
      if (newItem) {
        setCurrentIndex(newIndex);
        setCurrentItem(newItem);
        // Resetear estados inmediatamente
        setError(null);
      }
    }
  }, [currentIndex, previewableItems]);

  const handleNext = useCallback(() => {
    if (currentIndex < previewableItems.length - 1) {
      const newIndex = currentIndex + 1;
      const newItem = previewableItems[newIndex];
      if (newItem) {
        setCurrentIndex(newIndex);
        setCurrentItem(newItem);
        // Resetear estados inmediatamente
        setError(null);
      }
    }
  }, [currentIndex, previewableItems]);

  // Navegación con teclado
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handlePrevious, handleNext, onOpenChange]);

  const handleZoomIn = () => {
    setImageZoom((prev) => {
      const newZoom = Math.min(prev + 0.25, 3);
      imageZoomRef.current = newZoom;
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    setImageZoom((prev) => {
      const newZoom = Math.max(prev - 0.25, 0.5);
      imageZoomRef.current = newZoom;
      return newZoom;
    });
  };

  const handleResetZoom = () => {
    setImageZoom(1);
    imageZoomRef.current = 1;
    setImagePosition({ x: 0, y: 0 });
  };

  // Función para agregar listeners al contenedor
  const addListeners = useCallback(
    (container: HTMLDivElement) => {
      if (listenersAddedRef.current) {
        return;
      }

      listenersAddedRef.current = true;

      const handleWheel = (e: WheelEvent) => {
        // Detectar gestos de zoom (pinch en Mac trackpad)
        // Los gestos de pinch pueden venir con:
        // 1. ctrlKey/metaKey = true (configuración estándar de Mac)
        // 2. deltaMode === 0 (pixels) con valores pequeños en ambos ejes (gesto de pinch)

        // SOLO hacer zoom si se presiona Ctrl o Cmd explícitamente
        // Los gestos de pinch en Mac trackpad vienen con ctrlKey=true o metaKey=true
        // El scroll normal de dos dedos NO tiene estas teclas, así que no debe hacer zoom
        const isZoomGesture = e.ctrlKey || e.metaKey;

        if (isZoomGesture) {
          e.preventDefault();
          e.stopPropagation();
          // Determinar la dirección del zoom basándose en el deltaY
          // En Mac trackpad: deltaY negativo = pinch out (zoom in), deltaY positivo = pinch in (zoom out)
          const delta = e.deltaY < 0 ? 0.1 : -0.1; // Negativo = zoom in, positivo = zoom out
          setImageZoom((prev) => {
            const newZoom = Math.max(0.5, Math.min(3, prev + delta));
            imageZoomRef.current = newZoom; // Sincronizar el ref
            return newZoom;
          });
          return;
        }
        // Si no es un gesto de zoom, NO hacer preventDefault - permitir scroll normal
      };

      // Manejar gestos táctiles (pinch en pantallas táctiles)
      let initialDistance = 0;
      let initialZoom = 1;
      let isPinching = false;

      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
          isPinching = true;
          e.preventDefault();
          e.stopPropagation();
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          if (touch1 && touch2) {
            initialDistance = Math.hypot(
              touch2.clientX - touch1.clientX,
              touch2.clientY - touch1.clientY
            );
            // Usar el valor actual de imageZoom desde el ref (sin causar re-render)
            initialZoom = imageZoomRef.current;
          }
        } else {
          isPinching = false;
          initialDistance = 0;
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 2 && isPinching && initialDistance > 0) {
          e.preventDefault();
          e.stopPropagation();
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          if (touch1 && touch2) {
            const currentDistance = Math.hypot(
              touch2.clientX - touch1.clientX,
              touch2.clientY - touch1.clientY
            );
            const scale = currentDistance / initialDistance;
            const newZoom = Math.max(0.5, Math.min(3, initialZoom * scale));
            setImageZoom(newZoom);
            imageZoomRef.current = newZoom; // Sincronizar el ref
          }
        }
      };

      const handleTouchEnd = (e: TouchEvent) => {
        if (e.touches.length < 2) {
          isPinching = false;
          initialDistance = 0;
        }
      };

      // Agregar listeners con { passive: false } para poder usar preventDefault
      // Usar capture: false para no interferir con el scroll normal
      // Para wheel, usar capture: true puede ayudar a capturar gestos de pinch antes que otros handlers
      const wheelOptions: AddEventListenerOptions = { passive: false, capture: true };
      const touchOptions: AddEventListenerOptions = { passive: false };

      container.addEventListener("wheel", handleWheel, wheelOptions);
      container.addEventListener("touchstart", handleTouchStart, touchOptions);
      container.addEventListener("touchmove", handleTouchMove, touchOptions);
      container.addEventListener("touchend", handleTouchEnd, touchOptions);

      // Retornar función de cleanup
      return () => {
        container.removeEventListener("wheel", handleWheel, wheelOptions);
        container.removeEventListener("touchstart", handleTouchStart, touchOptions);
        container.removeEventListener("touchmove", handleTouchMove, touchOptions);
        container.removeEventListener("touchend", handleTouchEnd, touchOptions);
        listenersAddedRef.current = false;
      };
    },
    [isImage]
  );

  // Manejar wheel events y gestos táctiles con listener nativo
  useEffect(() => {
    if (!isImage) {
      listenersAddedRef.current = false;
      return;
    }

    const container = imageContainerRef.current;
    if (!container) {
      return;
    }

    // Intentar agregar listeners
    addListeners(container);
  }, [isImage, addListeners]);

  // Callback ref que se ejecuta cuando el elemento se monta
  const setImageContainerRef = useCallback(
    (element: HTMLDivElement | null) => {
      if (imageContainerRef) {
        (imageContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
      }

      // Si el elemento está disponible y es una imagen, intentar agregar los listeners
      if (element && isImage) {
        // Usar setTimeout para asegurar que el elemento esté completamente montado
        setTimeout(() => {
          addListeners(element);
        }, 0);
      }
    },
    [isImage, addListeners]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Solo activar drag si está zoomed y es el botón izquierdo
      if (imageZoom > 1 && e.button === 0) {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
          x: e.clientX - imagePosition.x,
          y: e.clientY - imagePosition.y,
        });
      }
    },
    [imageZoom, imagePosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && imageZoom > 1) {
        e.preventDefault();
        setImagePosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, imageZoom, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  const handleDownload = () => {
    if (currentItem?.type === "file") {
      window.open(currentItem.fileUrl, "_blank");
    }
  };

  if (!currentItem || currentItem.type !== "file") {
    return null;
  }

  const dateText = formatDistanceToNow(new Date(currentItem.uploadedAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/60 backdrop-blur-md" />
      <DialogContent
        className={cn(
          "max-w-[95vw] max-h-[95vh] w-full h-full p-0 gap-0 overflow-hidden [&>button]:hidden left-[50%] translate-x-[-50%] flex flex-col",
          isPdf ? "top-[50%] translate-y-[-50%]" : "top-0 translate-y-0"
        )}
      >
        {/* DialogTitle y Description ocultos para accesibilidad */}
        <DialogTitle className="sr-only">
          {currentItem ? `Vista previa: ${currentItem.title}` : "Vista previa de archivo"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {currentItem
            ? `Vista previa del archivo ${currentItem.title}. Usa las flechas del teclado para navegar entre archivos, ESC para cerrar.`
            : "Vista previa de archivo"}
        </DialogDescription>
        {/* Header con metadatos */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur-sm flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{currentItem.title}</h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>{formatFileSize(currentItem.fileSize)}</span>
              {currentItem.mimeType && (
                <span className="font-mono text-xs">{currentItem.mimeType}</span>
              )}
              <span>{dateText}</span>
              {currentItem.uploadedBy && <span>Subido por: {currentItem.uploadedBy}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {isImage && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={imageZoom <= 0.5}
                  aria-label="Alejar"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                  {Math.round(imageZoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={imageZoom >= 3}
                  aria-label="Acercar"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetZoom}
                  disabled={imageZoom === 1}
                  aria-label="Resetear zoom"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={handleDownload} aria-label="Descargar">
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Contenido del visor */}
        <div
          className={cn(
            "flex-1 relative overflow-hidden bg-muted/30 min-h-0",
            isPdf && "flex items-center justify-center"
          )}
        >
          {/* Navegación anterior/siguiente */}
          {previewableItems.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm shadow-lg",
                  currentIndex === 0 && "opacity-50 cursor-not-allowed"
                )}
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                aria-label="Archivo anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm shadow-lg",
                  currentIndex === previewableItems.length - 1 && "opacity-50 cursor-not-allowed"
                )}
                onClick={handleNext}
                disabled={currentIndex === previewableItems.length - 1}
                aria-label="Archivo siguiente"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm shadow-lg text-sm text-muted-foreground">
                {currentIndex + 1} / {previewableItems.length}
              </div>
            </>
          )}

          {/* Contenido según tipo de archivo */}
          <ScrollArea
            className={cn(
              "h-full w-full",
              isPdf && "[&>div]:flex [&>div]:items-center [&>div]:justify-center"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center p-8",
                isPdf ? "h-full" : "min-h-full"
              )}
            >
              {isLoading && !error && (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Cargando archivo...</p>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center gap-4 text-center">
                  <p className="text-destructive">{error}</p>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cerrar
                  </Button>
                </div>
              )}

              {isPdf && !error && <PdfViewer key={currentItem.id} fileUrl={currentItem.fileUrl} />}

              {isImage && !error && (
                <div
                  ref={setImageContainerRef}
                  className="flex items-center justify-center w-full h-full overflow-auto touch-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{
                    cursor: imageZoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
                    touchAction: "none", // Prevenir zoom nativo del navegador
                  }}
                >
                  <img
                    key={currentItem.id}
                    src={currentItem.fileUrl}
                    alt={currentItem.title}
                    draggable={false}
                    className="max-w-full max-h-full object-contain shadow-lg rounded-lg select-none"
                    style={{
                      transform: `scale(${imageZoom}) translate(${imagePosition.x / imageZoom}px, ${imagePosition.y / imageZoom}px)`,
                      transition: isDragging ? "none" : "transform 0.1s ease-out",
                      pointerEvents: isDragging ? "none" : "auto",
                    }}
                    onLoad={() => {
                      setIsLoading(false);
                      setError(null);
                    }}
                    onError={() => {
                      setError("Error al cargar la imagen");
                      setIsLoading(false);
                    }}
                  />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
