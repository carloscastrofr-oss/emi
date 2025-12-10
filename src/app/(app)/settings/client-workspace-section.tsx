"use client";

import { useState, useEffect, useMemo } from "react";
import { Building2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSessionStore } from "@/stores/session-store";
import type { ClientWithWorkspaces, WorkspaceData } from "@/types/session";

export function ClientWorkspaceSection() {
  const sessionData = useSessionStore((state) => state.sessionData);
  const updateDefaults = useSessionStore((state) => state.updateDefaults);
  // Usar sessionData.clients directamente en lugar del getter allClients
  const allClients = sessionData?.clients || [];
  const fetchSession = useSessionStore((state) => state.fetchSession);
  const isSessionLoading = useSessionStore((state) => state.isLoading);

  // Cargar datos de sesión al montar si no están disponibles
  // Forzar recarga para asegurar que tenemos los datos más recientes
  useEffect(() => {
    // Forzar recarga al montar para obtener datos frescos de la DB
    fetchSession(true).catch((error) => {
      console.error("Error loading session data:", error);
    });
  }, [fetchSession]);

  // Estado local para los selectores (antes de aplicar)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Inicializar valores desde sessionData cuando esté disponible
  useEffect(() => {
    if (sessionData) {
      setSelectedClientId(sessionData.defaultClient);
      setSelectedWorkspaceId(sessionData.defaultWorkspace);
    }
  }, [sessionData]);

  // Obtener el cliente seleccionado
  const selectedClient = useMemo(() => {
    if (!selectedClientId || !allClients) {
      return null;
    }
    return allClients.find((c) => c.id === selectedClientId) || null;
  }, [selectedClientId, allClients]);

  // Obtener los workspaces del cliente seleccionado
  const availableWorkspaces = useMemo(() => {
    return selectedClient?.workspaces || [];
  }, [selectedClient]);

  // Verificar si hay cambios pendientes
  const hasChanges = useMemo(() => {
    if (!sessionData) return false;
    return (
      selectedClientId !== sessionData.defaultClient ||
      selectedWorkspaceId !== sessionData.defaultWorkspace
    );
  }, [sessionData, selectedClientId, selectedWorkspaceId]);

  // Resetear workspace cuando cambia el cliente
  useEffect(() => {
    if (selectedClient && availableWorkspaces.length > 0) {
      // Si el workspace actual no pertenece al nuevo cliente, usar el primero
      const currentWorkspaceExists = availableWorkspaces.some((w) => w.id === selectedWorkspaceId);
      if (!currentWorkspaceExists) {
        setSelectedWorkspaceId(availableWorkspaces[0]?.id || null);
      }
    } else {
      setSelectedWorkspaceId(null);
    }
  }, [selectedClient, availableWorkspaces, selectedWorkspaceId]);

  // Manejar cambio de cliente
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    setError(null);
    setSuccess(false);
  };

  // Manejar cambio de workspace
  const handleWorkspaceChange = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setError(null);
    setSuccess(false);
  };

  // Aplicar cambios
  const handleApply = async () => {
    if (!selectedClientId || !selectedWorkspaceId) {
      setError("Por favor selecciona un cliente y un workspace");
      return;
    }

    setIsUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      await updateDefaults(selectedClientId, selectedWorkspaceId);
      setSuccess(true);
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar los defaults";
      setError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  // Si está cargando datos de sesión, mostrar estado de carga
  if (isSessionLoading && !sessionData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Cliente y Workspace</CardTitle>
          </div>
          <CardDescription>Configura tu cliente y workspace por defecto.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Cargando datos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si no hay datos de sesión o clientes, mostrar mensaje
  if (!sessionData || allClients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Cliente y Workspace</CardTitle>
          </div>
          <CardDescription>Configura tu cliente y workspace por defecto.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {!sessionData
              ? "No se pudieron cargar los datos de sesión. Por favor, recarga la página."
              : "No hay clientes disponibles en este momento."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Cliente y Workspace</CardTitle>
        </div>
        <CardDescription>
          Selecciona el cliente y workspace que quieres usar por defecto al iniciar la aplicación.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selector de Cliente */}
        <div className="space-y-2">
          <Label htmlFor="client-select">Cliente</Label>
          <Select
            value={selectedClientId || ""}
            onValueChange={handleClientChange}
            disabled={isUpdating || isSessionLoading}
          >
            <SelectTrigger id="client-select">
              <SelectValue placeholder="Selecciona un cliente" />
            </SelectTrigger>
            <SelectContent>
              {allClients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selector de Workspace */}
        <div className="space-y-2">
          <Label htmlFor="workspace-select">Workspace</Label>
          <Select
            value={selectedWorkspaceId || ""}
            onValueChange={handleWorkspaceChange}
            disabled={
              isUpdating ||
              isSessionLoading ||
              !selectedClientId ||
              availableWorkspaces.length === 0
            }
          >
            <SelectTrigger id="workspace-select">
              <SelectValue
                placeholder={
                  !selectedClientId
                    ? "Selecciona un cliente primero"
                    : availableWorkspaces.length === 0
                      ? "No hay workspaces disponibles"
                      : "Selecciona un workspace"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableWorkspaces.map((workspace: WorkspaceData) => (
                <SelectItem key={workspace.id} value={workspace.id}>
                  {workspace.name}
                  {workspace.description && (
                    <span className="text-muted-foreground ml-2">- {workspace.description}</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Cliente y workspace actualizados exitosamente.</AlertDescription>
          </Alert>
        )}

        {/* Botón Aplicar */}
        <Button
          onClick={handleApply}
          disabled={
            !hasChanges ||
            isUpdating ||
            isSessionLoading ||
            !selectedClientId ||
            !selectedWorkspaceId
          }
          className="w-full"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Aplicando...
            </>
          ) : (
            "Aplicar cambios"
          )}
        </Button>

        {/* Información adicional */}
        {!hasChanges && selectedClientId && selectedWorkspaceId && (
          <p className="text-xs text-muted-foreground text-center">
            Estos son tus valores actuales. Selecciona otros para cambiarlos.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
