
'use client';
import { BarChart, Bar, XAxis, Tooltip, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface RiskCategoryBarsProps {
    data: { name: string, score: number }[];
    isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-card p-2 shadow-e8 border text-sm">
        <p className="font-bold">{label}</p>
        <p className="text-primary">{`Puntuación: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export function RiskCategoryBars({ data, isLoading }: RiskCategoryBarsProps) {
    if (isLoading) {
        return <Skeleton className="h-64 w-full rounded-expressive" />;
    }
  
    return (
        <Card className="rounded-expressive">
            <CardHeader>
                <CardTitle>Puntuación por Categoría</CardTitle>
                <CardDescription>Desglose de la puntuación de riesgo en cada área.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-45} textAnchor="end" dy={10} />
                        <YAxis domain={[0, 110]} hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))', radius: 12 }} />
                        <defs>
                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary-container))" />
                                <stop offset="100%" stopColor="hsl(var(--primary))" />
                            </linearGradient>
                        </defs>
                        <Bar dataKey="score" radius={[12, 12, 0, 0]} fill="url(#barGrad)">
                             <LabelList dataKey="score" position="top" className="fill-foreground" fontSize={12} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
  );
}
