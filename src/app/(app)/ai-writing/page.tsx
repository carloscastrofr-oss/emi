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
import { Checkbox } from "@/components/ui/checkbox";
import { Autocomplete } from "@/components/ui/autocomplete";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, MessageSquare, FolderOpen, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { generateAIWritingContent, generateInsights } from "./actions";
import { KitResourcesDialog } from "./kit-resources-dialog";
import aiWritingOptions from "@/config/ai-writing-options.json";
import { useLoadingStore } from "@/stores/loading-store";

const formSchema = z.object({
  topic: z.string().min(1, "El tópico es requerido."),
  userType: z.string().min(1, "El tipo de usuario es requerido"),
  clientType: z.string().min(1, "El tipo de cliente es requerido."),
  city: z.string().min(1, "La ciudad es requerida."),
  language: z.string().min(1, "El idioma es requerido."),
  tone: z.string().min(1, "El tono es requerido."),
  blocks: z.number().min(1).max(10),
});

export default function AIWritingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [userInsights, setUserInsights] = useState<string[]>([]);
  const [includeKitResources, setIncludeKitResources] = useState(false);
  const [selectedKitResourceIds, setSelectedKitResourceIds] = useState<string[]>([]);
  const [kitDialogOpen, setKitDialogOpen] = useState(false);
  const [discardedFiles, setDiscardedFiles] = useState<
    Array<{ id: string; title: string; reason: string }>
  >([]);
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoadingStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      userType: "",
      clientType: "",
      city: "",
      language: "",
      tone: "",
      blocks: 1,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedContent("");
    setUserInsights([]);
    setDiscardedFiles([]);

    // Activar loading global inmediatamente desde que se presiona el botón
    const loadingId = startLoading("Generando contenido con IA...");

    try {
      // Generar contenido (sin loading automático, ya lo manejamos manualmente)
      const result = await generateAIWritingContent({
        topic: values.topic,
        userType: values.userType,
        clientType: values.clientType,
        city: values.city,
        language: values.language,
        tone: values.tone,
        blocks: values.blocks,
        selectedKitResourceIds: includeKitResources ? selectedKitResourceIds : undefined,
      });

      setGeneratedContent(result.content);

      // Mostrar alert si hay archivos descartados
      if (result.discardedFiles && result.discardedFiles.length > 0) {
        setDiscardedFiles(result.discardedFiles);
        toast({
          title: "Algunos archivos fueron descartados",
          description: `${result.discardedFiles.length} archivo(s) no pudieron ser usados como contexto.`,
          variant: "default",
        });
      }

      // Actualizar mensaje de loading para insights
      useLoadingStore.getState().setLoadingMessage("Generando insights...");

      // Generar insights
      try {
        const insights = await generateInsights({
          topic: values.topic,
          userType: values.userType,
          clientType: values.clientType,
          city: values.city,
          language: values.language,
          tone: values.tone,
          generatedContent: result.content,
        });
        setUserInsights(insights);
      } catch (insightsError) {
        console.error("Error generating insights:", insightsError);
        // Continuar aunque falle la generación de insights
        toast({
          title: "Advertencia",
          description:
            "El contenido se generó correctamente, pero no se pudieron generar los insights.",
          variant: "default",
        });
      }

      toast({
        title: "Contenido Generado",
        description: "El Agente de Contenido ha completado su tarea.",
      });
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo generar el contenido. Por favor, inténtalo de nuevo.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Detener loading global
      stopLoading(loadingId);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Writing"
        description="Produce copy y micro-copy, segmentado por ciudad y audiencia."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Alert de archivos descartados */}
          {discardedFiles.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Archivos descartados</AlertTitle>
              <AlertDescription>
                <p className="mb-2">
                  Los siguientes archivos no pudieron ser usados como contexto porque no tienen
                  suficiente información relevante para generar copys:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {discardedFiles.map((file) => (
                    <li key={file.id}>
                      <strong>{file.title}</strong>: {file.reason}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

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
                            <Autocomplete
                              options={aiWritingOptions.userTypes}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Selecciona o escribe..."
                              className="bg-background/80"
                            />
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
                            <Autocomplete
                              options={aiWritingOptions.clientTypes}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Selecciona o escribe..."
                              className="bg-background/80"
                            />
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
                            <Autocomplete
                              options={aiWritingOptions.languages}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Selecciona o escribe..."
                              className="bg-background/80"
                            />
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
                          <FormControl>
                            <Autocomplete
                              options={aiWritingOptions.tones}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Selecciona o escribe..."
                              className="bg-background/80"
                            />
                          </FormControl>
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
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              className="bg-background/80"
                              {...field}
                              value={field.value}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Checkbox y botón para recursos de kit */}
                  <div className="flex items-center gap-4 p-4 rounded-md bg-muted/50">
                    <Checkbox
                      id="include-kit-resources"
                      checked={includeKitResources}
                      onCheckedChange={(checked) => {
                        setIncludeKitResources(checked === true);
                        if (!checked) {
                          setSelectedKitResourceIds([]);
                        }
                      }}
                    />
                    <label
                      htmlFor="include-kit-resources"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                    >
                      Incluir recursos de kit
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setKitDialogOpen(true)}
                      disabled={!includeKitResources || isLoading}
                    >
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Explorar recursos
                    </Button>
                  </div>

                  {includeKitResources && selectedKitResourceIds.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {selectedKitResourceIds.length} recurso
                      {selectedKitResourceIds.length !== 1 ? "s" : ""} seleccionado
                      {selectedKitResourceIds.length !== 1 ? "s" : ""}
                    </div>
                  )}

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

          <KitResourcesDialog
            open={kitDialogOpen}
            onOpenChange={setKitDialogOpen}
            selectedResourceIds={selectedKitResourceIds}
            onSelectionChange={setSelectedKitResourceIds}
          />

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
              {userInsights.length > 0 ? (
                userInsights.map((insight, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-sm p-3 rounded-md bg-muted/70"
                  >
                    <MessageSquare className="h-4 w-4 mt-1 flex-shrink-0 text-muted-foreground" />
                    <p className="text-muted-foreground">{insight}</p>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Los insights se generarán después de crear contenido.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
