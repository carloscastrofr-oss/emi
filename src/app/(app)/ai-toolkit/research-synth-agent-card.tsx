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
import { Bot, FileUp } from "lucide-react";
import { useState } from "react";

export function ResearchSynthAgentCard() {
  const [output, setOutput] = useState("");

  const handleGenerate = () => {
    // Mock output
    setOutput(
      JSON.stringify(
        {
          personas: [
            { nombre: "Ana", dolores: ["Textos pequeños"], motivaciones: ["Comprar rápido"] },
          ],
          jtbd: [
            {
              cuando: "Navego online",
              quiero: "encontrar mi producto",
              para: "completar mi compra eficientemente",
            },
          ],
          themes: ["Claridad en la navegación", "Legibilidad del texto"],
          opportunities: [
            {
              id: "opp-1",
              tema: "Legibilidad",
              impacto: 4,
              esfuerzo: 2,
              idea: "Aumentar tamaño de fuente base",
            },
          ],
        },
        null,
        2
      )
    );
  };

  return (
    <Card className="rounded-expressive">
      <CardHeader>
        <CardTitle>Research Synth Agent</CardTitle>
        <CardDescription>
          Genera Personas, JTBD y oportunidades a partir de datos de investigación.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="research-files">Archivos (audio/pdf/csv)</Label>
          <div className="flex items-center gap-2">
            <Input id="research-files" type="file" multiple className="cursor-pointer" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="research-lang">Idioma</Label>
            <Select defaultValue="es">
              <SelectTrigger id="research-lang">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">Inglés</SelectItem>
                <SelectItem value="pt">Portugués</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="research-anon">Nivel de Anonimización</Label>
            <Select defaultValue="redacted">
              <SelectTrigger id="research-anon">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="redacted">Redactar PII</SelectItem>
                <SelectItem value="keep">Mantener PII (uso interno)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="research-project">Proyecto</Label>
          <Input id="research-project" placeholder="ID del proyecto" />
        </div>
        <Button onClick={handleGenerate} className="w-full">
          <Bot className="mr-2 h-4 w-4" />
          Generar Síntesis
        </Button>
        {output && (
          <div>
            <Label>Resultados</Label>
            <Textarea readOnly value={output} className="mt-2 h-48 font-mono text-xs" />
            <div className="mt-2 flex gap-2">
              <Button variant="secondary">Guardar en Insights</Button>
              <Button variant="secondary">Enviar a Notion</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
