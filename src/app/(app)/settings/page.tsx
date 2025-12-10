"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Shield, Globe, Database, Keyboard } from "lucide-react";
import { AppearanceSection } from "./appearance-section";
import { ClientWorkspaceSection } from "./client-workspace-section";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Configuración"
        description="Gestiona tus preferencias y ajustes de la aplicación."
      />

      <div className="space-y-6">
        {/* Apariencia */}
        <AppearanceSection />

        {/* Cliente y Workspace */}
        <ClientWorkspaceSection />

        {/* Notificaciones - Placeholder para futuro */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Notificaciones</CardTitle>
            </div>
            <CardDescription>Configura cómo y cuándo recibes notificaciones.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Esta sección estará disponible próximamente.
            </p>
          </CardContent>
        </Card>

        {/* Privacidad y Seguridad - Placeholder para futuro */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Privacidad y Seguridad</CardTitle>
            </div>
            <CardDescription>Gestiona tu privacidad y configuración de seguridad.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Esta sección estará disponible próximamente.
            </p>
          </CardContent>
        </Card>

        {/* Idioma y Región - Placeholder para futuro */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Idioma y Región</CardTitle>
            </div>
            <CardDescription>
              Selecciona tu idioma preferido y configuración regional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Esta sección estará disponible próximamente.
            </p>
          </CardContent>
        </Card>

        {/* Datos y Almacenamiento - Placeholder para futuro */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Datos y Almacenamiento</CardTitle>
            </div>
            <CardDescription>Gestiona tus datos locales y configuración de caché.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Esta sección estará disponible próximamente.
            </p>
          </CardContent>
        </Card>

        {/* Atajos de Teclado - Placeholder para futuro */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Atajos de Teclado</CardTitle>
            </div>
            <CardDescription>Personaliza los atajos de teclado de la aplicación.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Esta sección estará disponible próximamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
