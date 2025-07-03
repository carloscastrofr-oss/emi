"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { generateComponentIdeas } from "@/ai/flows/generate-component-ideas";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Loader2, Sparkles } from "lucide-react";

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: "El prompt debe tener al menos 10 caracteres.",
  }),
});

export function LabsForm() {
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setIdeas([]);
    try {
      const result = await generateComponentIdeas(values);
      setIdeas(result.componentIdeas);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudieron generar ideas. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt para Componente</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ej: Una tabla de precios responsiva con un selector para planes mensuales/anuales"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generar Ideas
          </Button>
        </form>
      </Form>

      {ideas.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 flex items-center text-lg font-semibold">
              <Sparkles className="mr-2 h-5 w-5 text-accent" />
              Ideas Generadas
            </h3>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              {ideas.map((idea, index) => (
                <li key={index}>{idea}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
