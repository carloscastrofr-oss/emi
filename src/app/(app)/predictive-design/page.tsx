
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { predictiveDesign } from '@/ai/flows/predictive-design';
import { type PredictiveDesignOutput, PredictiveDesignInputSchema } from '@/types/predictive-design';
import { Loader2, Wand2, AlertTriangle, Check, X, DraftingCompass, Newspaper, Upload } from 'lucide-react';

const formSchema = PredictiveDesignInputSchema.extend({
    planningFile: z.any().optional(),
});


function ProposalCard({ journeyUrl, wireframeFrames, onAccept, onDismiss }: { journeyUrl: string, wireframeFrames: string[], onAccept: () => void, onDismiss: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="h-full"
    >
      <Card className="rounded-expressive shadow-e2 flex flex-col h-full">
        <CardHeader>
          <CardTitle>Propuesta Generada</CardTitle>
          <CardDescription>Valida los artefactos antes de sincronizar.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-2"><DraftingCompass className="h-4 w-4 text-primary" /> Journey Map</h4>
            <div className="bg-muted p-4 rounded-lg text-center">
              <a href={journeyUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm hover:opacity-80">Ver en FigJam</a>
              <img src="https://placehold.co/300x150.png" data-ai-hint="flow chart diagram" alt="Miniatura de Journey Map" className="w-full h-auto rounded-md mt-2" />
            </div>
          </div>
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-2"><Newspaper className="h-4 w-4 text-primary" /> Wireframes</h4>
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">{wireframeFrames.length} pantallas generadas</p>
              <img src="https://placehold.co/300x150.png" data-ai-hint="user interface wireframe" alt="Miniatura de Wireframes" className="w-full h-auto rounded-md mt-2" />
            </div>
          </div>
        </CardContent>
        <CardContent>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onDismiss}><X className="mr-2 h-4 w-4" /> Descartar</Button>
            <Button onClick={onAccept}><Check className="mr-2 h-4 w-4" /> Aceptar y Sincronizar</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


export default function PredictiveDesignPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictiveDesignOutput | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maxScreens: 8,
      figmaFileId: 'FIGMA_FILE_ID_HERE',
      planningFile: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    const payload = {
        planningFileId: fileName || 'quarterly-planning.xlsx',
        maxScreens: Number(values.maxScreens),
        figmaFileId: values.figmaFileId
    }

    try {
      const response = await predictiveDesign(payload);
      setResult(response);
       if (response.status === 'error') {
        toast({
          title: "Error de Validación",
          description: response.log,
          variant: "destructive",
        });
      } else {
         toast({
          title: "Análisis Completado",
          description: response.log,
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error Inesperado",
        description: error.message || "Ocurrió un error al ejecutar el agente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDismissProposal = (index: number) => {
    if (!result) return;
    const newJourneyUrls = [...result.journeyUrls];
    newJourneyUrls.splice(index, 1);
    
    if (newJourneyUrls.length === 0) {
      setResult(null); 
      toast({ title: 'Propuestas Descartadas', description: 'Todas las propuestas han sido descartadas.' });
    } else {
      setResult({ ...result, journeyUrls: newJourneyUrls });
    }
  };

  const handleAcceptProposal = (index: number) => {
    toast({
      title: 'Propuesta Sincronizada',
      description: 'El Journey Map y los Wireframes han sido enviados a Figma.',
    });
    handleDismissProposal(index); 
  };


  return (
    <div className="space-y-8">
      <PageHeader
        title="Predictive Design (α)"
        description="Anticipa journeys y wireframes con IA a partir del planning trimestral."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
                          <div className="flex gap-2">
                             <Input 
                                placeholder="Ningún archivo seleccionado"
                                readOnly
                                value={fileName}
                                className="flex-grow"
                            />
                            <Button type="button" variant="default" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4" />
                                Seleccionar archivo
                            </Button>
                            <Input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden"
                                accept=".xlsx" 
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    field.onChange(file);
                                    setFileName(file ? file.name : '');
                                }} 
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
                                  onChange={e => {
                                    const value = e.target.value;
                                    field.onChange(value === '' ? '' : parseInt(value, 10));
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="figmaFileId"
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

        <div className="space-y-8">
           {result && result.status === 'error' ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error en el Agente</AlertTitle>
                <AlertDescription>{result.log}</AlertDescription>
              </Alert>
           ) : result && result.status === 'ready' && result.journeyUrls.length > 0 ? (
            <>
                <h3 className="text-xl font-semibold text-center">Panel de Validación</h3>
                 <div className="grid md:grid-cols-1 gap-6">
                    <AnimatePresence>
                    {result.journeyUrls.map((url, index) => (
                      <ProposalCard
                        key={url}
                        journeyUrl={url}
                        wireframeFrames={result.wireframeFrames}
                        onAccept={() => handleAcceptProposal(index)}
                        onDismiss={() => handleDismissProposal(index)}
                      />
                    ))}
                    </AnimatePresence>
                </div>
            </>
           ) : (
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
    </div>
  );
}
