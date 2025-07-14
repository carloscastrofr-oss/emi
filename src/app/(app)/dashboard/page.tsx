
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FigmaIcon } from "./figma-icon";
import { SketchIcon } from "./sketch-icon";

const chartData = [
  { name: 'Sat', value: 2400, color: 'blue' },
  { name: 'Sun', value: 1398, color: 'pink' },
  { name: 'Mon', value: 3800, color: 'blue' },
  { name: 'Tue', value: 3080, color: 'pink' },
  { name: 'Wed', value: 900, color: 'blue' },
  { name: 'Thu', value: 2100, color: 'pink' },
  { name: 'Fri', value: 3200, color: 'blue' },
];

const transactions = [
    { name: 'Figma', date: '15 June, 2024', amount: '- $144', paymentMethod: 'Visa Card', icon: FigmaIcon },
    { name: 'Sketch', date: '13 June, 2024', amount: '- $138', paymentMethod: 'Paypal', icon: SketchIcon },
];


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground shadow-lg">
        <p>{`$${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="outline">Expenses</Button>
                <div className="flex items-center gap-1 rounded-full bg-muted p-1">
                    <Button variant="ghost" size="sm" className="rounded-full px-3 py-1 text-muted-foreground">Day</Button>
                    <Button variant="secondary" size="sm" className="rounded-full bg-white px-3 py-1 shadow-sm">Week</Button>
                    <Button variant="ghost" size="sm" className="rounded-full px-3 py-1 text-muted-foreground">Month</Button>
                </div>
            </div>

            <Card className="rounded-2xl">
                <CardContent className="p-4">
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 30, right: 10, left: 10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.5}/>
                                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorPink" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                                    {
                                        chartData.map((entry, index) => (
                                            <rect key={`bar-${index}`} {...entry} fill={entry.color === 'blue' ? 'url(#colorBlue)' : 'url(#colorPink)'} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">June</h2>
                <div className="space-y-3">
                    {transactions.map((transaction, index) => (
                        <Card key={index} className="rounded-2xl bg-muted/50 shadow-none">
                            <CardContent className="flex items-center p-4">
                                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-background">
                                    <transaction.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{transaction.name}</p>
                                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">{transaction.amount}</p>
                                    <p className="text-sm text-muted-foreground">{transaction.paymentMethod}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
