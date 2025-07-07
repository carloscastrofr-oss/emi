import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { View } from "lucide-react";

export default function ObserverPage() {
  return (
    <div>
      <PageHeader
        title="Observer"
        description="Visualiza la interacción del usuario y la adopción de componentes."
      />
      <Card className="rounded-expressive">
        <CardHeader className="flex flex-row items-center gap-4">
          <View className="h-8 w-8 text-primary" />
          <CardTitle>Mapa de Calor de Interacción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">Próximamente: Mapa de calor del componente...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
