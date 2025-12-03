"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const formSchema = z.object({
  topic: z.string().min(1, "El tópico es requerido."),
  userType: z.string().min(1, "El tipo de usuario es requerido."),
  clientType: z.string().min(1, "El tipo de cliente es requerido."),
  city: z.string().min(1, "La ciudad es requerida."),
  language: z.string().min(1, "El idioma es requerido."),
  tone: z.string().min(1, "El tono es requerido."),
  blocks: z.string().min(1, "El número de bloques es requerido."),
});

export default function AIWritingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "Créditos hipotecarios para jóvenes",
      userType: "Joven profesional",
      clientType: "Cliente nuevo",
      city: "Ciudad de México",
      language: "Español",
      tone: "Amigable",
      blocks: "2",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedContent("");
    try {
      // Mocking the API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockResult = `### Tu Futuro Hogar Comienza Hoy

Sabemos que dar el primer paso para comprar tu casa es una gran decisión. En [Nombre del Banco], queremos que ese paso sea firme y seguro. Descubre nuestros créditos hipotecarios diseñados especialmente para jóvenes profesionales como tú, con tasas preferenciales y un proceso claro y sin complicaciones. Tu futuro te espera, y estamos aquí para abrirte la puerta.

### ¿Por Qué un Crédito Hipotecario con Nosotros?

Porque entendemos tus metas. Te ofrecemos un plan flexible que se adapta a tu carrera en crecimiento, con asesoría personalizada para que tomes la mejor decisión financiera. Olvídate del papeleo interminable y de los términos que nadie entiende. Con nosotros, el camino a tu nuevo hogar es más fácil de lo que imaginas.`;
      setGeneratedContent(mockResult);
      toast({
        title: "Contenido Generado",
        description: "El Agente de Contenido ha completado su tarea.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo generar el contenido. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const userInsights = [
    "Los usuarios jóvenes valoran la transparencia y un lenguaje claro, evitando la jerga financiera compleja.",
    "La percepción de 'proceso complicado' es la principal barrera para solicitar un crédito hipotecario en este segmento.",
    "Los clientes nuevos responden positivamente a ofertas que demuestran que el banco entiende su etapa de vida (ej. primer empleo, matrimonio).",
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Writing"
        description="Produce copy y micro-copy, segmentado por ciudad y audiencia."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-expressive bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tópico</FormLabel>
                          <FormControl>
                            <Input className="bg-background/80" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de usuario</FormLabel>
                          <FormControl>
                            <Input className="bg-background/80" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clientType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de cliente</FormLabel>
                          <FormControl>
                            <Input className="bg-background/80" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad</FormLabel>
                          <FormControl>
                            <Input className="bg-background/80" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idioma</FormLabel>
                          <FormControl>
                            <Input className="bg-background/80" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tono</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/80">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Amigable">Amigable</SelectItem>
                              <SelectItem value="Profesional">Profesional</SelectItem>
                              <SelectItem value="Divertido">Divertido</SelectItem>
                              <SelectItem value="Formal">Formal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="blocks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bloques</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/80">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generar Contenido
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {generatedContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="rounded-expressive">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary h-5 w-5" />
                    Contenido Generado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: generatedContent
                        .replace(/### (.*?)\n/g, "<h3>$1</h3>")
                        .replace(/\n/g, "<br />"),
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-expressive sticky top-20">
            <CardHeader>
              <CardTitle>Insights de Usuarios</CardTitle>
              <CardDescription>Basado en el tópico y ciudad seleccionados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {userInsights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 text-sm p-3 rounded-md bg-muted/70">
                  <MessageSquare className="h-4 w-4 mt-1 flex-shrink-0 text-muted-foreground" />
                  <p className="text-muted-foreground">{insight}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
