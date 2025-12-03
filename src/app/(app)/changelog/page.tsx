import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const changelog = [
  {
    version: "v2.1.0",
    date: "2024-05-15",
    changes: [
      { type: "Añadido", text: "Nuevo componente 'AvatarGroup'." },
      { type: "Corregido", text: "Comportamiento responsivo mejorado del componente 'Table'." },
      { type: "Mejorado", text: "Estilos de foco actualizados para mejor accesibilidad." },
    ],
  },
  {
    version: "v2.0.0",
    date: "2024-04-20",
    changes: [
      { type: "Breaking", text: "Se ha revisado todo el sistema de tokens de color." },
      { type: "Añadido", text: "Soporte para modo oscuro en todos los componentes." },
      { type: "Mejorado", text: "Mejoras de rendimiento para el componente 'Select'." },
    ],
  },
];

const badgeVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Añadido: "default",
  Corregido: "secondary",
  Mejorado: "outline",
  Breaking: "destructive",
};

export default function ChangelogPage() {
  return (
    <div>
      <PageHeader
        title="Changelog"
        description="Notas de lanzamiento y actualizaciones para el sistema de diseño."
      />
      <Card>
        <CardHeader>
          <CardTitle>Historial de Cambios</CardTitle>
          <CardDescription>
            Notas de lanzamiento y actualizaciones para el sistema de diseño.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {changelog.map((release) => (
              <div key={release.version}>
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold">{release.version}</h3>
                  <span className="text-sm text-muted-foreground">{release.date}</span>
                </div>
                <ul className="mt-4 list-none space-y-2 pl-2">
                  {release.changes.map((change) => (
                    <li key={change.text} className="flex items-center gap-3">
                      <Badge variant={badgeVariant[change.type]}>{change.type}</Badge>
                      <span>{change.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
