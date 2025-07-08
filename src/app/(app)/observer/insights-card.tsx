
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const insights = {
    nps: 38,
    csat: 4.2,
    verbatims: ["El CTA verde destaca", "Falta información de envío", "El proceso fue muy rápido"]
};

export function InsightsCard() {
    return (
        <Card className="rounded-expressive shadow-e2 h-full bg-primary-container text-on-primary-container">
            <CardHeader>
                <CardTitle>User Insights</CardTitle>
                <CardDescription className="text-on-primary-container/80">Feedback cualitativo de la página seleccionada.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-around text-center p-4 bg-background/10 rounded-lg">
                    <div>
                        <p className="text-3xl font-bold">{insights.nps}</p>
                        <p className="text-xs text-on-primary-container/80">NPS</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{insights.csat}</p>
                        <p className="text-xs text-on-primary-container/80">CSAT</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{insights.verbatims.length}</p>
                        <p className="text-xs text-on-primary-container/80">Verbatims</p>
                    </div>
                </div>
                <div className="space-y-2 pt-2">
                    <h4 className="font-semibold text-sm">Comentarios Destacados:</h4>
                    {insights.verbatims.slice(0, 2).map((text, i) => (
                         <div key={i} className="flex items-start gap-2 text-sm p-3 rounded-md bg-background/10">
                            <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p className="text-on-primary-container/90">{text}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
