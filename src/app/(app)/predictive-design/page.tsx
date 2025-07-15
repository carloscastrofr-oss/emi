
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, AlertTriangle, Figma, Bot } from 'lucide-react';
import { runPredictiveDesign } from '@/app/actions/runPredictiveDesign';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const runtime = "nodejs";

const formSchema = z.object({
  planningFile: z
    .any()
    .refine((files) => files?.length === 1, 'Se requiere el archivo de planning.')
    .refine((files) => files?.[0]?.size > 0, 'El archivo no puede estar vacío.'),
  maxScreens: z.coerce.number().min(1, 'Debe ser al menos 1.'),
  figmaDest: z.string().min(1, 'El ID del archivo Figma es requerido.'),
});

interface Strategy {
  problemStatement: string;
  targetUsers: string;
  valueProposition: string;
  successMetrics: string;
  designPrinciples: string;
  risks: string;
}

interface DesignFrame {
  frameName: string;
  description: string;
  components: string[];
  width: number;
  height: number;
}
interface AnalysisResult {
  feature: string;
  strategy: Strategy;
  designPack: {
    frames: DesignFrame[];
  };
}

export default function PredictiveDesignPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ status: 'ok' | 'error'; figmaDest?: string; maxScreens?: number; analysis?: AnalysisResult[]; code?: string; message?: string; missing?: string[] } | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maxScreens: 8,
      figmaDest: 'FIGMA_FILE_KEY_HERE',
      planningFile: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('planningFile', values.planningFile[0]);
    formData.append('maxScreens', values.maxScreens.toString());
    formData.append('figmaDest', values.figmaDest);

    try {
      const response = await runPredictiveDesign(formData);
      setResult(response);
      
      if (response.status === 'ok') {
        toast({
          title: "Análisis Completado",
          description: "Se han generado nuevas propuestas de estrategia y diseño.",
        });
      }
    } catch (error: any) {
      console.error(error);
      setResult({ status: 'error', code: "CLIENT_FAILURE", message: "Ocurrió un error inesperado al ejecutar el agente." });
    } finally {
      setIsLoading(false);
    }
  }

  const selectedFile = form.watch('planningFile');
  
  const handleCreateInFigma = (feature: AnalysisResult) => {
    toast({
        title: `Creando "${feature.feature}" en Figma...`,
        description: "Esta función estará disponible próximamente.",
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Predictive Design (α)"
        description="Anticipa journeys y wireframes con IA a partir del planning trimestral."
      />
      
      <div className="space-y-8">
        <Card className="rounded-expressive shadow-e2">
          <CardHeader>
            <CardTitle>Iniciar Agente</CardTitle>
            <CardDescription>Configura los parámetros para la generación.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="planningFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Archivo de Planning (.xlsx)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                           <Input
                            readOnly
                            placeholder={selectedFile?.[0]?.name || "Ningún archivo seleccionado"}
                            className="flex-grow cursor-default"
                            onClick={() => fileInputRef.current?.click()}
                          />
                          <Button type="button" variant="default" onClick={() => fileInputRef.current?.click()}>
                            Seleccionar archivo
                          </Button>
                          <Input 
                              type="file" 
                              accept=".xlsx"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={(e) => field.onChange(e.target.files)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField
                      control={form.control}
                      name="maxScreens"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pantallas Máx.</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1"
                                step="1"
                                placeholder="8"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                      />
                  <FormField
                      control={form.control}
                      name="figmaDest"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>ID Figma Destino</FormLabel>
                          <FormControl>
                          <Input placeholder="FIGMA_FILE_KEY" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                </div>
                
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Analizar y Generar
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {result?.status === 'error' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error en el Agente</AlertTitle>
              <AlertDescription>
                Código de error: {result.code}
                {result.missing && ` - Faltan las columnas: ${result.missing.join(', ')}`}
                {result.message && ` - ${result.message}`}
              </AlertDescription>
            </Alert>
        )}
        
        {result?.status === 'ok' ? (
          <Card className="rounded-expressive shadow-e2">
             <CardHeader>
                <CardTitle>Resultados del Análisis</CardTitle>
                <CardDescription>Resumen de la estrategia y los wireframes identificados por la IA.</CardDescription>
            </CardHeader>
             <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {result.analysis?.map((feat, index) => (
                        <AccordionItem value={`item-${index}`} key={feat.feature}>
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <Bot className="h-5 w-5 text-primary" />
                                    <span>{feat.feature}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-6">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <h4 className="font-semibold">Estrategia de Producto y Diseño</h4>
                                    <ul>
                                        <li><strong>Enunciado del Problema:</strong> {feat.strategy.problemStatement}</li>
                                        <li><strong>Propuesta de Valor:</strong> {feat.strategy.valueProposition}</li>
                                        <li><strong>Principios de Diseño:</strong> {feat.strategy.designPrinciples}</li>
                                        <li><strong>Métricas de Éxito:</strong> {feat.strategy.successMetrics}</li>
                                        <li><strong>Usuarios Objetivo:</strong> {feat.strategy.targetUsers}</li>
                                        <li><strong>Riesgos:</strong> {feat.strategy.risks}</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Wireframes Propuestos</h4>
                                    <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                                        {feat.designPack.frames.map(frame => (
                                            <li key={frame.frameName}>{frame.frameName}</li>
                                        ))}
                                    </ul>
                                </div>
                                <Button onClick={() => handleCreateInFigma(feat)}>
                                    <Figma className="mr-2 h-4 w-4" />
                                    Crear en Figma
                                </Button>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
          </Card>
        ) : !result && (
             <Card className="rounded-expressive border-dashed min-h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground p-8">
                    <Wand2 className="mx-auto h-12 w-12 opacity-50 mb-4" />
                    <h3 className="font-semibold text-lg text-foreground">Esperando resultados...</h3>
                    <p>Ejecuta el agente para ver aquí las propuestas generadas.</p>
                </div>
             </Card>
        )}
      </div>
    </div>
  );
}
