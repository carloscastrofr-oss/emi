
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, barColor }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg px-3 py-1.5 text-sm text-primary-foreground shadow-lg" style={{ backgroundColor: barColor }}>
        <p>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function BrandBarChart({ data, barColor }: { data: {name: string, value: number}[], barColor: string }) {
    return (
         <motion.div
            className="h-full"
            whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)' }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <Card className="rounded-expressive shadow-e2 h-full">
                <CardHeader>
                    <CardTitle>Tendencia de Adopción</CardTitle>
                </CardHeader>
                <CardContent>
                     <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={barColor} stopOpacity={0.6}/>
                                        <stop offset="95%" stopColor={barColor} stopOpacity={0.2}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                                <RechartsTooltip content={<CustomTooltip barColor={barColor} />} cursor={{ fill: 'hsl(var(--accent))', radius: 12 }} />
                                <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="url(#colorBar)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
