
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Smile, Frown, Meh } from "lucide-react";

const mockInsights = [
    { sentiment: 'negative', topic: 'Claridad del Pago', quote: "No estoy seguro de qué pasará al hacer clic en 'Proceder al Pago'. ¿Me cobrarán inmediatamente?", persona: 'Ana' },
    { sentiment: 'positive', topic: 'Facilidad de Navegación', quote: "Usando mi lector de pantalla, pude navegar por los productos sin problemas. ¡Bien hecho!", persona: 'David' },
    { sentiment: 'neutral', topic: 'Información del Producto', quote: "La descripción del producto es adecuada, pero me gustaría ver más imágenes.", persona: 'Elena' },
    { sentiment: 'negative', topic: 'Confianza', quote: "El diseño se ve un poco simple, no estoy seguro si es seguro poner mi tarjeta de crédito aquí.", persona: 'Carlos' },
];

const sentimentConfig = {
    positive: { icon: Smile, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    negative: { icon: Frown, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    neutral: { icon: Meh, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
};

export function InsightsTab() {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Insights y Temas Clave</CardTitle>
                    <CardDescription>Verbatims generados por el panel sintético y agrupados por tema y sentimiento.</CardDescription>
                </CardHeader>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockInsights.map((insight, index) => {
                    const config = sentimentConfig[insight.sentiment as keyof typeof sentimentConfig];
                    const Icon = config.icon;
                    return (
                        <Card key={index} className="rounded-xl">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <Badge variant="secondary">{insight.topic}</Badge>
                                    <Badge className={config.color}>
                                        <Icon className="mr-1 h-4 w-4" />
                                        {insight.sentiment}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3 text-sm p-3 rounded-md bg-muted">
                                    <MessageSquare className="h-4 w-4 mt-1 flex-shrink-0 text-muted-foreground" />
                                    <p className="text-muted-foreground italic">"{insight.quote}"</p>
                                </div>
                                <p className="text-xs text-muted-foreground text-right">- {insight.persona}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
