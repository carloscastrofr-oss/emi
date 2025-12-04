/**
 * Configuración de autenticación, roles y navegación
 */

import type { Role, SidebarTab, SidebarTabConfig, SessionCookieConfig } from "@/types/auth";

// =============================================================================
// CONFIGURACIÓN DE ROLES
// =============================================================================

/**
 * Labels legibles para mostrar en UI
 */
export const roleLabels: Record<Role, string> = {
  ux_ui_designer: "UX/UI Designer",
  product_designer: "Product Designer",
  product_design_lead: "Product Design Lead",
  admin: "Admin",
  super_admin: "Super Admin",
};

/**
 * Jerarquía de roles para comparaciones (mayor número = más permisos)
 */
export const roleHierarchy: Record<Role, number> = {
  ux_ui_designer: 0,
  product_designer: 1,
  product_design_lead: 2,
  admin: 3,
  super_admin: 4,
};

// =============================================================================
// CONFIGURACIÓN DE TABS DEL SIDEBAR
// =============================================================================

/**
 * Configuración de tabs del sidebar
 */
export const sidebarTabsConfig: SidebarTabConfig[] = [
  {
    id: "dashboard",
    href: "/dashboard",
    label: "Panel",
    icon: "LayoutDashboard",
    className: "dashboard-page-link",
  },
  {
    id: "kit",
    href: "/kit",
    label: "Kit",
    icon: "Package",
    className: "kit-page-link",
  },
  {
    id: "ai_writing",
    href: "/ai-writing",
    label: "AI Writing",
    icon: "PenSquare",
    className: "content-page-link",
  },
  {
    id: "ai_flow",
    href: "/ai-flow",
    label: "AI Flow",
    icon: "Workflow",
    className: "ai-flow-page-link",
  },
  {
    id: "ai_toolkit",
    href: "/ai-toolkit",
    label: "AI Toolkit",
    icon: "Sparkles",
    className: "ai-toolkit-page-link",
  },
  {
    id: "workbench",
    href: "/workbench",
    label: "Workbench",
    icon: "KanbanSquare",
    className: "workbench-page-link",
  },
  {
    id: "observer",
    href: "/observer",
    label: "Observer",
    icon: "View",
    className: "observer-page-link",
  },
  {
    id: "risk",
    href: "/risk",
    label: "Riesgos",
    icon: "ShieldAlert",
    className: "risk-page-link",
  },
  {
    id: "synthetic_users",
    href: "/synthetic-users",
    label: "SynthUsers",
    icon: "Users",
    className: "synthetic-users-page-link",
  },
  {
    id: "strategy",
    href: "/strategy",
    label: "Strategy",
    icon: "Target",
    className: "strategy-page-link",
  },
  {
    id: "changelog",
    href: "/changelog",
    label: "Changelog",
    icon: "ClipboardList",
    className: "changelog-page-link",
  },
  {
    id: "labs",
    href: "/labs",
    label: "Labs",
    icon: "Beaker",
    className: "labs-page-link",
  },
  {
    id: "agent",
    href: "/agent",
    label: "Agent",
    icon: "Bot",
    className: "agent-page-link",
  },
  {
    id: "onboarding",
    href: "/onboarding",
    label: "Onboarding",
    icon: "BookUser",
    className: "onboarding-page-link",
  },
];

// =============================================================================
// PERMISOS POR ROL
// =============================================================================

/**
 * Permisos de acceso a tabs del sidebar por rol
 */
export const tabPermissionsByRole: Record<Role, SidebarTab[]> = {
  // UX/UI Designer
  ux_ui_designer: ["kit", "ai_writing", "ai_flow", "workbench", "strategy"],

  // Product Designer
  product_designer: ["kit", "ai_writing", "ai_flow", "workbench", "strategy"],

  // Product Design Lead
  product_design_lead: ["kit", "ai_writing", "ai_flow", "workbench", "strategy"],

  // Admin: acceso completo
  admin: [
    "dashboard",
    "kit",
    "ai_writing",
    "ai_flow",
    "ai_toolkit",
    "workbench",
    "observer",
    "risk",
    "synthetic_users",
    "strategy",
    "changelog",
    "labs",
    "agent",
    "onboarding",
  ],

  // Super Admin: acceso total
  super_admin: [
    "dashboard",
    "kit",
    "ai_writing",
    "ai_flow",
    "ai_toolkit",
    "workbench",
    "observer",
    "risk",
    "synthetic_users",
    "strategy",
    "changelog",
    "labs",
    "agent",
    "onboarding",
  ],
};

// =============================================================================
// CONFIGURACIÓN DE COOKIES
// =============================================================================

/**
 * Configuración por defecto de la cookie de sesión
 */
export const defaultSessionCookieConfig: SessionCookieConfig = {
  name: "emi_session",
  maxAge: 60 * 60 * 24 * 7, // 7 días
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  sameSite: "lax",
  path: "/",
};
