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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Link as LinkIcon } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-utils";
import type { KitItem } from "@/types/kit";
import { uploadFile, generateKitFilePath } from "@/lib/firebase-storage";
import { useSessionData } from "@/stores/session-store";

const fileSchema = z.object({
  type: z.literal("file"),
  title: z.string().min(1, "El título es requerido"),
  file: z.instanceof(File, { message: "Debes seleccionar un archivo" }),
});

const linkSchema = z.object({
  type: z.literal("link"),
  title: z.string().min(1, "El título es requerido"),
  url: z.string().url("La URL es inválida"),
  description: z.string().optional(),
});

type FileFormData = z.infer<typeof fileSchema>;
type LinkFormData = z.infer<typeof linkSchema>;

export function AddItemDialog({
  open,
  onOpenChange,
  kitId,
  onItemAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kitId: string;
  onItemAdded: () => void;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"file" | "link">("file");
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const sessionData = useSessionData();
  const userEmail = sessionData?.user?.email || "";

  const fileForm = useForm<FileFormData>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      type: "file",
      title: "",
    },
  });

  const linkForm = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      type: "link",
      title: "",
      url: "",
      description: "",
    },
  });

  async function handleFileSubmit(values: FileFormData) {
    setIsLoading(true);
    try {
      // Subir archivo a Firebase Storage
      const filePath = generateKitFilePath(kitId, values.file.name);
      const { url, size, mimeType } = await uploadFile(values.file, filePath);

      // Crear registro en la base de datos
      const payload = {
        type: "file",
        title: values.title,
        name: values.file.name,
        fileUrl: url,
        fileSize: size,
        mimeType,
        uploadedBy: userEmail,
      };

      const response = await apiFetch(`/api/kit/${kitId}/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse<KitItem> = await response.json();

      if (data.success && data.data) {
        toast({
          title: "Archivo agregado",
          description: "El archivo ha sido agregado exitosamente.",
        });
        onOpenChange(false);
        fileForm.reset();
        setSelectedFileName("");
        onItemAdded();
      } else {
        toast({
          title: "Error",
          description: data.error?.message || "Error al agregar el archivo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding file:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al subir el archivo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLinkSubmit(values: LinkFormData) {
    setIsLoading(true);
    try {
      const response = await apiFetch(`/api/kit/${kitId}/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "link",
          title: values.title,
          url: values.url,
          description: values.description,
          createdBy: userEmail,
        }),
      });

      const data: ApiResponse<KitItem> = await response.json();

      if (data.success && data.data) {
        toast({
          title: "Enlace agregado",
          description: "El enlace ha sido agregado exitosamente.",
        });
        onOpenChange(false);
        linkForm.reset();
        onItemAdded();
      } else {
        toast({
          title: "Error",
          description: data.error?.message || "Error al agregar el enlace",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding link:", error);
      toast({
        title: "Error",
        description: "Error de conexión al agregar el enlace",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar al Kit</DialogTitle>
          <DialogDescription>Agrega un archivo o enlace a este kit.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "file" | "link")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">
              <Upload className="mr-2 h-4 w-4" />
              Archivo
            </TabsTrigger>
            <TabsTrigger value="link">
              <LinkIcon className="mr-2 h-4 w-4" />
              Enlace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file">
            <Form {...fileForm}>
              <form onSubmit={fileForm.handleSubmit(handleFileSubmit)} className="space-y-4">
                <FormField
                  control={fileForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Documentación del proyecto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={fileForm.control}
                  name="file"
                  render={({ field: { value: _value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Archivo</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          {...field}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onChange(file);
                              setSelectedFileName(file.name);
                              // Auto-completar título si está vacío
                              if (!fileForm.getValues("title")) {
                                fileForm.setValue("title", file.name.replace(/\.[^/.]+$/, ""));
                              }
                            }
                          }}
                        />
                      </FormControl>
                      {selectedFileName && (
                        <p className="text-sm text-muted-foreground">
                          Archivo seleccionado: {selectedFileName}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Agregar Archivo
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="link">
            <Form {...linkForm}>
              <form onSubmit={linkForm.handleSubmit(handleLinkSubmit)} className="space-y-4">
                <FormField
                  control={linkForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Documentación del proyecto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={linkForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={linkForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción del enlace..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Agregar Enlace
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
