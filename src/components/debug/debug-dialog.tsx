"use client";

import { Bug, Monitor, User, RefreshCw, Server } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  useDebugStore,
  useDebugDialogOpen,
  useDebugEnvironment,
  useDebugRole,
  useDebugDevApi,
  environments,
  type Environment,
} from "@/stores/debug-store";
import { roles } from "@/types/auth";
import { roleLabels } from "@/config/auth";
import type { Role } from "@/types/auth";

/**
 * Dialog de configuración de herramientas de debugging
 */
export function DebugDialog() {
  const isOpen = useDebugDialogOpen();
  const environment = useDebugEnvironment();
  const selectedRole = useDebugRole();
  const devApi = useDebugDevApi();
  const { closeDialog, setEnvironment, setSelectedRole, setDevApi } = useDebugStore();

  const handleEnvironmentChange = (value: string) => {
    setEnvironment(value as Environment);
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value as Role);
  };

  // Labels para environments
  const envLabels: Record<Environment, { label: string; color: string }> = {
    DEV: { label: "Development", color: "bg-blue-500" },
    QA: { label: "Quality Assurance", color: "bg-amber-500" },
    PROD: { label: "Production", color: "bg-green-500" },
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-md backdrop-blur-sm bg-background/95">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debugging Tools
          </DialogTitle>
          <DialogDescription>Configura el entorno de desarrollo y pruebas.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Environment Selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Monitor className="h-4 w-4" />
              Environment
            </Label>
            <Select value={environment} onValueChange={handleEnvironmentChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {environments.map((env) => (
                  <SelectItem key={env} value={env}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${envLabels[env].color}`} />
                      <span>{env}</span>
                      <span className="text-muted-foreground text-xs">
                        ({envLabels[env].label})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Cambia el entorno de la aplicación. Esto recargará la página.
            </p>
          </div>

          <Separator />

          {/* Role Selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              Rol de Usuario
            </Label>
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {roleLabels[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Simula un usuario con este rol. Esto recargará la página.
            </p>
          </div>

          <Separator />

          {/* Dev API Mode */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Server className="h-4 w-4" />
                Modo Dev API
              </Label>
              <Switch checked={devApi} onCheckedChange={setDevApi} />
            </div>
            <p className="text-xs text-muted-foreground">
              Activa delay de 2s en las APIs para simular latencia de red. Usa datos mock.
            </p>
            {devApi && (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 border-amber-500/30"
              >
                Delay activo: 2000ms
              </Badge>
            )}
          </div>
        </div>

        {/* Footer con estado actual */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={envLabels[environment].color + " text-white"}>
              {environment}
            </Badge>
            <Badge variant="secondary">{roleLabels[selectedRole]}</Badge>
            {devApi && (
              <Badge variant="outline" className="text-amber-600">
                Dev API
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recargar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
