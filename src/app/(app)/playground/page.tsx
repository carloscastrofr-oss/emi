import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Beaker } from "lucide-react";

export default function PlaygroundPage() {
  return (
    <div>
      <PageHeader
        title="Playground"
        description="Experimenta con tokens de diseño y temas en tiempo real."
      />
      <Card className="rounded-expressive">
        <CardHeader className="flex flex-row items-center gap-4">
          <Beaker className="h-8 w-8 text-primary" />
          <CardTitle>Cambiador de Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">Próximamente: Sandbox de tokens de diseño...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
