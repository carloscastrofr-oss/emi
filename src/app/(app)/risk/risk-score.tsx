
'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RiskScoreProps {
    score: number;
    isLoading: boolean;
}

const CircularProgress = ({ score }: { score: number }) => {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <svg
            className="w-full h-full"
            viewBox="0 0 120 120"
        >
            <circle
                className="progress-ring-circle-bg"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="60"
                cy="60"
            />
            <circle
                className="progress-ring-circle"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="60"
                cy="60"
                style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                    strokeLinecap: 'round',
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                }}
            />
             <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                className="text-4xl font-medium fill-foreground"
            >
                {score}
            </text>
            <text
                x="50%"
                y="50%"
                dy="1.2em"
                dominantBaseline="middle"
                textAnchor="middle"
                className="text-sm fill-muted-foreground"
            >
                / 100
            </text>
        </svg>
    );
};


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
                <div className="h-48 w-48 text-primary">
                    <CircularProgress score={score} />
                </div>
            </CardContent>
        </Card>
    );
}
