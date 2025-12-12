"use client";

import { Button } from "@/components/ui/button";
import { FileText, Link as LinkIcon, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterType = "files-only" | "links-only" | "my-files";

export interface FilterState {
  type?: FilterType; // "files-only" | "links-only"
  myFiles: boolean; // Solo mis archivos/enlaces
}

interface FilterControlProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  currentUserEmail?: string;
}

export function FilterControl({ filters, onFiltersChange, currentUserEmail }: FilterControlProps) {
  const handleTypeToggle = (type: FilterType) => {
    if (filters.type === type) {
      // Si ya está activo, desactivarlo
      onFiltersChange({ ...filters, type: undefined });
    } else {
      // Activar el nuevo tipo
      onFiltersChange({ ...filters, type });
    }
  };

  const handleMyFilesToggle = () => {
    onFiltersChange({ ...filters, myFiles: !filters.myFiles });
  };

  const hasActiveFilters = filters.type || filters.myFiles;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={filters.type === "files-only" ? "default" : "outline"}
        size="sm"
        onClick={() => handleTypeToggle("files-only")}
        className={cn(
          "h-9 gap-2",
          filters.type === "files-only" && "bg-primary text-primary-foreground"
        )}
      >
        <FileText className="h-4 w-4" />
        Solo archivos
        {filters.type === "files-only" && (
          <X
            className="h-3 w-3 ml-1"
            onClick={(e) => {
              e.stopPropagation();
              handleTypeToggle("files-only");
            }}
          />
        )}
      </Button>

      <Button
        variant={filters.type === "links-only" ? "default" : "outline"}
        size="sm"
        onClick={() => handleTypeToggle("links-only")}
        className={cn(
          "h-9 gap-2",
          filters.type === "links-only" && "bg-primary text-primary-foreground"
        )}
      >
        <LinkIcon className="h-4 w-4" />
        Solo enlaces
        {filters.type === "links-only" && (
          <X
            className="h-3 w-3 ml-1"
            onClick={(e) => {
              e.stopPropagation();
              handleTypeToggle("links-only");
            }}
          />
        )}
      </Button>

      <Button
        variant={filters.myFiles ? "default" : "outline"}
        size="sm"
        onClick={handleMyFilesToggle}
        disabled={!currentUserEmail}
        className={cn("h-9 gap-2", filters.myFiles && "bg-primary text-primary-foreground")}
      >
        <User className="h-4 w-4" />
        Mis archivos
        {filters.myFiles && (
          <X
            className="h-3 w-3 ml-1"
            onClick={(e) => {
              e.stopPropagation();
              handleMyFilesToggle();
            }}
          />
        )}
      </Button>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFiltersChange({ type: undefined, myFiles: false })}
          className="h-9 gap-2 text-muted-foreground hover:text-foreground"
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
