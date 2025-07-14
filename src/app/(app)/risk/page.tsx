
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigValid } from '@/lib/firebase';
import type { Risk, RiskCategory, RiskStatus } from '@/types/risk';
import { RiskScore } from './risk-score';
import { RiskFilters } from './risk-filters';
import { RiskCard } from './risk-card';
import { Skeleton } from '@/components/ui/skeleton';

const mockRisks: Risk[] = [
    { id: 'risk1', category: 'accessibility', title: 'Contraste insuficiente en btn-pay', componentId: 'button-primary', pageUrl: '/checkout', severity: 10, source: 'agent-a11y', detectedAt: Timestamp.now(), status: 'open', ownerUid: null, notes: '' },
    { id: 'risk2', category: 'accessibility', title: 'Falta de rol ARIA en modal', componentId: 'modal-dialog', pageUrl: '/subscribe', severity: 40, source: 'agent-a11y', detectedAt: Timestamp.now(), status: 'open', ownerUid: null, notes: '' },
    { id: 'risk3', category: 'performance', title: 'LCP > 2.5s en página de inicio', pageUrl: '/', severity: 25, source: 'agent-perf', detectedAt: Timestamp.now(), status: 'in-progress', ownerUid: 'core456', notes: 'Investigando optimización de imágenes.' },
    { id: 'risk4', category: 'design-debt', title: 'Componente Card clonado 5 veces', componentId: 'card-clone', pageUrl: '/products', severity: 60, source: 'agent-debt', detectedAt: Timestamp.now(), status: 'open', ownerUid: null, notes: '' },
];


const mockRiskStats = {
    score: 78,
    byCategory: {
        accessibility: 65,
        performance: 82,
        'design-debt': 75,
        governance: 90,
        brand: 95
    }
};

export default function RiskPage() {
    const [risks, setRisks] = useState<Risk[]>([]);
    const [riskStats, setRiskStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<{ category: RiskCategory | 'all', status: RiskStatus | 'all' }>({
        category: 'all',
        status: 'all',
    });

    useEffect(() => {
        if (!isFirebaseConfigValid) {
            setRisks(mockRisks);
            setRiskStats(mockRiskStats);
            setIsLoading(false);
            return;
        }

        const q = query(collection(db, "risks"));
        const unsubscribeRisks = onSnapshot(q, (snapshot) => {
            const fetchedRisks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Risk));
            setRisks(fetchedRisks);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching risks:", error);
            setIsLoading(false);
        });

        const statsRef = collection(db, "riskStats");
        const unsubscribeStats = onSnapshot(statsRef, (snapshot) => {
            if (!snapshot.empty) {
                const globalStats = snapshot.docs.find(doc => doc.id === 'global');
                if (globalStats) {
                    setRiskStats(globalStats.data());
                }
            }
        });
        
        return () => {
            unsubscribeRisks();
            unsubscribeStats();
        };
    }, []);

    const filteredRisks = risks.filter(risk => {
        const categoryMatch = filters.category === 'all' || risk.category === filters.category;
        const statusMatch = filters.status === 'all' || risk.status === filters.status;
        return categoryMatch && statusMatch;
    });
    
    const groupedRisks = filteredRisks.reduce((acc, risk) => {
        (acc[risk.category] = acc[risk.category] || []).push(risk);
        return acc;
    }, {} as Record<RiskCategory, Risk[]>);


    return (
        <div className="space-y-8">
            <PageHeader
                title="Risk Dashboard"
                description="Monitoriza y prioriza los riesgos que afectan tu sistema de diseño."
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-8">
                    <RiskScore score={riskStats?.score} isLoading={isLoading} />
                    <RiskFilters filters={filters} onFilterChange={setFilters} />
                </div>
                
                <div className="lg:col-span-2 space-y-8">
                    {isLoading ? (
                        Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-expressive" />)
                    ) : Object.keys(groupedRisks).length > 0 ? (
                        (Object.keys(groupedRisks) as RiskCategory[]).map(category => (
                            <RiskCard
                                key={category}
                                category={category}
                                risks={groupedRisks[category]}
                            />
                        ))
                    ) : (
                         <div className="text-center text-muted-foreground py-16">
                            <p>No se encontraron riesgos que coincidan con los filtros.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
