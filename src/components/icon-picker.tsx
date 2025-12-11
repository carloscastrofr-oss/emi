"use client";

import * as React from "react";
import { Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

// Lista de iconos populares de Lucide React (solo los que realmente existen)
const popularIcons = [
  "Package",
  "FileText",
  "Github",
  "Palette",
  "SwatchBook",
  "ShoppingCart",
  "Folder",
  "File",
  "Image",
  "Video",
  "Music",
  "Code",
  "Database",
  "Server",
  "Cloud",
  "Download",
  "Upload",
  "Link",
  "Book",
  "BookOpen",
  "Layers",
  "Box",
  "Archive",
  "Briefcase",
  "Rocket",
  "Zap",
  "Star",
  "Heart",
  "Flag",
  "Target",
  "Award",
  "Trophy",
  "Shield",
  "Lock",
  "Key",
  "Settings",
  "Tool",
  "Wrench",
  "Hammer",
  "Puzzle",
  "PieChart",
  "BarChart",
  "LineChart",
  "TrendingUp",
  "TrendingDown",
  "Activity",
  "Bell",
  "Mail",
  "MessageSquare",
  "Users",
  "User",
  "UserPlus",
  "Globe",
  "Map",
  "Compass",
  "Navigation",
  "Home",
  "Building",
  "Store",
  "ShoppingBag",
  "CreditCard",
  "Wallet",
  "DollarSign",
  "Camera",
  "Film",
  "Mic",
  "Headphones",
  "Monitor",
  "Smartphone",
  "Tablet",
  "Laptop",
  "Mouse",
  "Keyboard",
  "Printer",
  "HardDrive",
  "Cpu",
  "Wifi",
  "Bluetooth",
  "Battery",
  "Plug",
  "Power",
  "Sun",
  "Moon",
  "CloudRain",
  "CloudSnow",
  "Wind",
  "Droplet",
  "Flame",
  "Leaf",
  "Tree",
  "Coffee",
  "Gift",
  "Crown",
  "Gem",
  "Diamond",
  "Coins",
  "Banknote",
] as const;

interface IconPickerProps {
  readonly value?: string;
  readonly onSelect: (iconName: string) => void;
  readonly className?: string;
}

export function IconPicker({ value, onSelect, className }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);

  // Obtener el componente de icono actual
  const SelectedIcon =
    value && value in LucideIcons
      ? (LucideIcons[value as keyof typeof LucideIcons] as React.ComponentType<{
          className?: string;
        }>)
      : LucideIcons.Package;

  // Filtrar iconos disponibles (solo los que existen en Lucide)
  const availableIcons = popularIcons.filter((iconName) => iconName in LucideIcons);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <SelectedIcon className="h-4 w-4" />
            <span className="truncate">{value || "Seleccionar icono"}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar icono..." />
          <CommandList>
            <CommandEmpty>No se encontró el icono.</CommandEmpty>
            <CommandGroup>
              <div className="grid grid-cols-8 gap-2 p-2">
                {availableIcons.map((iconName) => {
                  const IconComponent = LucideIcons[
                    iconName as keyof typeof LucideIcons
                  ] as React.ComponentType<{
                    className?: string;
                  }>;
                  const isSelected = value === iconName;
                  return (
                    <CommandItem
                      key={iconName}
                      value={iconName}
                      onSelect={() => {
                        onSelect(iconName);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-md border border-transparent hover:border-primary hover:bg-accent cursor-pointer",
                        isSelected && "border-primary bg-accent"
                      )}
                    >
                      {IconComponent && <IconComponent className="h-5 w-5" />}
                      {isSelected && (
                        <Check className="absolute right-1 top-1 h-3 w-3 text-primary" />
                      )}
                    </CommandItem>
                  );
                })}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
