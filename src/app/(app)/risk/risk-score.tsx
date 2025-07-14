
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { PolarGrid, RadialBar, RadialBarChart } from 'recharts';

interface RiskScoreProps {
    score: number;
    isLoading: boolean;
}

export function RiskScore({ score, isLoading }: RiskScoreProps) {
    
    const getScoreColor = () => {
        if (score <= 50) return 'hsl(var(--destructive))';
        if (score <= 75) return 'hsl(var(--primary))'; // Assuming primary can be orange/yellow
        return 'hsl(var(--chart-1))'; // Green
    };

    const getScoreLabel = () => {
        if (score <= 50) return 'Crítico';
        if (score <= 75) return 'Precaución';
        return 'Aceptable';
    }
    
    const chartData = [{ name: 'score', value: score, fill: getScoreColor() }];
    
    if (isLoading) {
        return <Skeleton className="h-64 w-full rounded-expressive" />
    }

    return (
        <Card className="rounded-expressive text-center">
            <CardHeader>
                <CardTitle>Puntuación de Riesgo Global</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mx-auto h-[150px] w-[150px]">
                    <ChartContainer config={{}} className="w-full h-full">
                        <RadialBarChart
                            data={chartData}
                            startAngle={-270}
                            endAngle={90}
                            innerRadius="75%"
                            outerRadius="100%"
                            barSize={20}
                        >
                           <PolarGrid gridType="circle" />
                           <RadialBar dataKey="value" background cornerRadius={10} />
                        </RadialBarChart>
                    </ChartContainer>
                </div>
                 <div className="relative -top-24 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold">{score}</span>
                    <span className="text-muted-foreground text-sm">/ 100</span>
                </div>
                 <Badge 
                    style={{ backgroundColor: getScoreColor() }} 
                    className="text-white relative -top-16"
                >
                    {getScoreLabel()}
                </Badge>
            </CardContent>
        </Card>
    );
}
