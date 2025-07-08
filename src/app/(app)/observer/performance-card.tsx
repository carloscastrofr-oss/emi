
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, Zap, Timer, BarChart, TrendingUp, Cpu, MemoryStick, View } from "lucide-react";
import { motion } from "framer-motion";
import { ObserverTrendChart } from "./observer-trend-chart";
import { Button } from "@/components/ui/button";

const performanceData = {
    button: {
        name: 'Componente: Botón Primario',
        lcp: 'N/A',
        cls: '0.01',
        loadTime: '55ms',
        bundleSize: '2.1 kB',
        memoryUsage: '0.5 MB',
        interactionCount: '1.2M'
    },
    checkout: {
        name: 'Plantilla: Checkout',
        lcp: '1.8s',
        cls: '0.15',
        loadTime: '950ms',
        bundleSize: '158 kB',
        memoryUsage: '12.3 MB',
        interactionCount: '350k'
    }
}

interface PerformanceCardProps {
    item: string;
}

export function PerformanceCard({ item }: PerformanceCardProps) {
    const data = item === 'button' ? performanceData.button : performanceData.checkout;

    const kpis = [
        { title: 'Largest Contentful Paint (LCP)', value: data.lcp, icon: Timer },
        { title: 'Cumulative Layout Shift (CLS)', value: data.cls, icon: BarChart },
        { title: 'Tiempo de Carga', value: data.loadTime, icon: Zap },
        { title: 'Tamaño del Paquete (Bundle)', value: data.bundleSize, icon: Cpu },
        { title: 'Uso de Memoria', value: data.memoryUsage, icon: MemoryStick },
        { title: 'Interacciones Totales', value: data.interactionCount, icon: TrendingUp },
    ];
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <Card className="rounded-expressive shadow-e2">
                 <CardHeader className="flex flex-row items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Gauge className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>{data.name}</CardTitle>
                        <CardDescription>Análisis detallado de las métricas de rendimiento web.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                         {kpis.map((kpi) => (
                            <motion.div
                                key={kpi.title}
                                className="h-full"
                                whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)' }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <Card className="rounded-expressive shadow-e2 h-full bg-card">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                                        <kpi.icon className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{kpi.value}</div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <motion.div
                className="h-full"
                whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)'}}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
                <Card className="rounded-expressive shadow-e2">
                    <CardHeader className="flex flex-row items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <View className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Vista Previa</CardTitle>
                            <CardDescription>Representación visual del {item === 'button' ? 'componente' : 'plantilla'} bajo análisis.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="flex min-h-[250px] items-center justify-center p-6 bg-muted/50 rounded-b-expressive">
                        {item === 'button' && (
                            <Button size="lg">Botón Primario</Button>
                        )}
                        {item === 'checkout' && (
                            <div className="w-full max-w-sm h-[300px] bg-card border rounded-lg p-4 font-sans text-sm shadow-lg flex flex-col">
                                <h3 className="text-base font-bold mb-2 text-card-foreground">Tu Carrito</h3>
                                <div className="flex items-center gap-2 py-2 border-b">
                                    <div className="w-10 h-10 bg-muted rounded-md shrink-0"></div>
                                    <div className="flex-grow space-y-2">
                                        <div className="h-4 bg-muted rounded w-3/4"></div>
                                        <div className="h-3 bg-muted rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 py-2 border-b">
                                    <div className="w-10 h-10 bg-muted rounded-md shrink-0"></div>
                                    <div className="flex-grow space-y-2">
                                        <div className="h-4 bg-muted rounded w-3/4"></div>
                                        <div className="h-3 bg-muted rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="mt-auto space-y-2">
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-muted rounded w-1/4"></div>
                                        <div className="h-4 bg-muted rounded w-1/4"></div>
                                    </div>
                                    <Button className="w-full" disabled>Proceder al Pago</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                className="h-full"
                whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)'}}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
                <Card className="rounded-expressive shadow-e2 h-full">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Tendencia de Tiempo de Carga (últimos 6 meses)</CardTitle>
                            <CardDescription>Monitorización contínua del rendimiento a lo largo del tiempo.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ObserverTrendChart />
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
