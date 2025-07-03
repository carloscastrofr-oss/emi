"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Bot } from "lucide-react";

interface AgentCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  flow: (input: any) => Promise<any>;
  formFields: { name: string; label: string }[];
  placeholder?: string;
}

export function AgentCard({ title, description, icon: Icon, flow, formFields, placeholder }: AgentCardProps) {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const defaultValues = formFields.reduce((acc, field) => {
    if (field.name === formFields[0].name) {
        acc[field.name] = placeholder || "";
    } else {
        acc[field.name] = "";
    }
    return acc;
  }, {} as Record<string, string>);

  const form = useForm({
    defaultValues,
  });

  async function onSubmit(values: Record<string, any>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await flow(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: `Failed to run ${title}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formFields.map((field) => (
                <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`Provide ${field.label}`}
                        className="min-h-[120px] font-mono text-xs"
                        {...formField}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bot className="mr-2 h-4 w-4" />
              )}
              Run Agent
            </Button>
          </form>
        </Form>
      </CardContent>
      {result && (
        <CardFooter className="flex-col items-start gap-2 pt-0">
            <h3 className="mb-2 flex items-center text-lg font-semibold">
                <Sparkles className="mr-2 h-5 w-5 text-accent" />
                Agent Response
            </h3>
            <Card className="w-full">
                <CardContent className="p-4">
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {JSON.stringify(result, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </CardFooter>
      )}
    </Card>
  );
}
