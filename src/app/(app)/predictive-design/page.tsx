import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';

export default function PredictiveDesignPage() {

  return (
    <div className="space-y-8">
      <PageHeader
        title="Predictive Design (α)"
        description="Anticipa journeys y wireframes con IA a partir del planning trimestral."
      />
      
      <Card className="rounded-expressive border-dashed min-h-[400px] flex items-center justify-center">
          <div className="text-center text-muted-foreground p-8">
              <Wand2 className="mx-auto h-12 w-12 opacity-50 mb-4" />
              <h3 className="font-semibold text-lg text-foreground">Función en Desarrollo</h3>
              <p>El agente de Predictive Design está siendo mejorado. Vuelve pronto.</p>
          </div>
      </Card>
    </div>
  );
}
