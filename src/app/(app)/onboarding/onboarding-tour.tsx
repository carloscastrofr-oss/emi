"use client";

import React, { useEffect } from "react";
import Joyride, { CallBackProps, EVENTS, Step } from "react-joyride";
import { useAuth } from "@/hooks/use-auth";
import { ONBOARDING_TOURS, ONBOARDING_STEPS } from "@/lib/onboarding-data";
import { completeOnboardingStep } from "./actions";

interface OnboardingTourProps {
  run: boolean;
  setRun: (run: boolean) => void;
}

export function OnboardingTour({ run, setRun }: OnboardingTourProps) {
  const { userProfile } = useAuth();

  const tourSteps = React.useMemo(() => {
    const role = userProfile?.role || "viewer";
    const tourConfig =
      ONBOARDING_TOURS.find((t) => t.role === role) ??
      ONBOARDING_TOURS[ONBOARDING_TOURS.length - 1];
    return tourConfig?.steps.map((s) => ({ ...s, disableBeacon: true })) ?? [];
  }, [userProfile?.role]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { action, step, type } = data;

    if (([EVENTS.STEP_AFTER, EVENTS.TOUR_END] as string[]).includes(type)) {
      const stepId = ONBOARDING_STEPS.find((s) => s.tourStepSelector === step.target)?.id;

      if (stepId && userProfile && !userProfile.onboarding?.completed.includes(stepId)) {
        // Pasamos el UID del usuario a la acción del servidor
        await completeOnboardingStep(userProfile.uid, stepId);
      }
    }

    if (action === "close" || type === EVENTS.TOUR_END) {
      setRun(false);
    }
  };

  return (
    <Joyride
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
