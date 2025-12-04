"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle } from "lucide-react";
import { createABTest } from "./actions";
import { useAuthStore } from "@/stores/auth-store";
import { abTestTypes, kpiTypes } from "@/types/ab-test";

const formSchema = z.object({
  name: z.string().min(5, "El nombre debe tener al menos 5 caracteres."),
  type: z.enum(abTestTypes, { required_error: "El tipo es requerido." }),
  aId: z.string().min(1, "El ID de la Variante A es requerido."),
  bId: z.string().min(1, "El ID de la Variante B es requerido."),
  kpi: z.enum(kpiTypes, { required_error: "El KPI es requerido." }),
  // startDate and endDate could be added here with a DatePicker
});

export function CreateABTestDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "screen",
      aId: "",
      bId: "",
      kpi: "click-thru",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear un experimento.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    const result = await createABTest({ ...values, ownerUid: user.uid });
    setIsLoading(false);

    if (result.success) {
      toast({ title: "Experimento Creado", description: result.message });
      onOpenChange(false);
      form.reset();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Crear nuevo A/B Test</DialogTitle>
          <DialogDescription>
            Define las variantes y el KPI principal para empezar a comparar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Experimento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Color del CTA en Checkout" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="screen">Pantalla</SelectItem>
                        <SelectItem value="component">Componente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kpi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KPI</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="click-thru">Click-Through Rate</SelectItem>
                        <SelectItem value="task-success">Task Success</SelectItem>
                        <SelectItem value="time-on-task">Time on Task</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="aId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Variante A</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: /checkout-v1 o button-primary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Variante B</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: /checkout-v2 o button-secondary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                Crear Experimento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
