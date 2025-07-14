
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { riskCategories, type Risk, type RiskCategory, type RiskStatus } from '@/types/risk';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lightbulb } from 'lucide-react';
import { AssignRiskModal } from './assign-risk-modal';

interface RiskCardProps {
    category: RiskCategory;
    risks: Risk[];
    onUpdateRisk: (riskId: string, status: RiskStatus) => void;
    onAssignRisk: (riskId: string, ownerUid: string, ownerName: string) => void;
}

export function RiskCard({ category, risks, onUpdateRisk, onAssignRisk }: RiskCardProps) {
    const categoryInfo = riskCategories[category];
    const [modalRisk, setModalRisk] = useState<Risk | null>(null);

    const getSeverityColor = (severity: number) => {
        if (severity <= 25) return 'bg-destructive/80';
        if (severity <= 50) return 'bg-orange-500';
        if (severity <= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };
    
    const openRisks = risks.filter(r => r.status !== 'resolved');
    const hasCriticalRisk = openRisks.some(r => r.severity <= 25);

    if (openRisks.length === 0) {
        return null;
    }

    const handleAssign = (assignee: { uid: string, name: string }) => {
        if (modalRisk) {
            onAssignRisk(modalRisk.id, assignee.uid, assignee.name);
        }
        setModalRisk(null);
    }

    return (
        <>
        {modalRisk && (
            <AssignRiskModal
                risk={modalRisk}
                open={!!modalRisk}
                onClose={() => setModalRisk(null)}
                onAssign={handleAssign}
            />
        )}
        <motion.div
            className="h-full"
            whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            <Card className={cn(
                'rounded-expressive shadow-e2 transition-colors',
                hasCriticalRisk ? 'bg-[var(--error-container)] border-destructive/30' : ''
            )}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <categoryInfo.icon className="h-6 w-6 text-foreground" />
                        <div>
                            <CardTitle className="text-xl">{categoryInfo.label}</CardTitle>
                            <CardDescription className={cn(hasCriticalRisk ? 'text-destructive-foreground/80' : '')}>
                                {openRisks.length} riesgo{openRisks.length !== 1 ? 's' : ''} abierto{openRisks.length !== 1 ? 's' : ''}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {openRisks.map(risk => (
                         <motion.div 
                            key={risk.id} 
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                            className="flex flex-col gap-2 p-3 rounded-lg bg-background/50"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-medium text-sm">{risk.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {risk.componentId && <Badge variant="secondary">{risk.componentId}</Badge>}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <div className="flex items-center gap-2">
                                                <div className={cn("h-3 w-3 rounded-full", getSeverityColor(risk.severity))}></div>
                                                <span className="font-mono text-xs">{risk.severity}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Severidad: {risk.severity} (0-100, 0 es crítico)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => setModalRisk(risk)}>Asignar</Button>
                                    <Button size="sm" variant="ghost" onClick={() => onUpdateRisk(risk.id, 'resolved')}>Resolver</Button>
                                </div>
                                </div>
                            </div>
                            {risk.recommendation && (
                                <div className="flex items-start gap-2 p-3 rounded-md bg-accent/50 text-accent-foreground border border-primary/10">
                                    <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                                    <p className="text-xs">
                                        <span className="font-semibold mr-1">Recomendación:</span>
                                        {risk.recommendation}
                                    </p>
                                </div>
                            )}
                         </motion.div>
                    ))}
                </CardContent>
            </Card>
        </motion.div>
        </>
    );
}
