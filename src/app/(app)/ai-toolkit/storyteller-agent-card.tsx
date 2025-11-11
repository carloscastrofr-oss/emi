
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Bot } from 'lucide-react';
import { useState } from 'react';

export function StorytellerAgentCard() {
  const [output, setOutput] = useState('');

  const handleGenerate = () => {
    setOutput(JSON.stringify(
      {
        "storyline":[{
          "slide":1,
          "titulo":"El Problema: Abandono en el Checkout",
          "bullets":["- 35% de los usuarios abandonan en el paso de pago.","- Insight #123 muestra confusión sobre la seguridad."],
          "notaOrador":"Enfatizar el impacto en ingresos."
        }],
        "qna":[{"objecion":"¿Es caro arreglarlo?","respuesta":"El ROI de mejorar la confianza supera el costo de desarrollo."}],
        "kpiLink":[{"insightId":"insight-123","kpi":"Tasa de Conversión"}]
      }, null, 2)
    );
  };

  return (
    <Card className="rounded-expressive">
      <CardHeader>
        <CardTitle>Consulting Storyteller Agent</CardTitle>
        <CardDescription>Crea una narrativa persuasiva a partir de insights y KPIs para audiencias clave.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="story-insights">Insights a incluir</Label>
          <Input id="story-insights" placeholder="IDs de insights separados por coma" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="story-kpis">KPIs/OKRs Relevantes</Label>
          <Input id="story-kpis" placeholder="Ej: Tasa de Conversión, NPS" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="story-format">Formato</Label>
                <Select defaultValue="exec">
                    <SelectTrigger id="story-format"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="exec">Ejecutivo</SelectItem>
                        <SelectItem value="tactic">Táctico</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="story-output">Salida</Label>
                <Select defaultValue="slides">
                    <SelectTrigger id="story-output"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="slides">Google Slides</SelectItem>
                        <SelectItem value="notion">Notion</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <Button onClick={handleGenerate} className="w-full">
          <Bot className="mr-2 h-4 w-4" />
          Generar Deck/Guion
        </Button>
        {output && (
          <div>
            <Label>Resultados</Label>
            <Textarea readOnly value={output} className="mt-2 h-48 font-mono text-xs" />
            <div className="mt-2 flex gap-2">
                <Button variant="secondary">Exportar Slides</Button>
                <Button variant="secondary">Publicar en Notion</Button>
                <Button variant="secondary">Enviar a Slack</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
