"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { View } from "lucide-react";
import { motion } from "framer-motion";

interface HeatmapCardProps {
  title: string;
  description: string;
}

export function HeatmapCard({ title, description }: HeatmapCardProps) {
  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -4, boxShadow: "var(--tw-shadow-e8)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card className="rounded-expressive shadow-e2 h-full">
        <CardHeader className="flex flex-row items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <View className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[400px] bg-card border rounded-lg p-6 overflow-hidden font-sans">
            {/* Mock Shopping Cart UI */}
            <div className="flex flex-col h-full text-sm">
              <h3 className="text-lg font-bold mb-4 text-card-foreground">Tu Carrito</h3>

              {/* Item 1 */}
              <div className="flex items-center gap-4 py-4 border-b">
                <img
                  src="https://placehold.co/64x64.png"
                  alt="Producto"
                  className="rounded-md"
                  data-ai-hint="product image"
                />
                <div className="flex-grow">
                  <p className="font-semibold text-card-foreground">Zapatillas de Deporte</p>
                  <p className="text-xs text-muted-foreground">$129.99</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                    -
                  </Button>
                  <span className="w-4 text-center">1</span>
                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                    +
                  </Button>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-4 py-4">
                <img
                  src="https://placehold.co/64x64.png"
                  alt="Producto"
                  className="rounded-md"
                  data-ai-hint="clothing item"
                />
                <div className="flex-grow">
                  <p className="font-semibold text-card-foreground">Camiseta Gráfica</p>
                  <p className="text-xs text-muted-foreground">$39.99</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                    -
                  </Button>
                  <span className="w-4 text-center">2</span>
                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                    +
                  </Button>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-auto pt-4 border-t">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>$209.97</span>
                </div>
                <div className="flex justify-between text-muted-foreground mt-1">
                  <span>Envío</span>
                  <span>$5.00</span>
                </div>
                <div className="flex justify-between font-bold text-card-foreground mt-2 text-base">
                  <span>Total</span>
                  <span>$214.97</span>
                </div>
                <Button className="w-full mt-4">Proceder al Pago</Button>
              </div>
            </div>

            {/* Heatmap Overlay */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              {/* Heat spot on checkout button */}
              <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-48 h-12 bg-red-500/20 blur-2xl"></div>
              <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 w-32 h-8 bg-orange-500/30 blur-xl"></div>
              <div className="absolute bottom-[28px] left-[65%] -translate-x-1/2 w-16 h-5 bg-yellow-400/40 blur-lg"></div>

              {/* Heat spot on quantity '+' button for item 2 */}
              <div className="absolute top-[160px] right-[28px] w-10 h-10 rounded-full bg-orange-500/30 blur-lg"></div>

              {/* Heat spot on product image */}
              <div className="absolute top-[58px] left-[32px] w-12 h-12 rounded-md bg-blue-500/20 blur-lg"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
