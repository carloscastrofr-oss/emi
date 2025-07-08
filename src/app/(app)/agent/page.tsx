
'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigValid } from '@/lib/firebase';
import { PageHeader } from "@/components/page-header";
import { AgentCard } from "./agent-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX, Accessibility } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { agentDesignDebt } from "@/ai/flows/agent-design-debt";
import { agentAccessibility } from "@/ai/flows/agent-accessibility";

const agents = [
  {
    title: "Agente de Deuda de Diseño y Gobernanza",
    description: "Calcula el índice de deuda de diseño y el coste de ROI perdido.",
    icon: ShieldX,
    flow: agentDesignDebt,
    formFields: [{ name: "designDebtInput", label: "Datos de Deuda de Diseño (JSON)" }],
    placeholder: JSON.stringify({
      componentInventory: ["button-primary-clone", "card-custom-v2"],
      taggedIssues: 3,
      codeRefs: ["/src/components/custom/button.tsx"]
    }, null, 2),
  },
  {
    title: "Agente de Accesibilidad e Inclusión",
    description: "Ejecuta una auditoría de accesibilidad en una URL para identificar problemas de WCAG.",
    icon: Accessibility,
    flow: agentAccessibility,
    formFields: [{ name: "url", label: "URL de la página a auditar" }],
    placeholder: "https://example.com/checkout",
  },
];

interface Recommendation {
    id: string;
    agent: "Design Debt" | "Accessibility";
    component: string;
    recommendation: string;
    figmaPrompt?: string;
    timestamp: Timestamp;
}

const agentNameTranslations: Record<Recommendation['agent'], string> = {
  "Design Debt": "Deuda de Diseño",
  "Accessibility": "Accesibilidad",
};


export default function AgentPage({
  params,
  searchParams,
}: {
  params: {};
  searchParams: {};
}) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isFirebaseConfigValid) {
            setIsLoading(false);
            return;
        }

        const q = query(collection(db, "recommendations"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const newRecommendations: Recommendation[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.agent === 'Design Debt' || data.agent === 'Accessibility') {
                    newRecommendations.push({ id: doc.id, ...data } as Recommendation);
                }
            });
            setRecommendations(newRecommendations);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching recommendations: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getBadgeVariant = (agent: Recommendation['agent']) => {
        switch (agent) {
            case 'Design Debt': return 'destructive';
            case 'Accessibility': return 'default';
            default: return 'secondary';
        }
    };

    return (
        <div>
            <PageHeader
                title="Suite de Agentes"
                description="Activa agentes de IA y ve sus recomendaciones en tiempo real."
            />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {agents.map((agent) => (
                    <AgentCard
                        key={agent.title}
                        title={agent.title}
                        description={agent.description}
                        icon={agent.icon}
                        flow={agent.flow}
                        formFields={agent.formFields}
                        placeholder={agent.placeholder}
                    />
                ))}
            </div>

            <Card className="rounded-expressive">
                <CardHeader>
                    <CardTitle>Registro de Recomendaciones de Agentes</CardTitle>
                    <CardDescription>
                        Registro en tiempo real de ideas generadas por la Suite de Agentes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Agente</TableHead>
                                <TableHead className="w-[180px]">Componente/URL</TableHead>
                                <TableHead>Recomendación</TableHead>
                                <TableHead className="w-[180px]">Fecha y Hora</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-6 w-[130px]" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                                    </TableRow>
                                ))
                            ) : recommendations.length > 0 ? (
                                recommendations.map((rec) => (
                                    <TableRow key={rec.id}>
                                        <TableCell><Badge variant={getBadgeVariant(rec.agent)}>{agentNameTranslations[rec.agent]}</Badge></TableCell>
                                        <TableCell className="font-medium">{rec.component}</TableCell>
                                        <TableCell className="text-muted-foreground whitespace-pre-wrap">{rec.recommendation}</TableCell>
                                        <TableCell>{rec.timestamp?.toDate().toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Aún no hay recomendaciones. Ejecuta un agente para comenzar.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
