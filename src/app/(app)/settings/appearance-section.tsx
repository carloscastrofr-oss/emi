"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Palette, Monitor, Moon, Sun, Check } from "lucide-react";
import {
  usePreferencesStore,
  useThemeColor,
  useSetThemeColor,
  colorSchemes,
  type ThemeColor,
} from "@/stores/preferences-store";
import { useTheme as useNextTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function AppearanceSection() {
  const { theme, setTheme } = usePreferencesStore();
  const themeColor = useThemeColor();
  const setThemeColor = useSetThemeColor();
  const { setTheme: setNextTheme } = useNextTheme();

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    setNextTheme(newTheme);
  };

  const handleColorChange = (color: ThemeColor) => {
    setThemeColor(color);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Apariencia</CardTitle>
        </div>
        <CardDescription>Personaliza el tema y la apariencia de la aplicación.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base">Tema</Label>
          <RadioGroup value={theme} onValueChange={handleThemeChange}>
            <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent transition-colors">
              <RadioGroupItem value="light" id="light" />
              <Label
                htmlFor="light"
                className="flex-1 cursor-pointer flex items-center gap-3 font-normal"
              >
                <Sun className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">Claro</span>
                  <span className="text-xs text-muted-foreground">
                    Usa el tema claro para la interfaz
                  </span>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent transition-colors">
              <RadioGroupItem value="dark" id="dark" />
              <Label
                htmlFor="dark"
                className="flex-1 cursor-pointer flex items-center gap-3 font-normal"
              >
                <Moon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">Oscuro</span>
                  <span className="text-xs text-muted-foreground">
                    Usa el tema oscuro para la interfaz
                  </span>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent transition-colors">
              <RadioGroupItem value="system" id="system" />
              <Label
                htmlFor="system"
                className="flex-1 cursor-pointer flex items-center gap-3 font-normal"
              >
                <Monitor className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">Sistema</span>
                  <span className="text-xs text-muted-foreground">
                    Sigue la preferencia de tu sistema operativo
                  </span>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator className="my-6" />

        <div className="space-y-2">
          <Label className="text-base">Color del Tema</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Elige el color principal que se aplicará a toda la interfaz.
          </p>
          <div className="flex flex-wrap gap-4">
            {Object.values(colorSchemes).map((scheme) => {
              const isSelected = themeColor === scheme.name;
              return (
                <div key={scheme.name} className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleColorChange(scheme.name)}
                    className={cn(
                      "relative w-10 h-10 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      isSelected
                        ? "border-foreground scale-110 shadow-md"
                        : "border-border hover:border-foreground/50"
                    )}
                    style={{
                      backgroundColor: `hsl(${scheme.light.primary})`,
                    }}
                    aria-label={`Seleccionar color ${scheme.label}`}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="h-5 w-5 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {scheme.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
