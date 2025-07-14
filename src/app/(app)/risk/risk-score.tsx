
'use client';

import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RiskScoreProps {
    score: number;
    isLoading: boolean;
}

export function RiskScore({ score, isLoading }: RiskScoreProps) {
    if (isLoading) {
        return <Skeleton className="h-64 w-full rounded-expressive" />;
    }

    return (
        <Card className="rounded-expressive text-center">
             <CardHeader>
                <CardTitle>Puntuación de Riesgo Global</CardTitle>
            </CardHeader>
             <CardContent className="flex justify-center p-6">
                <div className="h-48 w-48">
                    <svg width="0" height="0">
                        <defs>
                        <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-primary)" />
                            <stop offset="100%" stopColor="var(--color-primary-container)" />
                        </linearGradient>
                        </defs>
                    </svg>
                    <CircularProgressbarWithChildren
                        value={score}
                        maxValue={100}
                        styles={buildStyles({
                            pathColor: "url(#riskGrad)",
                            trailColor:"rgba(0,0,0,.06)",
                            strokeLinecap: 'round',
                        })}
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-medium text-foreground">{score}</span>
                            <span className="text-sm text-muted-foreground">/ 100</span>
                        </div>
                    </CircularProgressbarWithChildren>
                </div>
            </CardContent>
        </Card>
    );
}
