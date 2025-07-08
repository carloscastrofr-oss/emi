'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray, Controller, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Wand2, PlusCircle, XCircle, Lightbulb, Palette, SlidersHorizontal, Users, DollarSign, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateDesignStrategy, GenerateDesignStrategyOutput } from '@/ai/flows/generate-design-strategy';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const okrSchema = z.object({
  objective: z.string().min(1, 'El objetivo es requerido.'),
  krs: z.string().min(1, 'Los KRs son requeridos.'),
});

const formSchema = z.object({
  vision: z.string().min(1, 'La visión es requerida.').max(140, 'La visión no debe exceder los 140 caracteres.'),
  valueProp: z.string().min(1, 'La propuesta de valor es requerida.').max(200, 'La propuesta de valor no debe exceder los 200 caracteres.'),
  okrs: z.array(okrSchema).min(1, 'Debe haber al menos un OKR.').max(3, 'No más de 3 OKRs.'),
  personas: z.array(z.object({ value: z.string().min(1, 'Este campo es requerido.') })).min(1, 'Añade al menos una persona.').max(5, 'No más de 5 personas.'),
  principles: z.array(z.object({ value: z.string().min(1, 'Este campo es requerido.') })).min(1, 'Añade al menos un principio.').max(5, 'No más de 5 principios.'),

  // New Rich Inputs
  scopeProducts: z.array(z.object({ value: z.string().min(1, 'Este campo es requerido.') })).min(1, 'Añade al menos un producto.'),
  legacyConstraints: z.string().max(300, "Máximo 300 caracteres.").optional(),
  tokenSeed: z.object({
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Debe ser un color HEX válido."),
    radius: z.number().min(0).max(40),
    motion: z.string(),
  }),
  governance: z.object({
    accountableRole: z.string().min(1, 'Este campo es requerido.'),
    workflow: z.string().min(1, 'Este campo es requerido.'),
  }),
  kpiWeights: z.object({
    csat: z.number().min(0).max(5),
    a11y: z.number().min(0).max(5),
    adoption: z.number().min(0).max(5),
  }).refine(data => data.csat + data.a11y + data.adoption > 0, {
    message: "Al menos un KPI debe tener un peso mayor a 0.",
    path: ["csat"],
  }),
  budget: z.object({
    usd: z.coerce.number().optional(),
    hoursWeek: z.coerce.number().optional(),
  }),
});


type FormData = z.infer<typeof formSchema>;
type ArrayFieldNames = "personas" | "principles" | "scopeProducts";

const initialValues: FormData = {
  vision: 'Flujos 5G sin fricción para todos',
  valueProp: 'Red 5G a 120 ms con contraste AA',
  okrs: [{ objective: 'Mejorar accesibilidad', krs: 'A11y-Score ≥ 95\nContrast ≥ 4.5' }],
  personas: [{ value: 'Usuarios con baja visión' }],
  principles: [{ value: 'accesibilidad' }, { value: 'flexibilidad' }],
  scopeProducts: [{ value: 'Producto Principal' }],
  legacyConstraints: '',
  tokenSeed: {
    primaryColor: '#455ADE',
    radius: 12,
    motion: 'Spring (Suave)',
  },
  governance: {
    accountableRole: 'Core Team',
    workflow: 'Kanban Simplificado',
  },
  kpiWeights: {
    csat: 3,
    a11y: 5,
    adoption: 2,
  },
  budget: {
    usd: undefined,
    hoursWeek: undefined,
  },
};

interface ChipInputProps {
  control: any;
  name: ArrayFieldNames;
  label: string;
  placeholder: string;
  limit: number;
}

const ChipInput = ({ control, name, label, placeholder, limit }: ChipInputProps) => {
  const { fields, append, remove } = useFieldArray({ control, name });
  const [inputValue, setInputValue] = useState('');
  const { formState: { errors } } = useFormContext<FormData>();

  const handleAdd = () => {
    if (inputValue.trim() && fields.length < limit) {
      append({ value: inputValue.trim() } as any);
      setInputValue('');
    }
  };
  
  const arrayError = errors[name];
  
  return (
    <FormItem>
      <FormLabel>{label} ({fields.length}/{limit})</FormLabel>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          disabled={fields.length >= limit}
        />
        <Button type="button" variant="outline" onClick={handleAdd} disabled={fields.length >= limit || !inputValue.trim()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 pt-2 min-h-[34px]">
        {fields.map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Badge variant="secondary" className="text-sm py-1 pl-3 pr-2 bg-primary-container text-on-primary-container hover:bg-primary-container/80">
                {fields[index].value}
                <button type="button" onClick={() => remove(index)} className="ml-2 rounded-full hover:bg-black/10">
                <XCircle className="h-4 w-4" />
                </button>
            </Badge>
          </motion.div>
        ))}
      </div>
      {arrayError && typeof arrayError === 'object' && 'message' in arrayError && <p className="text-sm font-medium text-destructive">{arrayError.message as string}</p>}
    </FormItem>
  );
};


