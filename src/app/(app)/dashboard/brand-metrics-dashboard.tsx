
'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigValid } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { DollarSign, Package, AlertTriangle, TrendingUp, LucideIcon, LayoutGrid, Users } from "lucide-react";
import type { Brand } from '@/types/brand';
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
import type { UserRole } from "@/hooks/use-auth";
import { Skeleton } from '@/components/ui/skeleton';

const mockBrands: Brand[] = [
    { id: 'core', name: 'Design System Core', primary: '#2DB660', primaryContainer: '#B7F2CB', onPrimary: '#FFFFFF', metrics: { adoption: 82, tokenUsage: 95, coverage: 65, teamContrib: 18, a11yIssues: 12, roi: 120500, adoptionTrend: [98, 92, 78, 65, 55, 88], tokenFreqTrend: [186, 305, 237, 273, 209, 214] }, updatedAt: null as any },
    { id: 'bank', name: 'Sub-producto A', primary: '#0047AB', primaryContainer: '#B1D0FF', onPrimary: '#FFFFFF', metrics: { adoption: 71, tokenUsage: 88, coverage: 50, teamContrib: 12, a11yIssues: 25, roi: 95000, adoptionTrend: [80, 85, 70, 60, 50, 75], tokenFreqTrend: [150, 250, 200, 240, 190, 200] }, updatedAt: null as any },
    { id: 'aero', name: 'Sub-producto B', primary: '#8A2BE2', primaryContainer: '#E0C8FF', onPrimary: '#FFFFFF', metrics: { adoption: 65, tokenUsage: 75, coverage: 40, teamContrib: 8, a11yIssues: 30, roi: 72000, adoptionTrend: [70, 65, 50, 45, 40, 60], tokenFreqTrend: [120, 180, 150, 190, 140, 160] }, updatedAt: null as any }
];

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

export function BrandMetricsDashboard({ brandId }: BrandMetricsDashboardProps) {
    const [brand, setBrand] = useState<Brand | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!brandId) return;
        if (!isFirebaseConfigValid) {
            const mockBrand = mockBrands.find(b => b.id === brandId);
            if (mockBrand) {
                setBrand(mockBrand);
                injectBrandStyles(mockBrand);
            } else {
                setBrand(null);
            }
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
