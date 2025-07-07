export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  roles: string[];
  order: number;
  tourStepSelector?: string;
}

export interface TourStep {
  target: string;
  content: React.ReactNode;
  title?: React.ReactNode;
  disableBeacon?: boolean;
}

export interface TourConfig {
  role: string;
  steps: TourStep[];
}
