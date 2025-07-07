
'use client';

import Link from "next/link";
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { DollarSign, Package, AlertTriangle, TrendingUp, LucideIcon, LayoutGrid, Users, BookUser } from "lucide-react";
import { AdoptionChart } from "./adoption-chart";
import { UsageChart } from "./usage-chart";
import { RequireRole } from "@/components/auth/require-role";
import { UserRole, useAuth } from "@/hooks/use-auth";
import { ONBOARDING_STEPS } from "@/lib/onboarding-data";
import { useMemo } from "react";

interface Kpi {
    title: string;
    value: string;
    change: string;
    icon: LucideIcon;
    roles: UserRole[];
}

const kpis: Kpi[] = [
  {
    title: "Adopción de Componentes",
    value: "82%",
    change: "+5.2% desde el mes pasado",
    icon: Package,
    roles: ["viewer", "producer", "core", "admin"],
  },
  {
    title: "Uso de Tokens",
    value: "95%",
    change: "+1.0% desde el mes pasado",
    icon: TrendingUp,
    roles: ["viewer", "producer", "core", "admin"],
  },
   {
    title: "Cobertura de Componentes",
    value: "65%",
    change: "+10 componentes esta semana",
    icon: LayoutGrid,
    roles: ["producer", "core", "admin"],
  },
  {
    title: "Contribuciones del Equipo",
    value: "18",
    change: "4 nuevos contribuidores",
    icon: Users,
    roles: ["core", "admin"],
  },
  {
    title: "Problemas de Accesibilidad",
    value: "12",
    change: "-3 desde la semana pasada",
    icon: AlertTriangle,
    roles: ["producer", "core", "admin"],
  },
  {
    title: "ROI Estimado",
    value: "$120,500",
    change: "+$15k este trimestre",
    icon: DollarSign,
    roles: ["core", "admin"],
  },
];

const OnboardingTeaser = () => {
    const { userProfile } = useAuth();

    const relevantSteps = useMemo(() => {
        return ONBOARDING_STEPS.filter(step => step.roles.includes(userProfile?.role || 'viewer'));
    }, [userProfile?.role]);

    const completedCount = useMemo(() => {
        return userProfile?.onboarding?.completed?.length || 0;
    }, [userProfile?.onboarding]);
    
    if (completedCount >= relevantSteps.length) {
        return null; // All steps completed
    }

    const progress = `${completedCount} / ${relevantSteps.length} Pasos Completados`;

    return (
        <Link href="/onboarding" className="block h-full">
            <motion.div
                className="h-full"
                whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)'}}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
                <Card className="rounded-expressive shadow-e2 bg-primary-container text-on-primary-container h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Comienza tu Inducción</CardTitle>
                    <BookUser className="h-4 w-4 text-on-primary-container/80" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">Continúa aprendiendo</div>
                    <p className="text-xs text-on-primary-container/80">{progress}</p>
                    </CardContent>
                </Card>
            </motion.div>
        </Link>
    )
}

export default function DashboardPage({
  params,
  searchParams,
}: {
  params: {};
  searchParams: {};
}) {
  return (
    <div>
      <PageHeader
        title="Métricas"
        description="Indicadores clave de rendimiento para tu sistema de diseño."
        className="dashboard-header"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <OnboardingTeaser/>
        {kpis.map((kpi) => (
            <RequireRole key={kpi.title} roles={kpi.roles} showIsBlocked>
                <motion.div
                    className="h-full"
                    whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)'}}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <Card className="rounded-expressive shadow-e2 h-full bg-primary-container text-on-primary-container">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        <kpi.icon className="h-4 w-4 text-on-primary-container/80" />
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <p className="text-xs text-on-primary-container/80">{kpi.change}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </RequireRole>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="rounded-expressive">
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
        <Card className="rounded-expressive">
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
