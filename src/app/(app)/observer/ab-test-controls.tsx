
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "./date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Import, PlusCircle, TestTube2, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { RequireRole } from '@/components/auth/require-role';
import { CreateABTestDialog } from './create-ab-test-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';

const mockTests = [
    { id: 'demoCheckout', name: 'Color del CTA en Checkout' },
    { id: 'onboardingModal', name: 'Modal de Onboarding v3' },
    { id: 'pricingPageLayout', name: 'Layout de Página de Precios' }
];

type AnalysisType = 'page' | 'test' | 'performance';

export interface Analysis {
    type: AnalysisType | null;
    id: string | null;
}

interface ABTestControlsProps {
    analysis: Analysis;
    onAnalysisChange: (analysis: Analysis) => void;
}

export function ABTestControls({ analysis, onAnalysisChange }: ABTestControlsProps) {
    const { toast } = useToast();
    const [isDialogOpen, setDialogOpen] = useState(false);

    const handleImport = () => {
        toast({
            title: "Función no disponible",
            description: "La importación de datos estará disponible próximamente.",
        });
    };
    
    const handleTabChange = (type: string) => {
        let defaultId: string | null = null;
        const newType = type as AnalysisType;
        switch (newType) {
            case 'page':
                defaultId = '/checkout';
                break;
            case 'test':
                defaultId = mockTests[0]?.id || null;
                break;
            case 'performance':
                defaultId = 'button';
                break;
        }
        onAnalysisChange({ type: newType, id: defaultId });
    };

    const handleSelectionChange = (id: string) => {
        onAnalysisChange({ ...analysis, id: id || null });
    };

    return (
        <>
        <CreateABTestDialog open={isDialogOpen} onOpenChange={setDialogOpen} />
        <motion.div
            whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)'}}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <Card className="rounded-expressive shadow-e2">
            <CardHeader>
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <CardTitle>Menú</CardTitle>
                        <CardDescription>Selecciona una página, rango de fechas, un test A/B o un análisis de rendimiento.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                         <RequireRole roles={['core', 'admin']}>
                            <Button onClick={() => setDialogOpen(true)} variant="outline">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Nuevo A/B Test
                            </Button>
                        </RequireRole>
                        <Button onClick={handleImport} variant="outline">
                            <Import className="mr-2 h-4 w-4" />
                            Importar
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex flex-wrap items-start gap-4">
                     <DateRangePicker />
                </div>
                 <Tabs value={analysis.type ?? 'page'} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="page">Mapas de Calor</TabsTrigger>
                        <TabsTrigger value="test">Experimentos A/B</TabsTrigger>
                        <TabsTrigger value="performance">Rendimiento</TabsTrigger>
                    </TabsList>
                    <TabsContent value="page" className="pt-4">
                        <Label className="text-sm text-muted-foreground mb-2 block">Página</Label>
                        <Select onValueChange={handleSelectionChange} value={analysis.type === 'page' ? analysis.id ?? '' : ''}>
                            <SelectTrigger className="w-full md:w-[320px]"><SelectValue placeholder="Selecciona una página" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="/checkout">Carrito de Compras (/checkout)</SelectItem>
                                <SelectItem value="/homepage">Página de Inicio (/homepage)</SelectItem>
                            </SelectContent>
                        </Select>
                    </TabsContent>
                    <TabsContent value="test" className="pt-4">
                        <Label className="text-sm text-muted-foreground mb-2 block">Experimento</Label>
                        <Select onValueChange={handleSelectionChange} value={analysis.type === 'test' ? analysis.id ?? '' : ''}>
                            <SelectTrigger className="w-full md:w-[320px]"><SelectValue placeholder="Selecciona un experimento" /></SelectTrigger>
                            <SelectContent>
                                {mockTests.map(test => (
                                    <SelectItem key={test.id} value={test.id}>
                                        <div className="flex items-center gap-2">
                                            <TestTube2 className="h-4 w-4 text-primary"/>
                                            {test.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </TabsContent>
                    <TabsContent value="performance" className="pt-4">
                        <Label className="text-sm text-muted-foreground mb-2 block">Ítem de Rendimiento</Label>
                        <Select onValueChange={handleSelectionChange} value={analysis.type === 'performance' ? analysis.id ?? '' : ''}>
                            <SelectTrigger className="w-full md:w-[320px]"><SelectValue placeholder="Selecciona un ítem de rendimiento" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="button">
                                    <div className="flex items-center gap-2">
                                        <Gauge className="h-4 w-4 text-primary" />
                                        <span>Componente: Botón Primario</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="checkout">
                                    <div className="flex items-center gap-2">
                                        <Gauge className="h-4 w-4 text-primary" />
                                        <span>Plantilla: Checkout</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </TabsContent>
                </Tabs>
            </CardContent>
            </Card>
        </motion.div>
        </>
    );
}
