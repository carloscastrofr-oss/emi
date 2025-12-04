"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { db, isFirebaseConfigValid } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

import type { ComponentRequest, RequestStatus, RequestPriority } from "@/types/component-request";
import { requestPriorities } from "@/types/component-request";
import { submitComponentRequest } from "./request-actions";
import { PlusCircle, Loader2 } from "lucide-react";

const newRequestSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  priority: z.enum(requestPriorities, { required_error: "La prioridad es requerida." }),
  figmaFileUrl: z.string().url("Debe ser una URL de Figma válida.").optional().or(z.literal("")),
  jiraIssue: z.string().optional(),
});

function NewRequestDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof newRequestSchema>>({
    resolver: zodResolver(newRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Media",
      figmaFileUrl: "",
      jiraIssue: "",
    },
  });

  async function onSubmit(values: z.infer<typeof newRequestSchema>) {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una solicitud.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    // We are omitting jiraIssue from the payload for now as it's not in the server action type.
    const { jiraIssue, figmaFileUrl, ...restPayload } = values;
    const result = await submitComponentRequest({
      ...restPayload,
      figmaFileUrl: figmaFileUrl || null,
      requesterUid: user.uid,
    });
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Solicitud Creada",
        description: "Tu solicitud de componente ha sido enviada.",
      });
      if (jiraIssue) {
        toast({ title: "Info Jira", description: `Se ha anotado el ticket: ${jiraIssue}` });
      }
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
          <DialogTitle>Nueva Solicitud de Componente</DialogTitle>
          <DialogDescription>
            Describe el componente que necesitas. El equipo de Diseño lo revisará.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Componente DatePicker" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el caso de uso, requerimientos y comportamiento esperado."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridad</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {requestPriorities.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="figmaFileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link a Figma (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://figma.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jiraIssue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket de Jira (Opcional)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Ej: DS-123" {...field} />
                    </FormControl>
                    <Button type="button" variant="secondary">
                      Agregar
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Solicitud
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function RequestsTab() {
  const [requests, setRequests] = useState<ComponentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigValid) {
      console.warn("Firebase no configurado, usando datos de demostración para Solicitudes.");
      // Dummy data for demo purposes
      setRequests([
        {
          id: "demo1",
          title: "DatePicker (mandatory)",
          description: "Componente accesible con rango y single date",
          priority: "Alta",
          requesterUid: "designer123",
          status: "En Revisión",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          championUid: "core456",
          figmaFileUrl: "https://figma.com",
          history: [
            { status: "Solicitado", byUid: "designer123", at: Timestamp.now() },
            { status: "En Revisión", byUid: "core456", at: Timestamp.now() },
          ],
        },
        {
          id: "demo2",
          title: "Nuevo componente de Alerta",
          description: "Una alerta para notificaciones importantes.",
          priority: "Media",
          requesterUid: "dev789",
          status: "Solicitado",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          championUid: null,
          figmaFileUrl: null,
          history: [{ status: "Solicitado", byUid: "dev789", at: Timestamp.now() }],
        },
      ]);
      setIsLoading(false);
      return;
    }

    const q = query(collection(db, "componentRequests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const newRequests = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as ComponentRequest
        );
        setRequests(newRequests);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error al obtener solicitudes: ", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getStatusVariant = (
    status: RequestStatus
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Rechazado":
        return "destructive";
      case "Listo":
        return "default";
      case "En Revisión":
      case "En Desarrollo":
        return "secondary";
      case "Solicitado":
      case "QA / A11y":
        return "outline";
      default:
        return "default";
    }
  };

  const getPriorityVariant = (
    priority: RequestPriority
  ): "destructive" | "secondary" | "outline" => {
    switch (priority) {
      case "Alta":
        return "destructive";
      case "Media":
        return "secondary";
      case "Baja":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Card className="rounded-expressive">
      <NewRequestDialog open={isDialogOpen} onOpenChange={setDialogOpen} />
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Solicitudes de Componentes</CardTitle>
            <CardDescription>
              Pipeline de nuevas propuestas de componentes y mejoras.
            </CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Solicitud
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Champion</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-28" />
                  </TableCell>
                </TableRow>
              ))
            ) : requests.length > 0 ? (
              requests.map((req) => (
                <motion.tr
                  key={req.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{req.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(req.status)}
                      className={req.status === "Listo" ? "bg-green-600 text-white" : ""}
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(req.priority)}>{req.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={`https://placehold.co/40x40.png`}
                          alt={req.requesterUid}
                          data-ai-hint="person avatar"
                        />
                        <AvatarFallback>{req.requesterUid.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{req.requesterUid}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {req.championUid ? (
                      <div className="flex items-center gap-2 text-xs">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={`https://placehold.co/40x40.png`}
                            alt={req.championUid}
                            data-ai-hint="person avatar"
                          />
                          <AvatarFallback>{req.championUid.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{req.championUid}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {req.createdAt?.toDate().toLocaleDateString()}
                  </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No hay solicitudes. ¡Crea la primera!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
