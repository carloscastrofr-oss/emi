
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, BarChart, Users, CheckCircle, Package, Search, TrendingUp, ShieldAlert } from 'lucide-react';
import { BrandBarChart } from './brand-bar-chart';
import { MetricCard } from './metric-card';
import type { Risk, RiskCategory, RiskStatus } from '@/types/risk';

// --- Mock Data ---
const mockBrands = [
  { id: 'ds-core', name: 'DS Core', color: 'hsl(var(--primary))' },
  { id: 'marca-a', name: 'Marca A', color: 'hsl(217, 89%, 61%)' },
  { id: 'marca-b', name: 'Marca B', color: 'hsl(262, 84%, 59%)' },
];

const mockMetrics = {
  'ds-core': { adoption: 82, tokenUsage: 95, a11yIssues: 12, roi: 120500, coverage: 65, contributors: 18, riskScore: 92 },
  'marca-a': { adoption: 75, tokenUsage: 88, a11yIssues: 25, roi: 95000, coverage: 50, contributors: 10, riskScore: 88 },
  'marca-b': { adoption: 91, tokenUsage: 98, a11yIssues: 5, roi: 150000, coverage: 80, contributors: 25, riskScore: 95 },
};

const mockChartData = {
    'ds-core': [
        { name: 'Ene', value: 2400 }, { name: 'Feb', value: 2800 }, { name: 'Mar', value: 3200 },
        { name: 'Abr', value: 3000 }, { name: 'May', value: 3500 }, { name: 'Jun', value: 3800 },
    ],
    'marca-a': [
        { name: 'Ene', value: 1800 }, { name: 'Feb', value: 2000 }, { name: 'Mar', value: 2200 },
        { name: 'Abr', value: 2100 }, { name: 'May', value: 2400 }, { name: 'Jun', value: 2600 },
    ],
    'marca-b': [
        { name: 'Ene', value: 3000 }, { name: 'Feb', value: 3200 }, { name: 'Mar', value: 3500 },
        { name: 'Abr', value: 3400 }, { name: 'May', value: 3800 }, { name: 'Jun', value: 4100 },
    ],
};

const kpiConfig = [
    { id: 'adoption', label: 'Adopción', icon: ArrowUpRight, format: (val: number) => `${val}%` },
    { id: 'tokenUsage', label: 'Uso de Tokens', icon: Package, format: (val: number) => `${val}%` },
    { id: 'a11yIssues', label: 'Incidencias A11y', icon: CheckCircle, format: (val: number) => val.toString() },
    { id: 'roi', label: 'ROI Estimado', icon: TrendingUp, format: (val: number) => `$${(val / 1000).toFixed(1)}k` },
    { id: 'riskScore', label: 'Puntuación Riesgo', icon: ShieldAlert, format: (val: number) => `${val}/100` },
    { id: 'contributors', label: 'Contribuidores', icon: Users, format: (val: number) => val.toString() },
];


// --- Main Page Component ---
export default function DashboardPage() {
    const [brands] = useState(mockBrands);
    const [activeBrand, setActiveBrand] = useState('ds-core');
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<any>(null);
    const [chartData, setChartData] = useState<any>(null);

    useEffect(() => {
        setLoading(true);
        // Simulate fetching data for the active brand
        const timer = setTimeout(() => {
            setMetrics((mockMetrics as any)[activeBrand]);
            setChartData((mockChartData as any)[activeBrand]);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [activeBrand]);

    const activeBrandData = brands.find(b => b.id === activeBrand) || brands[0];
    
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 },
    };

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.4
    };

    return (
        <div className="space-y-6 dashboard-header">
            <Tabs value={activeBrand} onValueChange={setActiveBrand}>
                <TabsList className="bg-transparent p-0 gap-4">
                    {brands.map(b => (
                        <motion.div
                            key={b.id}
                            whileHover={{ y: -2, boxShadow:'var(--tw-shadow-e8)' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        >
                            <TabsTrigger
                                value={b.id}
                                className="rounded-full px-4 py-2 text-sm font-medium shadow-e2
                                data-[state=active]:text-on-primary-container
                                data-[state=inactive]:bg-card data-[state=inactive]:text-card-foreground"
                                style={{
                                    backgroundColor: activeBrand === b.id ? b.color : undefined,
                                    color: activeBrand === b.id ? 'hsl(var(--on-primary))' : undefined,
                                }}
                            >
                                {b.name}
                            </TabsTrigger>
                        </motion.div>
                    ))}
                </TabsList>
            </Tabs>
            
            <AnimatePresence mode="wait">
                 <motion.div
                    key={activeBrand}
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                >
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[108px] w-full rounded-expressive" />)
                        ) : (
                            kpiConfig.map(kpi => (
                                <MetricCard key={kpi.id} label={kpi.label} value={metrics?.[kpi.id]} icon={kpi.icon} format={kpi.format} color={activeBrandData.color} />
                            ))
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 mt-4">
                        {loading ? (
                            <>
                                <Skeleton className="h-[350px] w-full rounded-expressive" />
                                <Skeleton className="h-[350px] w-full rounded-expressive" />
                            </>
                        ) : (
                            <>
                                <BrandBarChart data={chartData} barColor={activeBrandData.color} />
                                <motion.div whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)'}} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                                    <Card className="rounded-expressive shadow-e2 h-full">
                                        <CardHeader><CardTitle>Uso de Tokens</CardTitle></CardHeader>
                                        <CardContent className="flex items-center justify-center h-[250px]">
                                            <p className="text-muted-foreground">Gráfica de área próximamente</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </>
                        )}
                    </div>
                 </motion.div>
            </AnimatePresence>
        </div>
    );
}
