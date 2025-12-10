/**
 * Tipos relacionados con datos de sesión del usuario
 * Incluye clientes, workspaces y configuraciones de sesión
 */

import type { Role, Client, UserPreferences } from "./auth";

// =============================================================================
// WORKSPACE
// =============================================================================

/**
 * Configuraciones de un workspace
 */
export interface WorkspaceSettings {
  features?: string[];
  branding?: {
    primaryColor?: string;
    logoUrl?: string;
  };
  [key: string]: unknown;
}

/**
 * Datos de un workspace para sesión
 */
export interface WorkspaceData {
  id: string;
  clientId: string;
  name: string;
  slug: string;
  description?: string | null;
  settings?: WorkspaceSettings | null;
  createdAt: Date;
}

// =============================================================================
// CLIENT WITH WORKSPACES
// =============================================================================

/**
 * Cliente con sus workspaces anidados
 */
export interface ClientWithWorkspaces extends Client {
  workspaces: WorkspaceData[];
}

// =============================================================================
// SESSION DATA
// =============================================================================

/**
 * Datos del usuario para la sesión
 */
export interface SessionUserData {
  id: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  role: Role;
  preferences: UserPreferences | null;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

/**
 * Respuesta completa del endpoint de sesión
 */
export interface SessionData {
  user: SessionUserData;
  clients: ClientWithWorkspaces[];
  defaultClient: string | null;
  defaultWorkspace: string | null;
  config?: {
    permissions?: string[];
    [key: string]: unknown;
  };
}

// =============================================================================
// SESSION STORE STATE
// =============================================================================

/**
 * Estado del store de sesión
 */
export interface SessionState {
  sessionData: SessionData | null;
  isLoading: boolean;
  error: string | null;
}
