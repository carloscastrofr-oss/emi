"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bot } from "lucide-react";
import { useState } from "react";

export function UIA11yReviewAgentCard() {
  const [output, setOutput] = useState("");

  const handleGenerate = () => {
    setOutput(
      JSON.stringify(
        {
          hallazgos: [
            {
              tipo: "contraste",
              nodo: "#button-primary",
              detalle: "El contraste de 3.1:1 es insuficiente.",
              severidad: "high",
              recomendacion: "Usar un color de texto más oscuro, como #FFFFFF sobre #4A55A1.",
            },
          ],
          resumen: { scoreA11y: 78, scoreConsistencia: 92 },
        },
        null,
        2
      )
    );
  };

  return (
    <Card className="rounded-expressive">
      <CardHeader>
        <CardTitle>UI & A11y Review Agent</CardTitle>
        <CardDescription>
          Audita un archivo de Figma en busca de problemas de accesibilidad y consistencia con el
          DS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="review-figma-key">Figma File Key</Label>
          <Input id="review-figma-key" placeholder="Clave del archivo de Figma" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="review-nodes">Nodos (IDs)</Label>
          <Input id="review-nodes" placeholder="IDs de nodos separados por coma" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="review-level">Nivel WCAG</Label>
          <Select defaultValue="AA">
            <SelectTrigger id="review-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AA">AA</SelectItem>
              <SelectItem value="AAA">AAA</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleGenerate} className="w-full">
          <Bot className="mr-2 h-4 w-4" />
          Auditar
        </Button>
        {output && (
          <div>
            <Label>Resultados</Label>
            <Textarea readOnly value={output} className="mt-2 h-48 font-mono text-xs" />
            <div className="mt-2 flex gap-2">
              <Button variant="secondary">Crear tickets en Jira</Button>
              <Button variant="secondary">Guardar en Insights</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
