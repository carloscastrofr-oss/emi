
'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigValid } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { DollarSign, Package, AlertTriangle, TrendingUp, LucideIcon, LayoutGrid, Users, BookUser } from "lucide-react";
import type { Brand } from '@/types/brand';
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdoptionChart } from "./adoption-chart";
import { UsageChart } from "./usage-chart";
import { RequireRole } from "@/components/auth/require-role";
import { UserRole, useAuth } from "@/hooks/use-auth";
import { ONBOARDING_STEPS } from "@/lib/onboarding-data";
import { Skeleton } from '@/components/ui/skeleton';

// Helper to inject CSS variables for the selected brand's theme
const injectBrandStyles = (brand: Brand) => {
    const styleId = 'dynamic-brand-styles';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
    }
    // A simple heuristic to determine text color on a light container background.
    const onContainerColor = brand.primary.startsWith('#F') ? '#000000' : '#000000';

    styleTag.innerHTML = `
      :root {
        --color-primary-dynamic: ${brand.primary};
        --color-primary-container-dynamic: ${brand.primaryContainer};
        --color-on-primary-dynamic: ${brand.onPrimary};
        --color-on-primary-container-dynamic: ${onContainerColor};
      }
    `;
};

interface BrandMetricsDashboardProps {
    brandId: string;
}

const OnboardingTeaser = () => {
    const { userProfile } = useAuth();

    const relevantSteps = useMemo(() => {
        return ONBOARDING_STEPS.filter(step => step.roles.includes(userProfile?.role || 'viewer'));
    }, [userProfile?.role]);

    const completedCount = useMemo(() => {
        return userProfile?.onboarding?.completed?.length || 0;
    }, [userProfile?.onboarding]);
    
    if (!userProfile || completedCount >= relevantSteps.length) {
        return null;
    }

    const progress = `${completedCount} / ${relevantSteps.length} Pasos Completados`;

    return (
        <Link href="/onboarding" className="block h-full">
            <motion.div
                className="h-full"
                whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)'}}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
                <Card className="rounded-expressive shadow-e2 bg-[var(--color-primary-container-dynamic)] text-[var(--color-on-primary-container-dynamic)] h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Comienza tu Inducción</CardTitle>
                    <BookUser className="h-4 w-4 text-[var(--color-on-primary-container-dynamic)]/80" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">Continúa aprendiendo</div>
                    <p className="text-xs text-[var(--color-on-primary-container-dynamic)]/80">{progress}</p>
                    </CardContent>
                </Card>
            </motion.div>
        </Link>
    )
}

export function BrandMetricsDashboard({ brandId }: BrandMetricsDashboardProps) {
    const [brand, setBrand] = useState<Brand | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!brandId) return;
        if (!isFirebaseConfigValid) {
            // This is a workaround for the demo environment without a real DB.
            const mockBrand = { id: 'core', name: 'OmniFlow Core', primary: '#2DB660', primaryContainer: '#B7F2CB', onPrimary: '#FFFFFF', metrics: { adoption: 82, tokenUsage: 95, coverage: 65, teamContrib: 18, a11yIssues: 12, roi: 120500, adoptionTrend: [98, 92, 78, 65, 55, 88], tokenFreqTrend: [186, 305, 237, 273, 209, 214] }, updatedAt: null as any };
            setBrand(mockBrand);
            injectBrandStyles(mockBrand);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const docRef = doc(db, 'brands', brandId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const brandData = { id: docSnap.id, ...docSnap.data() } as Brand;
                setBrand(brandData);
                injectBrandStyles(brandData);
            } else {
                console.error(`No brand found with id: ${brandId}`);
                setBrand(null);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching brand data:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [brandId]);
    
    if (isLoading) {
        return <Skeleton className="h-[600px] w-full" />;
    }

    if (!brand) {
        return <p>No se pudieron cargar las métricas para esta marca.</p>;
    }

    interface Kpi {
        title: string;
        value: string;
        icon: LucideIcon;
        roles: UserRole[];
    }

    const kpis: Kpi[] = [
      { title: "Adopción de Componentes", value: `${brand.metrics.adoption}%`, icon: Package, roles: ["viewer", "producer", "core", "admin"] },
      { title: "Uso de Tokens", value: `${brand.metrics.tokenUsage}%`, icon: TrendingUp, roles: ["viewer", "producer", "core", "admin"] },
      { title: "Cobertura de Componentes", value: `${brand.metrics.coverage}%`, icon: LayoutGrid, roles: ["producer", "core", "admin"] },
      { title: "Contribuciones del Equipo", value: `${brand.metrics.teamContrib}`, icon: Users, roles: ["core", "admin"] },
      { title: "Problemas de Accesibilidad", value: `${brand.metrics.a11yIssues}`, icon: AlertTriangle, roles: ["producer", "core", "admin"] },
      { title: "ROI Estimado", value: `$${brand.metrics.roi.toLocaleString()}`, icon: DollarSign, roles: ["core", "admin"] },
    ];
    
    const adoptionChartData = [
      { component: "Button", adoption: brand.metrics.adoptionTrend[0] || 0 },
      { component: "Input", adoption: brand.metrics.adoptionTrend[1] || 0 },
      { component: "Card", adoption: brand.metrics.adoptionTrend[2] || 0 },
      { component: "Modal", adoption: brand.metrics.adoptionTrend[3] || 0 },
      { component: "Table", adoption: brand.metrics.adoptionTrend[4] || 0 },
      { component: "Avatar", adoption: brand.metrics.adoptionTrend[5] || 0 },
    ];
    
    const usageChartData = [
      { month: "January", tokens: brand.metrics.tokenFreqTrend[0] || 0 },
      { month: "February", tokens: brand.metrics.tokenFreqTrend[1] || 0 },
      { month: "March", tokens: brand.metrics.tokenFreqTrend[2] || 0 },
      { month: "April", tokens: brand.metrics.tokenFreqTrend[3] || 0 },
      { month: "May", tokens: brand.metrics.tokenFreqTrend[4] || 0 },
      { month: "June", tokens: brand.metrics.tokenFreqTrend[5] || 0 },
    ];

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <OnboardingTeaser />
                {kpis.map((kpi) => (
                    <RequireRole key={kpi.title} roles={kpi.roles} showIsBlocked>
                        <motion.div
                            className="h-full"
                            whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)' }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <Card className="rounded-expressive shadow-e2 h-full bg-[var(--color-primary-container-dynamic)] text-[var(--color-on-primary-container-dynamic)]">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                                    <kpi.icon className="h-4 w-4 text-[var(--color-on-primary-container-dynamic)]/80" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{kpi.value}</div>
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
                        <AdoptionChart data={adoptionChartData} />
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
                        <UsageChart data={usageChartData} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
