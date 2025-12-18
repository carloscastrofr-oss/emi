"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { ONBOARDING_TOURS, ONBOARDING_STEPS } from "@/lib/onboarding-data";
import { completeOnboardingStep } from "./actions";

// Tipo para el callback (evitar importar tipos de react-joyride en build)
type JoyrideCallback = (data: { action: string; step: { target: string }; type: string }) => void;

interface OnboardingTourProps {
  run: boolean;
  setRun: (run: boolean) => void;
}

export function OnboardingTour({ run, setRun }: OnboardingTourProps) {
  const user = useAuthStore((state) => state.user);
  const [JoyrideComponent, setJoyrideComponent] = useState<React.ComponentType<any> | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  // Cargar react-joyride solo en cliente y solo cuando sea necesario
  // NOTA: react-joyride tiene problemas de compatibilidad con React 18
  // Este componente es opcional y no bloqueará el build si react-joyride no está disponible
  useEffect(() => {
    if (typeof window === "undefined" || !run) {
      return;
    }

    // Intentar cargar react-joyride solo en runtime
    // NOTA: react-joyride tiene problemas de compatibilidad con React 18
    // Temporalmente removido del package.json hasta que haya una versión compatible
    // Si no está disponible, el componente simplemente no se renderiza
    const loadJoyride = async () => {
      try {
        // Usar una técnica que TypeScript no pueda analizar estáticamente
        // Import dinámico de react-joyride que puede no estar instalado
        const moduleName = "react-joyride";
        const joyrideModule = await import(moduleName);

        if (joyrideModule?.default) {
          setJoyrideComponent(() => joyrideModule.default);
          setIsAvailable(true);
        }
      } catch (error) {
        // react-joyride no está disponible - esto es OK, el componente es opcional
        setIsAvailable(false);
        setRun(false); // Detener el tour si no está disponible
      }
    };

    loadJoyride();
  }, [run, setRun]);

  const tourSteps = React.useMemo(() => {
    // Usar el último tour config como default (más completo)
    const tourConfig = ONBOARDING_TOURS[ONBOARDING_TOURS.length - 1];
    return tourConfig?.steps.map((s) => ({ ...s, disableBeacon: true })) ?? [];
  }, []);

  const handleJoyrideCallback: JoyrideCallback = async (data) => {
    const { action, step, type } = data;

    // EVENTS.STEP_AFTER y EVENTS.TOUR_END como strings
    if (type === "step:after" || type === "tour:end") {
      const stepId = ONBOARDING_STEPS.find((s) => s.tourStepSelector === step.target)?.id;

      if (stepId && user && !user.onboarding?.completed.includes(stepId)) {
        await completeOnboardingStep(user.uid, stepId);
      }
    }

    if (action === "close" || type === "tour:end") {
      setRun(false);
    }
  };

  // No renderizar nada si no está en cliente, no está disponible, o no está corriendo
  if (typeof window === "undefined" || !isAvailable || !JoyrideComponent || !run) {
    return null;
  }

  return (
    <JoyrideComponent
      callback={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={tourSteps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "hsl(var(--primary))",
          arrowColor: "hsl(var(--card))",
          backgroundColor: "hsl(var(--card))",
          textColor: "hsl(var(--card-foreground))",
        },
        buttonClose: {
          color: "hsl(var(--muted-foreground))",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
        },
        buttonBack: {
          color: "hsl(var(--primary))",
        },
      }}
    />
  );
}
