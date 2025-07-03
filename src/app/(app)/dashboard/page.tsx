'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { DollarSign, Package, AlertTriangle, TrendingUp } from "lucide-react";
import { AdoptionChart } from "./adoption-chart";
import { UsageChart } from "./usage-chart";

const kpis = [
  {
    title: "Adopción de Componentes",
    value: "82%",
    change: "+5.2% desde el mes pasado",
    icon: Package,
  },
  {
    title: "Uso de Tokens",
    value: "95%",
    change: "+1.0% desde el mes pasado",
    icon: TrendingUp,
  },
  {
    title: "Problemas de Accesibilidad",
    value: "12",
    change: "-3 desde la semana pasada",
    icon: AlertTriangle,
  },
  {
    title: "ROI Estimado",
    value: "$120,500",
    change: "+$15k este trimestre",
    icon: DollarSign,
  },
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="EMI.Métricas"
        description="Indicadores clave de rendimiento para tu sistema de diseño."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasa de Adopción de Componentes</CardTitle>
            <CardDescription>
              Porcentaje de proyectos que usan componentes principales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdoptionChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Frecuencia de Uso de Tokens</CardTitle>
            <CardDescription>
              Uso de tokens de diseño en los últimos 6 meses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsageChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
