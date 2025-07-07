
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
import { Palette, MessageSquareText, ShieldAlert, Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { agentDesign } from "@/ai/flows/agent-design";
import { agentContent } from "@/ai/flows/agent-content";
import { agentQA } from "@/ai/flows/agent-qa";
import { agentBusiness } from "@/ai/flows/agent-business";

const agents = [
  {
    title: "Agente de Diseño",
    description: "Analiza el uso de componentes para contraste y accesibilidad.",
    icon: Palette,
    flow: agentDesign,
    formFields: [{ name: "componentUsage", label: "Datos de Uso de Componente (JSON)" }],
    placeholder: JSON.stringify({
      componentId: "button-primary",
      token_color: "#8B8B8B",
      contrast_ratio: 2.1,
    }, null, 2),
  },
  {
    title: "Agente de Contenido",
    description: "Analiza el feedback de usuarios en busca de microcopy poco claro.",
    icon: MessageSquareText,
    flow: agentContent,
    formFields: [
        { name: "uiText", label: "Texto de UI" },
        { name: "userFeedback", label: "Feedback de Usuario" }
    ],
    initialValues: {
      uiText: "Tu contraseña debe contener al menos 8 caracteres.",
      userFeedback: "Esta instrucción de contraseña es confusa, no entiendo qué se requiere.",
    }
  },
  {
    title: "Agente de QA",
    description: "Analiza las analíticas de UI en busca de altas tasas de error.",
    icon: ShieldAlert,
    flow: agentQA,
    formFields: [{ name: "qaData", label: "Datos de QA (JSON)" }],
    placeholder: JSON.stringify({
      component: "checkout-form",
      error_rate: 42,
      users_affected: 89
    }, null, 2),
  },
  {
    title: "Agente de Negocio",
    description: "Analiza datos de KPI para ver el impacto en el negocio.",
    icon: Briefcase,
    flow: agentBusiness,
    formFields: [{ name: "kpiData", label: "Datos de KPI (JSON)" }],
    placeholder: JSON.stringify({
      componentId: "add-to-cart-button",
      impact: "negative",
      relatedKpi: "sales-conversion"
    }, null, 2),
  },
];

interface Recommendation {
    id: string;
    agent: "Design" | "Content" | "QA" | "Business";
    component: string;
    recommendation: string;
    figmaPrompt?: string;
    timestamp: Timestamp;
}

const agentNameTranslations: Record<Recommendation['agent'], string> = {
  Design: "Diseño",
  Content: "Contenido",
  QA: "QA",
  Business: "Negocio",
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
                newRecommendations.push({ id: doc.id, ...doc.data() } as Recommendation);
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
            case 'Design': return 'default';
            case 'Content': return 'secondary';
            case 'QA': return 'destructive';
            case 'Business': return 'outline';
            default: return 'default';
        }
    };

    return (
        <div>
            <PageHeader
                title="Suite de Agentes"
                description="Activa agentes de IA y ve sus recomendaciones en tiempo real."
            />
            <div className="grid gap-6 md:grid-cols-2 mb-8">
                {agents.map((agent) => (
                    <AgentCard
                        key={agent.title}
                        title={agent.title}
                        description={agent.description}
                        icon={agent.icon}
                        flow={agent.flow}
                        formFields={agent.formFields}
                        placeholder={agent.placeholder}
                        initialValues={agent.initialValues}
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
                                <TableHead className="w-[120px]">Agente</TableHead>
                                <TableHead className="w-[180px]">Componente</TableHead>
                                <TableHead>Recomendación</TableHead>
                                <TableHead className="w-[180px]">Fecha y Hora</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
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
