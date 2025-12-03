"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelBuilder } from "./panel-builder";
import { TestDashboard } from "./test-dashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { ResearchSynthAgentCard } from "../ai-toolkit/research-synth-agent-card";

export default function SyntheticUsersPage() {
  const [activeTab, setActiveTab] = useState("builder");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Usuarios Sintéticos"
        description="Valida ideas de diseño en etapas tempranas con paneles de usuarios generados por IA."
      />

      <Alert
        variant="destructive"
        className="bg-orange-100 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-200 [&>svg]:text-orange-600"
      >
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Entorno de Simulación</AlertTitle>
        <AlertDescription>
          Los datos en esta sección son generados por IA y no reemplazan la investigación con
          usuarios reales. Úsalo como un primer filtro para validar hipótesis.
          <a
            href="https://www.nngroup.com/articles/ai-personas/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline ml-1"
          >
            Saber más.
          </a>
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="builder">Constructor de Paneles</TabsTrigger>
          <TabsTrigger value="dashboard">Panel de Pruebas</TabsTrigger>
          <TabsTrigger value="synth">Síntesis de Investigación</TabsTrigger>
        </TabsList>
        <TabsContent value="builder">
          <PanelBuilder />
        </TabsContent>
        <TabsContent value="dashboard">
          <TestDashboard onLaunchTest={() => setActiveTab("builder")} />
        </TabsContent>
        <TabsContent value="synth">
          <div className="pt-6 max-w-2xl mx-auto">
            <ResearchSynthAgentCard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
