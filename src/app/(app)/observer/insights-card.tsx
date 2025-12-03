"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const insightsByVariant = {
  A: {
    nps: 38,
    csat: 4.2,
    verbatims: [
      "El botón 'Proceder al Pago' es claro, pero me gustaría ver los métodos de pago aceptados antes de hacer clic.",
      "No encontraba dónde introducir mi código de descuento. Tuve que buscar un poco hasta que vi el enlace debajo del subtotal.",
      "El proceso de pago fue increíblemente rápido. Añadir y ajustar cantidades fue muy intuitivo.",
    ],
  },
  B: {
    nps: 45,
    csat: 4.4,
    verbatims: [
      "El nuevo botón verde de 'Pagar Ahora' es mucho más visible. Me dio confianza.",
      "Pude aplicar mi cupón fácilmente con el campo visible. ¡Gran mejora!",
      "El flujo se sintió más directo y sin complicaciones.",
    ],
  },
  default: {
    nps: 38,
    csat: 4.2,
    verbatims: [
      "El botón 'Proceder al Pago' es claro, pero me gustaría ver los métodos de pago aceptados antes de hacer clic.",
      "No encontraba dónde introducir mi código de descuento. Tuve que buscar un poco hasta que vi el enlace debajo del subtotal.",
      "El proceso de pago fue increíblemente rápido. Añadir y ajustar cantidades fue muy intuitivo.",
    ],
  },
};

export function InsightsCard({ variant = "default" }: { variant?: "A" | "B" | "default" }) {
  const insights = insightsByVariant[variant] || insightsByVariant.default;

  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -4, boxShadow: "var(--tw-shadow-e8)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card className="rounded-expressive shadow-e2 h-full">
        <CardHeader>
          <CardTitle>User Insights {variant !== "default" && `- Variante ${variant}`}</CardTitle>
          <CardDescription>Feedback cualitativo de la página seleccionada.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-around text-center p-4 bg-muted rounded-lg">
            <div>
              <p className="text-3xl font-bold">{insights.nps}</p>
              <p className="text-xs text-muted-foreground">NPS</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{insights.csat}</p>
              <p className="text-xs text-muted-foreground">CSAT</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{insights.verbatims.length}</p>
              <p className="text-xs text-muted-foreground">Verbatims</p>
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <h4 className="font-semibold text-sm">Comentarios Destacados:</h4>
            {insights.verbatims.slice(0, 2).map((text, i) => (
              <div key={i} className="flex items-start gap-2 text-sm p-3 rounded-md bg-muted">
                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
