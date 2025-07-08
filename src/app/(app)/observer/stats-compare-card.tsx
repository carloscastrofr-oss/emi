"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, BarChart, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const stats = {
  kpi: "Click-Through Rate",
  pValue: 0.04,
  significant: true,
  winner: "B",
  a: { value: "5.2%", raw: 5.2 },
  b: { value: "7.8%", raw: 7.8 },
  diff: "+50%",
};

const otherMetrics = [
    { name: 'Time on Task', a: '45s', b: '32s', diff: '-28.9%', winner: 'B', icon: Clock },
    { name: 'Task Success', a: '85%', b: '92%', diff: '+8.2%', winner: 'B', icon: CheckCircle },
]

export function StatsCompareCard() {
  return (
    <motion.div
        whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)'}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
        <Card className="rounded-expressive shadow-e2">
        <CardHeader>
            <div className="flex flex-row items-start gap-4">
                 <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <BarChart className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>Resultados del Experimento</CardTitle>
                    <CardDescription>Comparativa de KPIs entre la variante A y B.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-semibold">{stats.kpi}</h3>
                    {stats.significant && <Badge className="bg-green-600">Estadísticamente Significativo</Badge>}
                </div>
                <div className="grid grid-cols-[auto,1fr,auto] items-center gap-x-4 gap-y-2">
                    {/* Variant A */}
                    <div className="font-medium">A</div>
                    <Progress value={stats.a.raw * 10} className="h-3" />
                    <div className="font-mono text-right w-[60px]">{stats.a.value}</div>
                    {/* Variant B */}
                    <div className="font-medium">B</div>
                    <Progress value={stats.b.raw * 10} className="h-3" />
                    <div className="font-mono text-right w-[60px]">{stats.b.value}</div>
                </div>
                <div className="flex items-center justify-center mt-3 text-lg text-green-600 font-bold">
                    <ArrowUp className="h-5 w-5 mr-1"/>
                    <span>{stats.diff}</span>
                </div>
            </div>
            
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Métrica Secundaria</TableHead>
                        <TableHead className="text-center">Variante A</TableHead>
                        <TableHead className="text-center">Variante B</TableHead>
                        <TableHead className="text-center">Diferencia</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {otherMetrics.map(metric => (
                        <TableRow key={metric.name}>
                            <TableCell className="font-medium flex items-center gap-2"><metric.icon className="h-4 w-4 text-muted-foreground"/>{metric.name}</TableCell>
                            <TableCell className="text-center font-mono">{metric.a}</TableCell>
                            <TableCell className="text-center font-mono font-bold">{metric.b}</TableCell>
                            <TableCell className={`text-center font-mono font-bold ${metric.diff.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.diff}
                            </Tabel-cell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
        </Card>
    </motion.div>
  );
}
