
"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, PlusCircle, XCircle } from 'lucide-react';

const segmentSchema = z.object({
    value: z.string().min(1, 'Este campo es requerido.'),
});

const panelFormSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
    size: z.number().min(5).max(30),
    segments: z.array(segmentSchema).min(1, "Añade al menos un segmento.").max(5, "No más de 5 segmentos."),
});

type PanelFormData = z.infer<typeof panelFormSchema>;

const initialValues: PanelFormData = {
    name: 'Checkout para compradores con baja visión',
    size: 10,
    segments: [{ value: 'Baja visión' }, { value: 'Edad: 25-35' }],
};

const segmentSuggestions = ['Baja visión', 'Estudiante', 'Gerente de Producto', 'Nuevo usuario', 'Acceso móvil', 'Poder adquisitivo alto'];

export function PanelBuilder() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [segmentInput, setSegmentInput] = useState('');

    const form = useForm<PanelFormData>({
        resolver: zodResolver(panelFormSchema),
        defaultValues: initialValues,
    });

    const { fields: segmentFields, append: appendSegment, remove: removeSegment } = useFieldArray({
        control: form.control,
        name: "segments",
    });

    const handleAddSegment = (value: string) => {
        if (value.trim() && segmentFields.length < 5) {
            appendSegment({ value: value.trim() });
            setSegmentInput('');
        }
    };
    
    async function onSubmit(values: PanelFormData) {
        setIsLoading(true);
        console.log("Generando panel sintético con:", values);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast({
            title: "Panel Generado",
            description: `Se generó un panel de ${values.size} usuarios sintéticos.`,
        });
        setIsLoading(false);
    }
    
    return (
        <Card className="rounded-expressive shadow-e2">
            <CardHeader>
                <CardTitle>Crear un Panel Sintético</CardTitle>
                <CardDescription>Define los atributos de los usuarios que quieres simular. La IA generará perfiles realistas basados en tu configuración.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Experimento</FormLabel>
                            <FormControl><Input {...field} placeholder="Ej: Test de checkout para CA-β" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="size" render={({ field: { onChange, value } }) => (
                        <FormItem>
                            <FormLabel>Tamaño del Panel (usuarios): {value}</FormLabel>
                            <FormControl>
                                <Slider value={[value]} onValueChange={(v) => onChange(v[0])} min={5} max={30} step={1} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    
                    <FormItem>
                        <FormLabel>Segmentos ({segmentFields.length}/5)</FormLabel>
                        <div className="flex gap-2">
                            <Input
                                value={segmentInput}
                                onChange={(e) => setSegmentInput(e.target.value)}
                                placeholder="Ej: Baja visión, Rol: Estudiante"
                                disabled={segmentFields.length >= 5}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddSegment(segmentInput);
                                    }
                                }}
                            />
                            <Button type="button" variant="outline" onClick={() => handleAddSegment(segmentInput)} disabled={segmentFields.length >= 5 || !segmentInput.trim()}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Añadir
                            </Button>
                        </div>
                         <div className="flex flex-wrap gap-2 pt-2 min-h-[34px]">
                            {segmentFields.map((field, index) => (
                            <motion.div key={field.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                <Badge variant="secondary" className="text-sm py-1 pl-3 pr-2 bg-primary-container text-on-primary-container hover:bg-primary-container/80">
                                    {segmentFields[index].value}
                                    <button type="button" onClick={() => removeSegment(index)} className="ml-2 rounded-full hover:bg-black/10">
                                        <XCircle className="h-4 w-4" />
                                    </button>
                                </Badge>
                            </motion.div>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-1 pt-2">
                            {segmentSuggestions.map(suggestion => (
                                <Button key={suggestion} type="button" size="sm" variant="outline" onClick={() => handleAddSegment(suggestion)} disabled={segmentFields.length >= 5 || segmentFields.some(f => f.value === suggestion)}>
                                    {suggestion}
                                </Button>
                            ))}
                        </div>
                        <FormMessage>{form.formState.errors.segments?.message}</FormMessage>
                    </FormItem>
                    
                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Users className="mr-2 h-5 w-5" />}
                        Generar Panel
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    );
}
