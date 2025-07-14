
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { riskCategories, type Risk, type RiskCategory } from '@/types/risk';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RiskCardProps {
    category: RiskCategory;
    risks: Risk[];
}

export function RiskCard({ category, risks }: RiskCardProps) {
    const categoryInfo = riskCategories[category];

    const getSeverityColor = (severity: number) => {
        if (severity <= 25) return 'bg-destructive/80';
        if (severity <= 50) return 'bg-orange-500';
        if (severity <= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };
    
    const hasCriticalRisk = risks.some(r => r.severity <= 25);

    return (
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
                                {risks.length} riesgo{risks.length !== 1 ? 's' : ''} abierto{risks.length !== 1 ? 's' : ''}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {risks.map(risk => (
                         <div key={risk.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-background/50">
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
                                    <Button size="sm" variant="outline">Asignar</Button>
                                    <Button size="sm" variant="ghost">Resolver</Button>
                                </div>
                            </div>
                         </div>
                    ))}
                </CardContent>
            </Card>
        </motion.div>
    );
}
