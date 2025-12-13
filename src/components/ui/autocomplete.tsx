"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AutocompleteProps {
  options: string[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Autocomplete({
  options,
  value = "",
  onValueChange,
  placeholder = "Selecciona o escribe...",
  className,
  disabled,
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");

  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onValueChange(newValue);
    setOpen(true);
  };

  const handleSelect = (selectedValue: string) => {
    setInputValue(selectedValue);
    onValueChange(selectedValue);
    setOpen(false);
  };

  const handleInputFocus = () => {
    setOpen(true);
  };

  // Filtrar opciones basado en el input
  const filteredOptions = React.useMemo(() => {
    if (!inputValue.trim()) return options;
    const search = inputValue.toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(search));
  }, [options, inputValue]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <div className="w-full">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={(e) => {
              handleInputFocus();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!open) {
                setOpen(true);
              }
            }}
            placeholder={placeholder}
            className={className}
            disabled={disabled}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onEscapeKeyDown={() => setOpen(false)}
      >
        <Command shouldFilter={false}>
          <CommandList>
            <CommandEmpty>No se encontraron opciones.</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => {
                const isSelected = value === option;
                return (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(option)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
                    />
                    {option}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
