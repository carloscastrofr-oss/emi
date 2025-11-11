
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, PlusCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

export function UXDraftAgentCard() {
  const [output, setOutput] = useState('');
  const [scenarios, setScenarios] = useState(['Usuario nuevo', 'Usuario recurrente']);
  const [scenarioInput, setScenarioInput] = useState('');
  const [components, setComponents] = useState(['Button', 'Card', 'Input']);
  const [componentInput, setComponentInput] = useState('');

  const handleGenerate = () => {
    setOutput(JSON.stringify(
      {
        "flows":[{"nombre":"Flujo de compra","pasos":[{"id":"paso-1","titulo":"Ver producto"},{"id":"paso-2","titulo":"Añadir al carrito"}]}],
        "microcopy":[{"componente":"Button","texto":"Comprar Ahora","tono":"Directo","criteriosAceptacion":"El botón es claramente visible"}],
      }, null, 2)
    );
  };
  
  const addChip = (list: string[], setList: (l: string[]) => void, input: string, setInput: (s: string) => void) => {
    if (input.trim()) {
        setList([...list, input.trim()]);
        setInput('');
    }
  }

  const removeChip = (list: string[], setList: (l: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  }

  return (
    <Card className="rounded-expressive">
      <CardHeader>
        <CardTitle>UX Writing & Flow Draft Agent</CardTitle>
        <CardDescription>Genera borradores de flujos y microcopy basados en tus objetivos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ux-objective">Objetivo</Label>
          <Textarea id="ux-objective" placeholder="Ej: Simplificar el proceso de checkout" />
        </div>
        <div className="space-y-2">
            <Label>Escenarios</Label>
            <div className="flex gap-2">
                <Input value={scenarioInput} onChange={(e) => setScenarioInput(e.target.value)} placeholder="Añadir escenario..."/>
                <Button type="button" variant="outline" size="icon" onClick={() => addChip(scenarios, setScenarios, scenarioInput, setScenarioInput)}><PlusCircle className="h-4 w-4"/></Button>
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
                {scenarios.map((s, i) => <Badge key={i} variant="secondary">{s} <XCircle className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeChip(scenarios, setScenarios, i)}/></Badge>)}
            </div>
        </div>
        <div className="space-y-2">
            <Label>Componentes DS Permitidos</Label>
            <div className="flex gap-2">
                <Input value={componentInput} onChange={(e) => setComponentInput(e.target.value)} placeholder="Añadir componente..."/>
                <Button type="button" variant="outline" size="icon" onClick={() => addChip(components, setComponents, componentInput, setComponentInput)}><PlusCircle className="h-4 w-4"/></Button>
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
                {components.map((c, i) => <Badge key={i} variant="secondary">{c} <XCircle className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeChip(components, setComponents, i)}/></Badge>)}
            </div>
        </div>
         <div className="space-y-2">
          <Label htmlFor="ux-tone">Tono de Marca</Label>
          <Input id="ux-tone" defaultValue="Amigable y claro" />
        </div>
        <Button onClick={handleGenerate} className="w-full">
          <Bot className="mr-2 h-4 w-4" />
          Generar Borrador
        </Button>
        {output && (
          <div>
            <Label>Resultados</Label>
            <Textarea readOnly value={output} className="mt-2 h-48 font-mono text-xs" />
            <div className="mt-2 flex gap-2">
                <Button variant="secondary">Crear borrador en Figma</Button>
                <Button variant="secondary">Guardar en Insights</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
