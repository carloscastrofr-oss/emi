"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { TopComponentsList } from "./top-components-list";
import { ObserverTrendChart } from "./observer-trend-chart";
import { InsightsCard } from "./insights-card";
import { HeatmapCard } from "./heatmap-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, List } from "lucide-react";
import { motion } from "framer-motion";
import { ABTestControls, Analysis } from "./ab-test-controls";
import { StatsCompareCard } from "./stats-compare-card";
import { PerformanceCard } from "./performance-card";

const mockTests = [
  { id: "demoCheckout", name: "Color del CTA en Checkout" },
  { id: "onboardingModal", name: "Modal de Onboarding v3" },
  { id: "pricingPageLayout", name: "Layout de Página de Precios" },
];

export default function ObserverPage() {
  const [analysis, setAnalysis] = useState<Analysis>({ type: "page", id: "/checkout" });

  const isABMode = analysis.type === "test" && !!analysis.id;

  const getHeatmapTitle = () => {
    if (analysis.type === "page" && analysis.id) {
      return `Mapa de Calor: ${analysis.id}`;
    }
    if (analysis.type === "test" && analysis.id) {
      const testName = mockTests.find((t) => t.id === analysis.id)?.name;
      return testName ? `Heatmap: ${testName} (Variante A)` : "Mapa de Calor";
    }
    return "Mapa de Calor de Interacción";
  };

  const getHeatmapDescription = () => {
    if (analysis.type === "page" || analysis.type === "test") {
      return "Visualización de clics para la selección actual.";
    }
    return "Visualización en vivo de la densidad de clics por componente.";
  };

  const renderContent = () => {
    switch (analysis.type) {
      case "performance":
        return analysis.id ? <PerformanceCard item={analysis.id} /> : null;
      case "test":
        return isABMode ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <HeatmapCard title="Variante A" description="Heatmap para la variante de control." />
              <HeatmapCard title="Variante B" description="Heatmap para la nueva variante." />
            </div>
            <StatsCompareCard />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InsightsCard variant="A" />
              <InsightsCard variant="B" />
            </div>
          </>
        ) : null;
      case "audit":
        return null; // The content is within the ABTestControls card itself.
      case "page":
      default:
        return (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <HeatmapCard title={getHeatmapTitle()} description={getHeatmapDescription()} />
              <InsightsCard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <motion.div
                className="lg:col-span-1 h-full"
                whileHover={{ y: -4, boxShadow: "var(--tw-shadow-e8)" }}
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
                whileHover={{ y: -4, boxShadow: "var(--tw-shadow-e8)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card className="rounded-expressive shadow-e2 h-full">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Tendencia de Adopción</CardTitle>
                      <CardDescription>
                        Adopción de componentes en los últimos 6 meses.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ObserverTrendChart />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Observer"
        description="Visualiza la interacción del usuario, la adopción de componentes y ejecuta experimentos A/B."
      />

      <ABTestControls analysis={analysis} onAnalysisChange={setAnalysis} />

      <div className="space-y-8">{renderContent()}</div>
    </div>
  );
}
