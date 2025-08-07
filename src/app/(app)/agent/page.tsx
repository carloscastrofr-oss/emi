
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
import { Accessibility, Palette, MessageSquare, TestTube, Briefcase, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const agents = [
  {
    name: "accessibility",
    title: "Agente de Accesibilidad e Inclusión",
    description: "Ejecuta una auditoría de accesibilidad en una URL para identificar problemas de WCAG.",
    icon: Accessibility,
    formFields: [{ name: "url", label: "URL de la página a auditar" }],
    placeholder: "https://example.com/checkout",
  },
  {
    name: "design",
    title: "Agente de Diseño",
    description: "Analiza el uso de un componente y sugiere mejoras de diseño y tokens.",
    icon: Palette,
    formFields: [{ name: "componentUsage", label: "Datos de Uso del Componente (JSON)" }],
    placeholder: '{"componentId":"button-primary","contrast_ratio":2.5,...}',
  },
  {
    name: "content",
    title: "Agente de Contenido",
    description: "Analiza el texto de la UI y los comentarios para proponer mejoras en el micro-copy.",
    icon: MessageSquare,
    formFields: [{ name: "uiText", label: "Texto de la UI" }, { name: "userFeedback", label: "Feedback del Usuario (Opcional)" }],
    placeholder: "Su pago fue rechazado.",
  },
  {
    name: "qa",
    title: "Agente de QA",
    description: "Identifica componentes con altas tasas de error y recomienda pruebas.",
    icon: TestTube,
    formFields: [{ name: "qaData", label: "Datos de QA (JSON)" }],
    placeholder: '{"component":"FormularioDePago","error_rate":0.35,...}',
  },
  {
    name: "business",
    title: "Agente de Negocio",
    description: "Analiza el impacto en KPIs de negocio y estima el ROI de los componentes.",
    icon: Briefcase,
    formFields: [{ name: "kpiData", label: "Datos de KPIs (JSON)" }],
    placeholder: '{"componentId":"HeroBanner","impact":-0.05,...}',
  },
  {
    name: "design-debt",
    title: "Agente de Deuda de Diseño",
    description: "Evalúa la deuda de diseño, identifica componentes divergentes y estima el ROI perdido.",
    icon: Trash2,
    formFields: [{ name: "designDebtInput", label: "Inventario de Deuda (JSON)" }],
    placeholder: '{"cloned_components":["card-v1","card-v2"],...}',
  },
];

interface Recommendation {
    id: string;
    agent: "Accessibility" | "Design" | "Content" | "QA" | "Business" | "Design Debt";
    component: string;
    recommendation: string;
    figmaPrompt?: string;
    timestamp: Timestamp;
}

const agentNameTranslations: Record<Recommendation['agent'], string> = {
  "Accessibility": "Accesibilidad",
  "Design": "Diseño",
  "Content": "Contenido",
  "QA": "QA",
  "Business": "Negocio",
  "Design Debt": "Deuda Diseño",
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
            case 'Accessibility': return 'destructive';
            case 'Design': return 'default';
            case 'Content': return 'secondary';
            case 'QA': return 'outline';
            case 'Business': return 'default';
            case 'Design Debt': return 'destructive';
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
                        agentName={agent.name}
                        title={agent.title}
                        description={agent.description}
                        icon={agent.icon}
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
