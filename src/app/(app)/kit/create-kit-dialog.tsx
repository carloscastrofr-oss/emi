"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Users, Building2 } from "lucide-react";
import { IconPicker } from "@/components/icon-picker";
import { apiFetch } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-utils";
import type { Kit } from "@/types/kit";
import { useCurrentClient, useCurrentWorkspace, useSessionStore } from "@/stores/session-store";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  category: z.enum(["development", "research", "design", "tokens"], {
    required_error: "La categoría es requerida",
  }),
  scope: z.enum(["personal", "workspace", "client"]),
  icon: z.string().min(1, "El icono es requerido"),
});

const EMPTY_CLIENTS: any[] = [];

export function CreateKitDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const currentClient = useCurrentClient();
  const currentWorkspace = useCurrentWorkspace();
  const allClients = useSessionStore((state) => state.sessionData?.clients || EMPTY_CLIENTS);
  const [isLoading, setIsLoading] = useState(false);

  // Memoizar los valores efectivos para evitar re-renders infinitos
  const effectiveClient = useMemo(() => {
    return currentClient || allClients[0] || null;
  }, [currentClient, allClients]);

  const effectiveWorkspace = useMemo(() => {
    return currentWorkspace || effectiveClient?.workspaces?.[0] || null;
  }, [currentWorkspace, effectiveClient]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "development",
      scope: "workspace",
      icon: "Package",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Enviar siempre el contexto (workspace/client) incluso para kits personales
      // para que queden anclados a la ubicación donde se crearon.
      const payload = {
        ...values,
        clientId: effectiveClient?.id,
        workspaceId: effectiveWorkspace?.id,
      };

      const response = await apiFetch("/api/kit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse<Kit> = await response.json();

      if (data.success && data.data) {
        toast({
          title: "Kit creado",
          description: "El kit ha sido creado exitosamente.",
        });
        onOpenChange(false);
        form.reset();
        if (onSuccess) onSuccess();
        // Redirigir a la vista del kit
        router.push(`/kit/${data.data.id}`);
      } else {
        toast({
          title: "Error",
          description: data.error?.message || "Error al crear el kit",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating kit:", error);
      toast({
        title: "Error",
        description: "Error de conexión al crear el kit",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Crear nuevo Kit</DialogTitle>
          <DialogDescription>
            Crea un nuevo kit para organizar archivos y enlaces relacionados.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Kit de Componentes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="tokens">Tokens</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icono</FormLabel>
                    <FormControl>
                      <IconPicker value={field.value} onSelect={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el propósito de este kit..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Alcance y Visibilidad</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div>
                        <RadioGroupItem value="personal" id="personal" className="peer sr-only" />
                        <Label
                          htmlFor="personal"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <User className="mb-3 h-6 w-6" />
                          <span className="text-xs font-medium">Solo yo</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="workspace" id="workspace" className="peer sr-only" />
                        <Label
                          htmlFor="workspace"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <Users className="mb-3 h-6 w-6" />
                          <span className="text-xs font-medium">Equipo</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="client" id="client" className="peer sr-only" />
                        <Label
                          htmlFor="client"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <Building2 className="mb-3 h-6 w-6" />
                          <span className="text-xs font-medium">Empresa</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <div className="text-[11px] text-muted-foreground mt-2">
                    {field.value === "personal" && "Solo tú podrás ver este kit."}
                    {field.value === "workspace" &&
                      `Visible para todos los miembros de ${effectiveWorkspace?.name || "tu equipo"}.`}
                    {field.value === "client" &&
                      `Visible para todos los equipos de ${effectiveClient?.name || "tu empresa"}.`}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  (form.watch("scope") === "workspace" && !effectiveWorkspace) ||
                  (form.watch("scope") === "client" && !effectiveClient)
                }
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Kit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
