"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonasTab } from "./personas-tab";
import { HeatmapTab } from "./heatmap-tab";
import { InsightsTab } from "./insights-tab";
import { Button } from "@/components/ui/button";
import { Download, PlayCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const mockTests = [
  { id: "demo-checkout", name: "Checkout para compradores con baja visión" },
  { id: "onboarding-v1", name: "Flujo de onboarding para nuevos usuarios" },
];

interface TestDashboardProps {
  onLaunchTest: () => void;
}

export function TestDashboard({ onLaunchTest }: TestDashboardProps) {
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Función no disponible",
      description: "La exportación de verbatims estará disponible próximamente.",
    });
  };

  return (
    <Card className="rounded-expressive shadow-e2">
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <CardTitle>Resultados del Test Sintético</CardTitle>
            <CardDescription>
              Visualiza los resultados de tus experimentos con usuarios sintéticos.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onLaunchTest}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Lanzar Nuevo Test
            </Button>
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>
        <div className="pt-4">
          <Select defaultValue={mockTests[0].id}>
            <SelectTrigger className="w-full md:w-[320px]">
              <SelectValue placeholder="Selecciona un test..." />
            </SelectTrigger>
            <SelectContent>
              {mockTests.map((test) => (
                <SelectItem key={test.id} value={test.id}>
                  {test.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="personas" className="w-full">
          <TabsList>
            <TabsTrigger value="personas">Personas</TabsTrigger>
            <TabsTrigger value="heatmap">Mapa de Calor</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          <TabsContent value="personas" className="mt-4">
            <PersonasTab />
          </TabsContent>
          <TabsContent value="heatmap" className="mt-4">
            <HeatmapTab />
          </TabsContent>
          <TabsContent value="insights" className="mt-4">
            <InsightsTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
