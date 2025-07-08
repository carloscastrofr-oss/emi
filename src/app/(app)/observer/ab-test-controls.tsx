
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "./date-range-picker";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, PlusCircle, TestTube2, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { RequireRole } from '@/components/auth/require-role';
import { CreateABTestDialog } from './create-ab-test-dialog';

const mockTests = [
    { id: 'demoCheckout', name: 'Color del CTA en Checkout' },
    { id: 'onboardingModal', name: 'Modal de Onboarding v3' },
    { id: 'pricingPageLayout', name: 'Layout de Página de Precios' }
];


interface ABTestControlsProps {
    isABMode: boolean;
    onModeChange: (isAB: boolean) => void;
    selectedTest: string | null;
    onTestChange: (testId: string | null) => void;
    selectedPerformanceItem: string | null;
    onPerformanceItemChange: (itemId: string | null) => void;
}

export function ABTestControls({ 
    isABMode, 
    onModeChange, 
    selectedTest, 
    onTestChange,
    selectedPerformanceItem,
    onPerformanceItemChange,
 }: ABTestControlsProps) {
    const { toast } = useToast();
    const [isDialogOpen, setDialogOpen] = useState(false);

    const handleExport = () => {
        toast({
            title: "Función no disponible",
            description: "La exportación de datos estará disponible próximamente.",
        });
    };

    const handleSelectionChange = (value: string) => {
        if (!value) {
            onTestChange(null);
            onPerformanceItemChange(null);
            return;
        }

        if (value.startsWith('test-')) {
            onTestChange(value.replace('test-', ''));
        } else if (value.startsWith('perf-')) {
            onPerformanceItemChange(value.replace('perf-', ''));
        } else { // It's a page
            onTestChange(value);
        }
    }
    
    const handleModeChange = (checked: boolean) => {
        if (!selectedTest && checked) {
            toast({ title: "Selecciona un experimento", description: "Por favor, elige un experimento para activar el modo A/B."});
            return;
        }
        onModeChange(checked);
    }
    
    const selectedValue = selectedPerformanceItem 
        ? `perf-${selectedPerformanceItem}` 
        : (selectedTest ? (mockTests.some(t => t.id === selectedTest) ? `test-${selectedTest}` : selectedTest) : "");

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
                        <CardTitle>Filtros y Experimentos</CardTitle>
                        <CardDescription>Selecciona una página, rango de fechas, un experimento A/B o un análisis de rendimiento.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                         <RequireRole roles={['core', 'admin']}>
                            <Button onClick={() => setDialogOpen(true)} variant="outline">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Nuevo Experimento
                            </Button>
                        </RequireRole>
                        <Button onClick={handleExport} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Exportar
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4">
                <DateRangePicker />
                <Select onValueChange={handleSelectionChange} value={selectedValue}>
                <SelectTrigger className="w-full md:w-[280px]">
                    <SelectValue placeholder="Seleccionar vista" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Páginas</SelectLabel>
                        <SelectItem value="/checkout">Carrito de Compras (/checkout)</SelectItem>
                         {/* Other pages can be added here */}
                    </SelectGroup>
                    <SelectGroup>
                        <SelectLabel>Experimentos A/B</SelectLabel>
                        {mockTests.map(test => (
                            <SelectItem key={test.id} value={`test-${test.id}`}>
                                <div className="flex items-center gap-2">
                                    <TestTube2 className="h-4 w-4 text-primary"/>
                                    {test.name}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectGroup>
                     <SelectGroup>
                        <SelectLabel>Rendimiento</SelectLabel>
                        <SelectItem value="perf-button">
                            <div className="flex items-center gap-2">
                                <Gauge className="h-4 w-4 text-primary" />
                                <span>Componente: Botón Primario</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="perf-checkout">
                            <div className="flex items-center gap-2">
                                <Gauge className="h-4 w-4 text-primary" />
                                <span>Plantilla: Checkout</span>
                            </div>
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                    <Switch id="ab-mode" checked={isABMode} onCheckedChange={handleModeChange} disabled={!selectedTest || !mockTests.some(t => t.id === selectedTest)} />
                    <Label htmlFor="ab-mode">Modo A/B</Label>
                </div>
            </CardContent>
            </Card>
        </motion.div>
        </>
    );
}
