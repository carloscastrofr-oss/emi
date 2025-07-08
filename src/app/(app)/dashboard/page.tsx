
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigValid } from '@/lib/firebase';
import type { Brand } from '@/types/brand';
import { PageHeader } from "@/components/page-header";
import { BrandMetricsDashboard } from './brand-metrics-dashboard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data based on the seed from the prompt
const mockBrands: Brand[] = [
    { id: 'core', name: 'OmniFlow Core', primary: '#2DB660', primaryContainer: '#B7F2CB', onPrimary: '#FFFFFF', metrics: { adoption: 82, tokenUsage: 95, coverage: 65, teamContrib: 18, a11yIssues: 12, roi: 120500, adoptionTrend: [98, 92, 78, 65, 55, 88], tokenFreqTrend: [186, 305, 237, 273, 209, 214] }, updatedAt: null as any },
    { id: 'bank', name: 'OmniBank', primary: '#0047AB', primaryContainer: '#B1D0FF', onPrimary: '#FFFFFF', metrics: { adoption: 71, tokenUsage: 88, coverage: 50, teamContrib: 12, a11yIssues: 25, roi: 95000, adoptionTrend: [80, 85, 70, 60, 50, 75], tokenFreqTrend: [150, 250, 200, 240, 190, 200] }, updatedAt: null as any },
    { id: 'aero', name: 'AeroJet', primary: '#8A2BE2', primaryContainer: '#E0C8FF', onPrimary: '#FFFFFF', metrics: { adoption: 65, tokenUsage: 75, coverage: 40, teamContrib: 8, a11yIssues: 30, roi: 72000, adoptionTrend: [70, 65, 50, 45, 40, 60], tokenFreqTrend: [120, 180, 150, 190, 140, 160] }, updatedAt: null as any }
];

export default function DashboardPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
    const [isLoadingBrands, setIsLoadingBrands] = useState(true);

    useEffect(() => {
        if (!isFirebaseConfigValid) {
            setBrands(mockBrands);
            if (mockBrands.length > 0) {
                setActiveBrandId(mockBrands[0].id);
            }
            setIsLoadingBrands(false);
            return;
        }

        const q = collection(db, "brands");
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const brandsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand));
            setBrands(brandsData);
            if (brandsData.length > 0 && !activeBrandId) {
                setActiveBrandId(brandsData[0].id);
            }
            setIsLoadingBrands(false);
        }, (error) => {
            console.error("Error fetching brands: ", error);
            setIsLoadingBrands(false);
        });

        return () => unsubscribe();
    }, []);

    if (isLoadingBrands) {
        return (
            <div>
                <PageHeader
                    title="Métricas"
                    description="Indicadores clave de rendimiento para tu sistema de diseño."
                />
                <div className="flex gap-4 mb-6">
                    <Skeleton className="h-10 w-32 rounded-expressive" />
                    <Skeleton className="h-10 w-32 rounded-expressive" />
                </div>
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }
    
    return (
        <div>
            <PageHeader
                title="Métricas"
                description="Indicadores clave de rendimiento para tu sistema de diseño."
                className="dashboard-header"
            />
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                {brands.map((b) => (
                    <Button
                        key={b.id}
                        onClick={() => setActiveBrandId(b.id)}
                        className={`px-4 py-2 rounded-expressive shadow-e2 whitespace-nowrap transition-all duration-300 ${activeBrandId === b.id ? '' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                        style={activeBrandId === b.id ? { 
                            backgroundColor: b.primaryContainer,
                            color: b.primary.startsWith('#F') ? '#000000' : '#000000', // simple logic for text color on light containers
                            borderColor: b.primary
                         } : {}}
                    >
                        {b.name}
                    </Button>
                ))}
            </div>
            
            {activeBrandId ? (
                <BrandMetricsDashboard brandId={activeBrandId} />
            ) : (
                 <Card>
                    <CardContent className="pt-6">
                        <p>No hay datos de marca disponibles. Para empezar, añade documentos a la colección 'brands' en Firestore.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
