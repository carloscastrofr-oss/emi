import type { OnboardingStep, TourConfig } from "@/types/onboarding";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "view_dashboard",
    title: "Explora el Panel de Métricas",
    description: "Familiarízate con los KPIs del sistema de diseño.",
    roles: ["viewer", "producer", "core", "admin"],
    order: 1,
    tourStepSelector: ".dashboard-header",
  },
  {
    id: "download_kit",
    title: "Descarga tu primer Kit",
    description: "Visita la sección de Kits y descarga un paquete de inicio.",
    roles: ["producer", "core", "admin"],
    order: 2,
    tourStepSelector: ".kit-page-link",
  },
  {
    id: "run_agent",
    title: "Ejecuta un Agente de IA",
    description: "Activa un agente para analizar tu sistema de diseño.",
    roles: ["core", "admin"],
    order: 4,
    tourStepSelector: ".agent-page-link",
  },
];

export const ONBOARDING_TOURS: TourConfig[] = [
  {
    role: "admin",
    steps: [
      {
        target: ".dashboard-header",
        content: "Este es el Panel, tu centro de mando para métricas del sistema de diseño.",
        title: "Bienvenido al Panel",
      },
      {
        target: ".kit-page-link",
        content: "Aquí puedes encontrar y descargar kits de inicio para acelerar tus proyectos.",
        title: "Sección de Kits",
      },
      {
        target: ".agent-page-link",
        content: "Ejecuta agentes de IA para obtener análisis y recomendaciones automáticas.",
        title: "Suite de Agentes",
      },
      {
        target: ".onboarding-page-checklist",
        content: "Puedes seguir tu progreso aquí. ¡Completa todos los pasos para dominar DesignOS!",
        title: "Tu Lista de Tareas",
      },
    ],
  },
  {
    role: "producer",
    steps: [
      {
        target: ".dashboard-header",
        content: "Este es el Panel, tu centro de mando para métricas del sistema de diseño.",
        title: "Bienvenido al Panel",
      },
      {
        target: ".kit-page-link",
        content: "Aquí puedes encontrar y descargar kits de inicio para acelerar tus proyectos.",
        title: "Sección de Kits",
      },
      {
        target: ".onboarding-page-checklist",
        content: "Puedes seguir tu progreso aquí. ¡Completa todos los pasos para dominar DesignOS!",
        title: "Tu Lista de Tareas",
      },
    ],
  },
  {
    role: "viewer",
    steps: [
      {
        target: ".dashboard-header",
        content: "Este es el Panel, tu centro de mando para métricas del sistema de diseño.",
        title: "Bienvenido al Panel",
      },
      {
        target: ".kit-page-link",
        content: "Aquí puedes encontrar y descargar kits de inicio para acelerar tus proyectos.",
        title: "Sección de Kits",
      },
      {
        target: ".onboarding-page-checklist",
        content: "Puedes seguir tu progreso aquí. ¡Completa todos los pasos para dominar DesignOS!",
        title: "Tu Lista de Tareas",
      },
    ],
  },
];
