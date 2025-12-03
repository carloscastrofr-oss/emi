"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HeatmapTab() {
  return (
    <Card className="rounded-expressive shadow-e2 h-full">
      <CardHeader>
        <CardTitle>Mapa de Calor Sintético</CardTitle>
        <CardDescription>
          Visualización de clics simulados. Las áreas naranjas indican mayor interacción.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[400px] bg-card border rounded-lg p-6 overflow-hidden font-sans">
          {/* Mock Shopping Cart UI */}
          <div className="flex flex-col h-full text-sm">
            <h3 className="text-lg font-bold mb-4 text-card-foreground">Tu Carrito</h3>
            <div className="flex items-center gap-4 py-4 border-b">
              <div className="w-16 h-16 bg-muted rounded-md" />
              <div className="flex-grow space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
            <div className="flex items-center gap-4 py-4">
              <div className="w-16 h-16 bg-muted rounded-md" />
              <div className="flex-grow space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
            <div className="mt-auto pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
              <Button className="w-full" disabled>
                Proceder al Pago
              </Button>
            </div>
          </div>

          {/* SYNTHETIC Heatmap Overlay - ORANGE */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-48 h-12 bg-orange-500/20 blur-2xl"></div>
            <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 w-32 h-8 bg-orange-500/30 blur-xl"></div>
            <div className="absolute top-[68px] left-[32px] w-20 h-20 rounded-md bg-amber-500/20 blur-lg"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
