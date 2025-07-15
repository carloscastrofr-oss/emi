
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, AlertTriangle } from 'lucide-react';
import { runPredictiveDesign } from '@/app/actions/runPredictiveDesign';

export const runtime = "nodejs";

const formSchema = z.object({
  planningFile: z
    .any()
    .refine((files) => files?.length === 1, 'Se requiere el archivo de planning.')
    .refine((files) => files?.[0]?.size > 0, 'El archivo no puede estar vacío.'),
  maxScreens: z.coerce.number().min(1, 'Debe ser al menos 1.'),
  figmaDest: z.string().min(1, 'El ID del archivo Figma es requerido.'),
});

export default function PredictiveDesignPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
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
      
      if (response.status === 'ok') {
        setResult(response.analysis);
        toast({
          title: "Análisis Completado",
          description: "Se han generado nuevas propuestas.",
        });
      } else {
        let errorMessage = `Código de error: ${response.code}`;
        if ('missing' in response && response.missing) {
            errorMessage += ` - Faltan las columnas: ${response.missing.join(', ')}`;
        }
        if ('message' in response && response.message) {
            errorMessage += ` - ${response.message}`;
        }
         setResult({ error: errorMessage });
      }
    } catch (error: any) {
      console.error(error);
      setResult({ error: "Ocurrió un error inesperado al ejecutar el agente." });
    } finally {
      setIsLoading(false);
    }
  }

  const selectedFile = form.watch('planningFile');
  
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

        {result?.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error en el Agente</AlertTitle>
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
        )}
        
        {result && !result.error ? (
          <Card className="rounded-expressive shadow-e2">
             <CardHeader>
                <CardTitle>Resultados del Análisis</CardTitle>
                <CardDescription>Resumen de los journeys y componentes identificados.</CardDescription>
            </CardHeader>
             <CardContent>
                <pre className="mt-4 w-full whitespace-pre-wrap bg-muted p-4 rounded-md text-xs font-mono">
                  <code>{JSON.stringify(result, null, 2)}</code>
                </pre>
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
