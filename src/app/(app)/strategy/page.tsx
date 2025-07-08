
'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Wand2, PlusCircle, XCircle, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateDesignStrategy, GenerateDesignStrategyInput, GenerateDesignStrategyOutput } from '@/ai/flows/generate-design-strategy';

const okrSchema = z.object({
  objective: z.string().min(1, 'El objetivo es requerido.'),
  krs: z.string().min(1, 'Los KRs son requeridos.'),
});

const formSchema = z.object({
  vision: z.string().min(1, 'La visión es requerida.').max(140, 'La visión no debe exceder los 140 caracteres.'),
  valueProp: z.string().min(1, 'La propuesta de valor es requerida.').max(200, 'La propuesta de valor no debe exceder los 200 caracteres.'),
  okrs: z.array(okrSchema).min(1, 'Debe haber al menos un OKR.').max(3, 'No más de 3 OKRs.'),
  personas: z.array(z.object({ value: z.string().min(1) })).min(1, 'Añade al menos una persona.').max(5, 'No más de 5 personas.'),
  principles: z.array(z.object({ value: z.string().min(1) })).min(1, 'Añade al menos un principio.').max(5, 'No más de 5 principios.'),
  pages: z.array(z.object({ value: z.string().min(1) })).min(1, 'Añade al menos una página.').max(3, 'No más de 3 páginas.'),
  kpis: z.array(z.object({ value: z.string().min(1) })).min(1, 'Añade al menos un KPI.').max(3, 'No más de 3 KPIs.'),
  componentsRoadmap: z.array(z.object({ value: z.string().min(1) })).min(1, 'Añade al menos un componente.').max(5, 'No más de 5 componentes en el roadmap.'),
  risks: z.array(z.object({ value: z.string().min(1) })).max(3, 'No más de 3 riesgos.'),
  milestones: z.array(z.object({ value: z.string().min(1) })).max(5, 'No más de 5 hitos.'),
});

type FormData = z.infer<typeof formSchema>;

type ArrayFieldNames = "personas" | "principles" | "pages" | "kpis" | "componentsRoadmap" | "risks" | "milestones";

const initialValues: FormData = {
  vision: 'Flujos 5G sin fricción para todos',
  valueProp: 'Red 5G a 120 ms con contraste AA',
  okrs: [{ objective: 'Mejorar accesibilidad', krs: 'A11y-Score ≥ 95\nContrast ≥ 4.5' }],
  personas: [{ value: 'Usuarios con baja visión' }],
  principles: [{ value: 'Radius 24 dp' }, { value: 'Spring 400/25' }],
  pages: [{ value: '/checkout' }],
  kpis: [{ value: 'CSAT ≥ 4.5' }],
  componentsRoadmap: [{ value: 'Badge' }, { value: 'Theme Switcher' }],
  risks: [{ value: 'Variantes de botón duplicadas' }],
  milestones: [{ value: 'Test de usabilidad 15/09' }],
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
  const { watch, formState: { errors } } = useFormContext<FormData>();
  const currentValues = watch(name) || [];

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
            <Badge variant="secondary" className="text-base py-1 pl-3 pr-2 bg-primary-container text-on-primary-container hover:bg-primary-container/80">
              {currentValues[index]?.value}
              <button type="button" onClick={() => remove(index)} className="ml-2 rounded-full hover:bg-black/10">
                <XCircle className="h-4 w-4" />
              </button>
            </Badge>
          </motion.div>
        ))}
      </div>
      {arrayError && <p className="text-sm font-medium text-destructive">{arrayError.message}</p>}
    </FormItem>
  );
};


