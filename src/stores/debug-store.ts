/**
 * Store de debugging con persistencia
 * Este store persiste en localStorage para mantener la configuración entre sesiones
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

  // UI state (no persiste)
  isDialogOpen: boolean;
}

interface DebugActions {
  // Setters
  setEnvironment: (env: Environment) => void;
  setSelectedRole: (role: Role) => void;
  setDevApi: (enabled: boolean) => void;
  toggleDevApi: () => void;

  // Dialog
  openDialog: () => void;
  closeDialog: () => void;
  toggleDialog: () => void;
}

type DebugStore = DebugState & DebugActions;

// =============================================================================
// STORE CON PERSISTENCIA
// =============================================================================

export const useDebugStore = create<DebugStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      environment: "DEV",
      selectedRole: "product_designer",
      devApi: true, // Por defecto activado en desarrollo
      isDialogOpen: false,

      // Setters con recarga de página
      setEnvironment: (environment) => {
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

      // Dialog controls
      openDialog: () => set({ isDialogOpen: true }),
      closeDialog: () => set({ isDialogOpen: false }),
      toggleDialog: () => set((state) => ({ isDialogOpen: !state.isDialogOpen })),
    }),
    {
      name: "emi-debug-storage",
      storage: createJSONStorage(() => localStorage),
      // Solo persistir estas propiedades
      partialize: (state) => ({
        environment: state.environment,
        selectedRole: state.selectedRole,
        devApi: state.devApi,
      }),
    }
  )
);

// =============================================================================
// HOOKS DERIVADOS
// =============================================================================

export const useDebugEnvironment = () => useDebugStore((state) => state.environment);
export const useDebugRole = () => useDebugStore((state) => state.selectedRole);
export const useDebugDevApi = () => useDebugStore((state) => state.devApi);
export const useDebugDialogOpen = () => useDebugStore((state) => state.isDialogOpen);
