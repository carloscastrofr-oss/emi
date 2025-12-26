/**
 * Store de debugging con persistencia
 * Este store persiste en localStorage para mantener la configuración entre sesiones
 * Se sincroniza con el ambiente real detectado desde las variables de entorno
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Role } from "@/types/auth";

// =============================================================================
// TIPOS
// =============================================================================

export const environments = ["DEV", "QA", "PROD"] as const;
export type Environment = (typeof environments)[number];

interface DebugState {
  // Configuración de debugging
  environment: Environment;
  selectedRole: Role;

  // Modo dev API (simula delays y usa mocks)
  devApi: boolean;

  // Ambiente real detectado desde variables de entorno (solo lectura)
  // Se establece desde el servidor mediante un script inyectado
  detectedEnvironment: Environment;

  // Override de rol para UI (solo para desarrollo/testing)
  // NOTA: Esto solo afecta la UI del store, NO afecta cookies ni middleware
  // El middleware y las cookies SIEMPRE usan el rol real de la BD
  useRoleOverride: boolean;
  overrideRole: Role | null;

  // UI state (no persiste)
  isDialogOpen: boolean;
}

interface DebugActions {
  // Setters
  setEnvironment: (env: Environment) => void;
  setSelectedRole: (role: Role) => void;
  setDevApi: (enabled: boolean) => void;
  toggleDevApi: () => void;
  setDetectedEnvironment: (env: Environment) => void;

  // Role override (solo para UI, no afecta seguridad)
  setUseRoleOverride: (enabled: boolean) => void;
  setOverrideRole: (role: Role | null) => void;

  // Dialog
  openDialog: () => void;
  closeDialog: () => void;
  toggleDialog: () => void;
}

type DebugStore = DebugState & DebugActions;

// =============================================================================
// HELPER PARA OBTENER AMBIENTE DETECTADO
// =============================================================================

/**
 * Obtiene el ambiente detectado desde el cliente
 * Se establece mediante un script inyectado desde el servidor
 */
function getDetectedEnvironmentFromClient(): Environment {
  if (typeof window === "undefined") {
    return "DEV";
  }
  // Leer desde variable global inyectada por el servidor
  return (window as any).__ENV__?.environment || "DEV";
}

// =============================================================================
// STORE CON PERSISTENCIA
// =============================================================================

export const useDebugStore = create<DebugStore>()(
  persist(
    (set, get) => {
      const detectedEnv = getDetectedEnvironmentFromClient();

      return {
        // Estado inicial - sincronizado con el ambiente real
        environment: detectedEnv,
        detectedEnvironment: detectedEnv,
        selectedRole: "product_designer",
        devApi: false, // Por defecto desactivado para facilitar pruebas
        useRoleOverride: false, // Por defecto desactivado - override solo para UI
        overrideRole: null,
        isDialogOpen: false,

        // Setters con recarga de página
        // NOTA: En producción, cambiar el ambiente desde aquí no tiene efecto
        // El ambiente real se determina desde las variables de entorno
        setEnvironment: (environment) => {
          // Solo permitir cambiar el ambiente en desarrollo/QA
          const currentDetected = get().detectedEnvironment;
          if (currentDetected === "PROD" && environment !== "PROD") {
            console.warn(
              "No se puede cambiar el ambiente en producción. El ambiente se determina desde las variables de entorno."
            );
            return;
          }
          set({ environment });
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        },

        setSelectedRole: (selectedRole) => {
          set({ selectedRole });
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        },

        // Dev API toggle (sin recarga)
        setDevApi: (devApi) => {
          set({ devApi });
        },

        toggleDevApi: () => {
          set({ devApi: !get().devApi });
        },

        // Establecer el ambiente detectado (llamado desde el cliente después de la hidratación)
        setDetectedEnvironment: (env) => {
          set({ detectedEnvironment: env });
          // Si estamos en producción, forzar el ambiente a PROD
          if (env === "PROD") {
            set({ environment: "PROD" });
          }
        },

        // Role override controls (solo para UI, no afecta cookies ni middleware)
        setUseRoleOverride: (enabled) => {
          set({ useRoleOverride: enabled });
          // Si se desactiva, limpiar el override role
          if (!enabled) {
            set({ overrideRole: null });
          }
        },

        setOverrideRole: (role) => {
          set({ overrideRole: role });
          // Si se establece un rol, activar el override automáticamente
          if (role !== null) {
            set({ useRoleOverride: true });
          }
        },

        // Dialog controls
        openDialog: () => set({ isDialogOpen: true }),
        closeDialog: () => set({ isDialogOpen: false }),
        toggleDialog: () => set((state) => ({ isDialogOpen: !state.isDialogOpen })),
      };
    },
    {
      name: "emi-debug-storage",
      storage: createJSONStorage(() => localStorage),
      // Solo persistir estas propiedades (detectedEnvironment no se persiste)
      partialize: (state) => ({
        environment: state.environment,
        selectedRole: state.selectedRole,
        devApi: state.devApi,
        useRoleOverride: state.useRoleOverride,
        overrideRole: state.overrideRole,
      }),
      // Sincronizar el ambiente detectado al hidratar
      onRehydrateStorage: () => (state) => {
        if (state) {
          const detectedEnv = getDetectedEnvironmentFromClient();
          state.setDetectedEnvironment(detectedEnv);
          // Si el ambiente guardado no coincide con el detectado y estamos en PROD, usar el detectado
          if (state.environment !== detectedEnv && detectedEnv === "PROD") {
            state.environment = detectedEnv;
          }
        }
      },
    }
  )
);

// =============================================================================
// HOOKS DERIVADOS
// =============================================================================

export const useDebugEnvironment = () => useDebugStore((state) => state.environment);
export const useDebugDetectedEnvironment = () =>
  useDebugStore((state) => state.detectedEnvironment);
export const useDebugRole = () => useDebugStore((state) => state.selectedRole);
export const useDebugDevApi = () => useDebugStore((state) => state.devApi);
export const useDebugDialogOpen = () => useDebugStore((state) => state.isDialogOpen);
export const useDebugRoleOverride = () => useDebugStore((state) => state.useRoleOverride);
export const useDebugOverrideRole = () => useDebugStore((state) => state.overrideRole);