export default function StrategyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GenerateDesignStrategyOutput | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });
  
  const { fields: okrFields, append: appendOkr, remove: removeOkr } = useFieldArray({
    control: form.control,
    name: 'okrs',
  });

  useEffect(() => {
    if (generatedResult) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [generatedResult]);

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setGeneratedResult(null);

    const transformChipArrays = (arr: {value: string}[] | undefined) => arr ? arr.map(item => item.value) : [];
    
    const payload = {
      ...values,
      personas: transformChipArrays(values.personas),
      principles: transformChipArrays(values.principles),
      scopeProducts: transformChipArrays(values.scopeProducts),
    };

    try {
        const result = await generateDesignStrategy(payload);
        setGeneratedResult(result);
        toast({
            title: "Estrategia Generada Exitosamente",
            description: "Tu nuevo documento de estrategia está listo más abajo.",
        });
    } catch (error: any) {
        console.error(error);
        toast({
            title: "Error al Generar Estrategia",
            description: error.message || 'Ocurrió un error. Por favor, inténtalo de nuevo.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
        <PageHeader
            title="Generador de Estrategia de Diseño"
            description="Define y documenta la estrategia para tu sistema de diseño."
        />
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* --- Basic Info --- */}
            <Card className="rounded-expressive shadow-e2">
                <CardHeader>
                    <CardTitle>1. Información Básica</CardTitle>
                    <CardDescription>Establece la visión y los objetivos principales.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="vision" render={({ field }) => (
                        <FormItem><FormLabel>Visión del Producto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="valueProp" render={({ field }) => (
                        <FormItem><FormLabel>Propuesta de Valor</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     {okrFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-2 relative bg-background/50">
                            <FormField control={form.control} name={`okrs.${index}.objective`} render={({ field }) => (
                                <FormItem><FormLabel>Objetivo {index + 1}</FormLabel><FormControl><Input {...field} placeholder="Ej: Mejorar accesibilidad" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name={`okrs.${index}.krs`} render={({ field }) => (
                                <FormItem><FormLabel>Resultados Clave (uno por línea)</FormLabel><FormControl><Textarea {...field} placeholder="Ej: A11y-Score ≥ 95" /></FormControl><FormMessage /></FormItem>
                            )} />
                            {okrFields.length > 1 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeOkr(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>}
                        </div>
                    ))}
                    {okrFields.length < 3 && <Button type="button" variant="outline" onClick={() => appendOkr({ objective: '', krs: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Añadir OKR</Button>}
                    <Controller control={form.control} name="okrs" render={({ fieldState }) => fieldState.error ? <p className="text-sm font-medium text-destructive">{fieldState.error.message}</p> : null} />
                </CardContent>
            </Card>

            {/* --- Context --- */}
            <div className="grid md:grid-cols-2 gap-8">
                <ChipInput control={form.control} name="personas" label="Personas Clave" placeholder="Ej: Usuarios con baja visión" limit={5} />
                <ChipInput control={form.control} name="principles" label="Principios de Diseño" placeholder="Ej: Escalabilidad" limit={5} />
                <ChipInput control={form.control} name="scopeProducts" label="Productos en Alcance" placeholder="Ej: Producto Principal" limit={5} />
                <FormField control={form.control} name="legacyConstraints" render={({ field }) => (
                    <FormItem><FormLabel>Restricciones Técnicas o Legacy</FormLabel><FormControl><Textarea {...field} placeholder="Describe cualquier dependencia, deuda técnica o restricción importante."/></FormControl><FormMessage /></FormItem>
                )} />
            </div>

            {/* --- Design & Governance --- */}
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="rounded-expressive">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5"/>Tokens Semilla</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="tokenSeed.primaryColor" render={({ field }) => (
                            <FormItem><FormLabel>Color Primario</FormLabel><FormControl><HexColorPicker color={field.value} onChange={field.onChange} style={{ width: '100%'}} /></FormControl><Input className="mt-2 font-mono" {...field} /><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="tokenSeed.radius" render={({ field: { onChange, value } }) => (
                            <FormItem><FormLabel>Radio de Borde: {value}px</FormLabel><FormControl><Slider value={[value]} onValueChange={(v) => onChange(v[0])} min={0} max={40} step={1} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="tokenSeed.motion" render={({ field }) => (
                            <FormItem><FormLabel>Animación</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Spring (Suave)">Spring (Suave)</SelectItem><SelectItem value="Lineal (Rápido)">Lineal (Rápido)</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                    </CardContent>
                </Card>
                 <Card className="rounded-expressive">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>Gobernanza</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="governance.accountableRole" render={({ field }) => (
                            <FormItem><FormLabel>Rol Responsable</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Core Team">Core Team</SelectItem><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Comité de Diseño">Comité de Diseño</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="governance.workflow" render={({ field }) => (
                            <FormItem><FormLabel>Flujo de Trabajo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Kanban Simplificado">Kanban Simplificado</SelectItem><SelectItem value="Git-flow">Git-flow</SelectItem><SelectItem value="Reunión Semanal">Reunión Semanal</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                    </CardContent>
                </Card>
            </div>

            {/* --- Metrics & Budget --- */}
            <div className="grid md:grid-cols-2 gap-8">
                 <Card className="rounded-expressive">
                    <CardHeader><CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5"/>Métricas Prioritarias</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                       <FormField control={form.control} name="kpiWeights.csat" render={({ field: { onChange, value } }) => (
                            <FormItem><FormLabel>Satisfacción del Cliente (CSAT) - Peso: {value}</FormLabel><FormControl><Slider value={[value]} onValueChange={(v) => onChange(v[0])} min={0} max={5} step={1} /></FormControl></FormItem>
                       )} />
                       <FormField control={form.control} name="kpiWeights.a11y" render={({ field: { onChange, value } }) => (
                            <FormItem><FormLabel>Accesibilidad (A11y) - Peso: {value}</FormLabel><FormControl><Slider value={[value]} onValueChange={(v) => onChange(v[0])} min={0} max={5} step={1} /></FormControl></FormItem>
                       )} />
                       <FormField control={form.control} name="kpiWeights.adoption" render={({ field: { onChange, value } }) => (
                            <FormItem><FormLabel>Adopción de Componentes - Peso: {value}</FormLabel><FormControl><Slider value={[value]} onValueChange={(v) => onChange(v[0])} min={0} max={5} step={1} /></FormControl><FormMessage /></FormItem>
                       )} />
                        <FormMessage>{form.formState.errors.kpiWeights?.root?.message}</FormMessage>
                    </CardContent>
                </Card>
                 <Card className="rounded-expressive">
                    <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5"/>Presupuesto (Opcional)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="budget.usd" render={({ field }) => (
                            <FormItem><FormLabel>Presupuesto (USD)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="budget.hoursWeek" render={({ field }) => (
                            <FormItem><FormLabel>Horas por Semana</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>
            </div>
            
            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                Generar Documento de Estrategia
            </Button>
        </form>
        </Form>
        
        <section id="result" ref={resultsRef} className="mt-12">
        {generatedResult && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
            >
                <Tabs defaultValue="narrative">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="narrative">Interpretación IA</TabsTrigger>
                        <TabsTrigger value="markdown">Markdown</TabsTrigger>
                        <TabsTrigger value="json">JSON</TabsTrigger>
                    </TabsList>
                    <TabsContent value="narrative">
                        <Card className="rounded-expressive">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="text-primary h-5 w-5" />
                                    Interpretación para el Equipo de Diseño
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <h4 className="font-semibold mb-1">Resumen Estratégico</h4>
                                    <p className="text-muted-foreground">{generatedResult.designInterpretation.strategicSummary}</p>
                                </div>
                                 <div>
                                    <h4 className="font-semibold mb-1">Dirección Visual</h4>
                                    <p className="text-muted-foreground">{generatedResult.designInterpretation.visualDirection}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Objetivos de UX</h4>
                                    <p className="text-muted-foreground">{generatedResult.designInterpretation.userExperienceGoals}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Gobernanza Práctica</h4>
                                    <p className="text-muted-foreground">{generatedResult.designInterpretation.governanceModel}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Sugerencias de Componentes</h4>
                                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                        {generatedResult.designInterpretation.componentSuggestions.map((suggestion, index) => (
                                            <li key={index}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="markdown">
                         <Card className="rounded-expressive">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="text-primary h-5 w-5" />
                                    Documento de Estrategia
                                </CardTitle>
                                <CardDescription>Este es el resultado de tu brief. Puedes copiar el Markdown.</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <Alert>
                                    <AlertTitle>¡Éxito!</AlertTitle>
                                    <AlertDescription>
                                        Tu estrategia ha sido guardada con el ID: <br/>
                                        <code className="text-xs break-all">{generatedResult.strategyId}</code>
                                    </AlertDescription>
                                </Alert>
                                <pre className="mt-4 w-full whitespace-pre-wrap bg-muted p-4 rounded-md text-xs font-mono">
                                    <code>{generatedResult.markdown}</code>
                                </pre>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="json">
                         <Card className="rounded-expressive">
                            <CardHeader><CardTitle>Payload JSON</CardTitle></CardHeader>
                            <CardContent>
                                <pre className="mt-4 w-full whitespace-pre-wrap bg-muted p-4 rounded-md text-xs font-mono">
                                    <code>{generatedResult.json}</code>
                                </pre>
                            </CardContent>
                         </Card>
                    </TabsContent>
                </Tabs>
            </motion.div>
        )}
        </section>
    </div>
  );
}
