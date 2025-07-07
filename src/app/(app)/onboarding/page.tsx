
'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, PlayCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ONBOARDING_STEPS } from '@/lib/onboarding-data';
import { OnboardingTour } from './onboarding-tour';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function OnboardingPage() {
  const { userProfile } = useAuth();
  const [isTourRunning, setTourRunning] = useState(false);

  const userRole = userProfile?.role || 'viewer';
  const completedSteps = userProfile?.onboarding?.completed || [];

  const relevantSteps = useMemo(() => {
    return ONBOARDING_STEPS.filter(step => step.roles.includes(userRole)).sort((a, b) => a.order - b.order);
  }, [userRole]);

  const completedCount = useMemo(() => {
    return relevantSteps.filter(step => completedSteps.includes(step.id)).length;
  }, [relevantSteps, completedSteps]);

  const progressPercentage = relevantSteps.length > 0 ? (completedCount / relevantSteps.length) * 100 : 0;
  
  const handleStartTour = () => {
    setTourRunning(true);
  };

  return (
    <div>
      <PageHeader
        title="Bienvenido a DesignOS"
        description="Completa estos pasos para familiarizarte con la plataforma."
      />
      
      <Card className="mb-8 rounded-expressive onboarding-page-checklist">
        <CardHeader>
          <CardTitle>Tu Progreso de Inducción</CardTitle>
          <CardDescription>
            Has completado {completedCount} de {relevantSteps.length} pasos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="mb-6 h-3" />
          <div className="space-y-4">
            {relevantSteps.map(step => {
              const isCompleted = completedSteps.includes(step.id);
              return (
                <motion.div
                  key={step.id}
                  className={cn(
                    "flex items-start gap-4 rounded-lg border p-4 transition-colors",
                    isCompleted ? 'bg-primary/10 border-primary/20' : 'bg-muted/50'
                  )}
                  whileHover={{ scale: 1.02 }}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6 flex-shrink-0 text-primary" />
                  ) : (
                    <Circle className="h-6 w-6 flex-shrink-0 text-muted-foreground" />
                  )}
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleStartTour} disabled={isTourRunning}>
                <PlayCircle className="mr-2 h-4 w-4" />
                {isTourRunning ? 'Tour en progreso...' : 'Iniciar Tour Interactivo'}
            </Button>
        </CardFooter>
      </Card>

      <OnboardingTour
        run={isTourRunning}
        setRun={setTourRunning}
      />
    </div>
  );
}
