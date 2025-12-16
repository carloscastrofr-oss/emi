"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Loader2, Play } from "lucide-react";
import { useLoadingStore } from "@/stores/loading-store";
import {
  useLoadingPreferences,
  useSetLoadingVariant,
  useSetLoadingSize,
  useSetLoadingShowDelay,
  type SpinnerVariant,
  type SpinnerSize,
} from "@/stores/loading-preferences-store";

const variantLabels: Record<SpinnerVariant, { label: string; description: string }> = {
  default: {
    label: "Circular",
    description: "Spinner circular con rotación suave",
  },
  pulse: {
    label: "Pulso",
    description: "Animación de pulso suave",
  },
  dots: {
    label: "Puntos",
    description: "Tres puntos animados",
  },
  bars: {
    label: "Barras",
    description: "Barras verticales animadas",
  },
};

const sizeLabels: Record<SpinnerSize, { label: string; description: string }> = {
  sm: {
    label: "Pequeño",
    description: "Tamaño compacto",
  },
  md: {
    label: "Mediano",
    description: "Tamaño estándar",
  },
  lg: {
    label: "Grande",
    description: "Tamaño destacado",
  },
};

export function LoadingStateSection() {
  const preferences = useLoadingPreferences();
  const setVariant = useSetLoadingVariant();
  const setSize = useSetLoadingSize();
  const setShowDelay = useSetLoadingShowDelay();
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("Cargando...");
  const { startLoading, stopLoading } = useLoadingStore();

  const handleVariantChange = (variant: SpinnerVariant) => {
    setVariant(variant);
  };

  const handleSizeChange = (size: SpinnerSize) => {
    setSize(size);
  };

  const handleDelayChange = (value: number[]) => {
    setShowDelay(value[0] ?? 150);
  };

  const handlePreview = () => {
    setIsPreviewing(true);
    const loadingId = startLoading(previewMessage);

    // Detener después de 3 segundos
    setTimeout(() => {
      stopLoading(loadingId);
      setIsPreviewing(false);
    }, 3000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Estado de Carga</CardTitle>
        </div>
        <CardDescription>
          Personaliza la apariencia y comportamiento del indicador de carga global.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Variante del Spinner */}
        <div className="space-y-2">
          <Label className="text-base">Variante del Spinner</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Elige el estilo de animación del indicador de carga.
          </p>
          <RadioGroup value={preferences.variant} onValueChange={handleVariantChange}>
            {(Object.keys(variantLabels) as SpinnerVariant[]).map((variant) => {
              const variantInfo = variantLabels[variant];
              return (
                <div
                  key={variant}
                  className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <RadioGroupItem value={variant} id={variant} />
                  <Label
                    htmlFor={variant}
                    className="flex-1 cursor-pointer flex items-center gap-3 font-normal"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{variantInfo.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {variantInfo.description}
                      </span>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <Separator />

        {/* Tamaño del Spinner */}
        <div className="space-y-2">
          <Label className="text-base">Tamaño del Spinner</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Selecciona el tamaño del indicador de carga.
          </p>
          <RadioGroup value={preferences.size} onValueChange={handleSizeChange}>
            {(Object.keys(sizeLabels) as SpinnerSize[]).map((size) => {
              const sizeInfo = sizeLabels[size];
              return (
                <div
                  key={size}
                  className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <RadioGroupItem value={size} id={size} />
                  <Label
                    htmlFor={size}
                    className="flex-1 cursor-pointer flex items-center gap-3 font-normal"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{sizeInfo.label}</span>
                      <span className="text-xs text-muted-foreground">{sizeInfo.description}</span>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <Separator />

        {/* Delay antes de mostrar */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">Delay antes de mostrar</Label>
            <p className="text-sm text-muted-foreground">
              Tiempo en milisegundos antes de mostrar el indicador (evita flash en cargas rápidas).
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Slider
                value={[preferences.showDelay]}
                onValueChange={handleDelayChange}
                min={0}
                max={1000}
                step={50}
                className="flex-1"
              />
              <div className="w-20">
                <Input
                  type="number"
                  value={preferences.showDelay}
                  onChange={(e) =>
                    handleDelayChange([
                      Math.max(0, Math.min(1000, parseInt(e.target.value, 10) || 0)),
                    ])
                  }
                  min={0}
                  max={1000}
                  step={50}
                  className="text-right"
                />
              </div>
              <span className="text-sm text-muted-foreground w-12">ms</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Valor recomendado: 150ms. Cargas menores a este tiempo no mostrarán el indicador.
            </p>
          </div>
        </div>

        <Separator />

        {/* Mensaje de ejemplo */}
        <div className="space-y-2">
          <Label htmlFor="loading-message" className="text-base">
            Mensaje de ejemplo
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Texto que se mostrará debajo del spinner durante la carga.
          </p>
          <Input
            id="loading-message"
            value={previewMessage}
            onChange={(e) => setPreviewMessage(e.target.value)}
            placeholder="Ej: Cargando datos..."
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">{previewMessage.length}/100 caracteres</p>
        </div>

        <Separator />

        {/* Botón de Preview */}
        <div className="space-y-2">
          <Label className="text-base">Vista Previa</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Prueba cómo se verá el indicador de carga con la configuración actual.
          </p>
          <Button
            type="button"
            onClick={handlePreview}
            disabled={isPreviewing}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {isPreviewing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mostrando preview...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Ver Preview (3 segundos)
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            El preview mostrará el indicador durante 3 segundos con la configuración actual.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
