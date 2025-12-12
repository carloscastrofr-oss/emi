"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SortOption =
  | "alphabetical-asc"
  | "alphabetical-desc"
  | "recent"
  | "oldest"
  | "size-desc"
  | "size-asc";

interface SortControlProps {
  value: SortOption;
  onValueChange: (value: SortOption) => void;
  onToggleDirection?: () => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "alphabetical-asc", label: "Alfabético (A-Z)" },
  { value: "alphabetical-desc", label: "Alfabético (Z-A)" },
  { value: "recent", label: "Recientes" },
  { value: "oldest", label: "Antiguos" },
  { value: "size-desc", label: "Tamaño (mayor)" },
  { value: "size-asc", label: "Tamaño (menor)" },
];

export function SortControl({ value, onValueChange, onToggleDirection }: SortControlProps) {
  const [lastClickTime, setLastClickTime] = useState<number>(0);

  const handleSelectChange = (newValue: SortOption) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;

    // Si el mismo valor se selecciona y pasaron menos de 300ms, es un doble clic
    if (newValue === value && timeSinceLastClick < 300 && onToggleDirection) {
      onToggleDirection();
      setLastClickTime(0);
    } else {
      onValueChange(newValue);
      setLastClickTime(now);
    }
  };

  const currentOption = sortOptions.find((opt) => opt.value === value);
  const isAscending = value.includes("-asc") || value === "recent" || value === "size-asc";

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={handleSelectChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Ordenar por..." />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {onToggleDirection && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleDirection}
          className="h-9 w-9"
          title="Invertir orden"
        >
          {isAscending ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}