export default function StrategyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GenerateDesignStrategyOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });
  
  const { fields: okrFields, append: appendOkr, remove: removeOkr } = useFieldArray({
    control: form.control,
    name: 'okrs',
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setGeneratedResult(null);

    const transformChipArrays = (arr: {value: string}[] | undefined) => arr ? arr.map(item => item.value) : [];

    const payload: GenerateDesignStrategyInput = {
        vision: values.vision,
        valueProp: values.valueProp,
        okrs: values.okrs,
        personas: transformChipArrays(values.personas),
        principles: transformChipArrays(values.principles),
        pages: transformChipArrays(values.pages),
        kpis: transformChipArrays(values.kpis),
        componentsRoadmap: transformChipArrays(values.componentsRoadmap),
        risks: transformChipArrays(values.risks),
        milestones: transformChipArrays(values.milestones),
    };

    try {
        const result = await generateDesignStrategy(payload);
        setGeneratedResult(result);
        toast({
            title: "Estrategia Generada Exitosamente",
            description: "Tu nuevo documento de estrategia está listo.",
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <motion.div
                    whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                    <Card className="rounded-expressive shadow-e2">
                        <CardHeader>
                            <CardTitle>Brief de Estrategia</CardTitle>
                            <CardDescription>Completa los campos para generar tu documento de estrategia.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="vision"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Visión del Producto</FormLabel>
                                    <FormControl>
                                    <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="valueProp"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Propuesta de Valor</FormLabel>
                                    <FormControl>
                                    <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </motion.div>
                
                {/* OKRs */}
                <Card className="rounded-expressive shadow-e2">
                    <CardHeader>
                        <CardTitle>Objetivos y Resultados Clave (OKRs)</CardTitle>
                        <CardDescription>Define de 1 a 3 objetivos medibles.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {okrFields.map((field, index) => (
                            <div key={field.id} className="p-4 border rounded-lg space-y-2 relative">
                                <FormField
                                    control={form.control}
                                    name={`okrs.${index}.objective`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Objetivo {index + 1}</FormLabel>
                                        <FormControl><Input {...field} placeholder="Ej: Mejorar accesibilidad" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`okrs.${index}.krs`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Resultados Clave (uno por línea)</FormLabel>
                                        <FormControl><Textarea {...field} placeholder="Ej: A11y-Score ≥ 95" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                {okrFields.length > 1 && (
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeOkr(index)}>
                                        <XCircle className="h-5 w-5 text-destructive" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        {okrFields.length < 3 && (
                            <Button type="button" variant="outline" onClick={() => appendOkr({ objective: '', krs: '' })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Añadir OKR
                            </Button>
                        )}
                         <Controller
                            control={form.control}
                            name="okrs"
                            render={({ fieldState }) => fieldState.error ? <p className="text-sm font-medium text-destructive">{fieldState.error.message}</p> : null}
                        />
                    </CardContent>
                </Card>

                {/* Dynamic Chip Inputs */}
                <div className="grid md:grid-cols-2 gap-8">
                   <ChipInput control={form.control} name="personas" label="Personas" placeholder="Ej: Usuarios con baja visión" limit={5} />
                   <ChipInput control={form.control} name="principles" label="Principios de Diseño" placeholder="Ej: Radius 24 dp" limit={5} />
                   <ChipInput control={form.control} name="pages" label="Páginas Clave" placeholder="Ej: /checkout" limit={3} />
                   <ChipInput control={form.control} name="kpis" label="KPIs de UX" placeholder="Ej: CSAT ≥ 4.5" limit={3} />
                   <ChipInput control={form.control} name="componentsRoadmap" label="Roadmap de Componentes" placeholder="Ej: Badge" limit={5} />
                   <ChipInput control={form.control} name="risks" label="Riesgos" placeholder="Ej: Variantes duplicadas" limit={3} />
                   <ChipInput control={form.control} name="milestones" label="Hitos" placeholder="Ej: Test de usabilidad" limit={5} />
                </div>
                
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                    Generar Documento de Estrategia
                </Button>
            </form>
            </Form>
        </div>
        <div className="lg:col-span-1 space-y-8 sticky top-20">
            {generatedResult && (
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    <Card className="rounded-expressive">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="text-primary h-5 w-5" />
                                Estrategia Generada
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
                                <code>
                                    {generatedResult.markdown}
                                </code>
                            </pre>
                        </CardContent>
                    </Card>

                    <Card className="rounded-expressive">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="text-primary h-5 w-5" />
                                Interpretación para el Diseñador
                            </CardTitle>
                            <CardDescription>Ideas y estrategia generadas por IA para el equipo de diseño.</CardDescription>
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
                                <h4 className="font-semibold mb-1">Sugerencias de Componentes</h4>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                    {generatedResult.designInterpretation.componentSuggestions.map((suggestion, index) => (
                                        <li key={index}>{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
      </div>
    </div>
  );
}
