/**
 * Tipos relacionados con autenticación, roles y control de sesión
 */

// =============================================================================
// ROLES
// =============================================================================

/**
 * Roles disponibles en el sistema (de menor a mayor nivel de acceso)
 */
export const roles = [
  "ux_ui_designer",
  "product_designer",
  "product_design_lead",
  "admin",
  "super_admin",
] as const;

export type Role = (typeof roles)[number];

// =============================================================================
// NAVEGACIÓN / TABS DEL SIDEBAR
// =============================================================================

/**
 * Identificadores de las tabs del menú lateral
 */
export const sidebarTabs = [
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
] as const;

export type SidebarTab = (typeof sidebarTabs)[number];

/**
 * Metadata de cada tab para renderizado
 */
export interface SidebarTabConfig {
  id: SidebarTab;
  href: string;
  label: string;
  icon: string;
  className?: string;
}

// =============================================================================
// PERMISOS
// =============================================================================

/**
 * Permisos granulares del sistema
 */
export const permissions = [
  // Tabs del sidebar (acceso a secciones)
  "tab:dashboard",
  "tab:kit",
  "tab:ai_writing",
  "tab:ai_flow",
  "tab:ai_toolkit",
  "tab:workbench",
  "tab:observer",
  "tab:risk",
  "tab:synthetic_users",
  "tab:strategy",
  "tab:changelog",
  "tab:labs",
  "tab:agent",
  "tab:onboarding",
  // Acciones de lectura
  "read:components",
  "read:analytics",
  "read:risks",
  "read:users",
  // Acciones de escritura
  "write:components",
  "write:experiments",
  "write:risks",
  // Gestión
  "manage:users",
  "manage:roles",
  "manage:settings",
  "manage:clients",
  // Admin
  "admin:all",
] as const;

export type Permission = (typeof permissions)[number];

// =============================================================================
// CLIENTE / WORKSPACE
// =============================================================================

/**
 * Información del cliente/organización actual
 */
export interface Client {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  plan?: "free" | "pro" | "enterprise";
  settings?: ClientSettings;
  createdAt?: Date;
}

export interface ClientSettings {
  allowedDomains?: string[];
  defaultRole?: Role;
  features?: string[];
  branding?: {
    primaryColor?: string;
    logoUrl?: string;
  };
}

// =============================================================================
// USUARIO DE SESIÓN
// =============================================================================

/**
 * Datos del usuario autenticado actualmente
 */
export interface SessionUser {
  // Identificación básica
  uid: string;
  email: string | null;
  displayName: string | null;
  photoUrl?: string | null;

  // Rol y permisos
  role: Role;
  permissions?: Permission[];

  // Contexto del cliente/workspace
  clientId?: string;
  clientRole?: Role;

  // Metadata
  emailVerified?: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;

  // Estado de onboarding/configuración
  onboarding?: {
    completed: string[];
    currentStep?: string;
  };

  // Preferencias del usuario
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  };
  defaultView?: string;
}

// =============================================================================
// CONTEXTO DE AUTENTICACIÓN
// =============================================================================

/**
 * Estado completo de autenticación
 */
export interface AuthState {
  isLoading: boolean;
  isInitialized: boolean;
  user: SessionUser | null;
  isAuthenticated: boolean;
  currentClient: Client | null;
  error?: AuthError | null;
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// =============================================================================
// COOKIES / TOKENS
// =============================================================================

/**
 * Estructura de datos para la cookie de sesión
 */
export interface SessionCookieData {
  uid: string;
  role: Role;
  clientId?: string;
  exp: number;
}

/**
 * Configuración de la cookie de sesión
 */
export interface SessionCookieConfig {
  name: string;
  maxAge: number;
  secure: boolean;
  httpOnly: boolean;
  sameSite: "strict" | "lax" | "none";
  path: string;
}
