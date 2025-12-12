"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isPreviewableFile } from "@/lib/file-preview-utils";
import type { KitItem } from "@/types/kit";

interface FilePreviewButtonProps {
  item: KitItem;
  onClick: () => void;
}

/**
 * Botón de preview que solo aparece para archivos compatibles
 */
export function FilePreviewButton({ item, onClick }: FilePreviewButtonProps) {
  // Solo mostrar para archivos que sean previewables
  if (item.type !== "file" || !isPreviewableFile(item.mimeType)) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="h-8 px-2"
      aria-label="Vista previa del archivo"
    >
      <Eye className="h-4 w-4" />
    </Button>
  );
}
