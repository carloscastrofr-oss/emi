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
    message: "Prompt must be at least 10 characters.",
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
        description: "Failed to generate ideas. Please try again.",
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
                <FormLabel>Component Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., A responsive pricing table with a toggle for monthly/annual plans"
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
            Generate Ideas
          </Button>
        </form>
      </Form>

      {ideas.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 flex items-center text-lg font-semibold">
              <Sparkles className="mr-2 h-5 w-5 text-accent" />
              Generated Ideas
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
