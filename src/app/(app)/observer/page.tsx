
'use client';

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { View, TrendingUp, List, Download } from "lucide-react";
import { TopComponentsList } from "./top-components-list";
import { ObserverTrendChart } from "./observer-trend-chart";
import { RequireRole } from "@/components/auth/require-role";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "./date-range-picker";
import { InsightsCard } from "./insights-card";


export default function ObserverPage() {
    const { toast } = useToast();

    const handleExport = () => {
        toast({
            title: "Función no disponible",
            description: "La exportación de datos estará disponible próximamente.",
        });
    };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Observer"
        description="Visualiza la interacción del usuario y la adopción de componentes."
      />
      
      <motion.div
        whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)'}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Card className="rounded-expressive shadow-e2">
          <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <CardTitle>Filtros</CardTitle>
                    <CardDescription>Selecciona una página y un rango de fechas para acotar los datos.</CardDescription>
                </div>
                <RequireRole roles={['core', 'admin']}>
                    <Button onClick={handleExport} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Datos
                    </Button>
                </RequireRole>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <DateRangePicker />
            <Select defaultValue="/checkout">
              <SelectTrigger className="w-full md:w-[280px]">
                <SelectValue placeholder="Seleccionar página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="/checkout">Carrito de Compras (/checkout)</SelectItem>
                <SelectItem value="/home">Página de Inicio (/home)</SelectItem>
                <SelectItem value="/product/123">Detalle de Producto (/product/...)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
            className="h-full"
            whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)'}}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <Card className="rounded-expressive shadow-e2 h-full">
                <CardHeader className="flex flex-row items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <View className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>Mapa de Calor de Interacción</CardTitle>
                    <CardDescription>Visualización en vivo de la densidad de clics por componente.</CardDescription>
                </div>
                </CardHeader>
                <CardContent>
                <div className="flex items-center justify-center h-[400px] w-full bg-muted rounded-lg">
                    <p className="text-muted-foreground">Próximamente: Mapa de calor del componente...</p>
                </div>
                </CardContent>
            </Card>
        </motion.div>

        <motion.div
            className="h-full"
            whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)'}}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <InsightsCard />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
              className="lg:col-span-1 h-full"
              whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)'}}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
              <Card className="rounded-expressive shadow-e2 h-full">
                  <CardHeader className="flex flex-row items-center gap-4">
                       <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <List className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                          <CardTitle>Componentes Principales</CardTitle>
                          <CardDescription>Clasificación de uso de componentes.</CardDescription>
                      </div>
                  </CardHeader>
                  <CardContent>
                      <TopComponentsList />
                  </CardContent>
              </Card>
          </motion.div>
          <motion.div
              className="lg:col-span-2 h-full"
              whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)'}}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
              <Card className="rounded-expressive shadow-e2 h-full">
                  <CardHeader className="flex flex-row items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                          <CardTitle>Tendencia de Adopción</CardTitle>
                          <CardDescription>Adopción de componentes en los últimos 6 meses.</CardDescription>
                      </div>
                  </CardHeader>
                  <CardContent>
                      <ObserverTrendChart />
                  </CardContent>
              </Card>
          </motion.div>
      </div>
    </div>
  );
}
