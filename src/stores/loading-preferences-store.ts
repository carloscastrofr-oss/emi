/**
 * Store de preferencias de loading state con persistencia
 * Este store persiste en localStorage para mantener las preferencias entre sesiones
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// =============================================================================
// TIPOS
// =============================================================================

export type SpinnerVariant = "default" | "pulse" | "dots" | "bars";
export type SpinnerSize = "sm" | "md" | "lg";

export interface LoadingPreferences {
  variant: SpinnerVariant;
  size: SpinnerSize;
  showDelay: number;
}

interface LoadingPreferencesState {
  preferences: LoadingPreferences;
  setVariant: (variant: SpinnerVariant) => void;
  setSize: (size: SpinnerSize) => void;
  setShowDelay: (delay: number) => void;
  reset: () => void;
}

const defaultPreferences: LoadingPreferences = {
  variant: "dots",
  size: "lg",
  showDelay: 150,
};

// =============================================================================
// STORE
// =============================================================================

export const useLoadingPreferencesStore = create<LoadingPreferencesState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,

      setVariant: (variant) =>
        set((state) => ({
          preferences: { ...state.preferences, variant },
        })),

      setSize: (size) =>
        set((state) => ({
          preferences: { ...state.preferences, size },
        })),

      setShowDelay: (showDelay) =>
        set((state) => ({
          preferences: { ...state.preferences, showDelay },
        })),

      reset: () =>
        set({
          preferences: defaultPreferences,
        }),
    }),
    {
      name: "emi-loading-preferences",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// =============================================================================
// HOOKS DERIVADOS
// =============================================================================

export const useLoadingPreferences = () => useLoadingPreferencesStore((state) => state.preferences);

export const useSetLoadingVariant = () => useLoadingPreferencesStore((state) => state.setVariant);

export const useSetLoadingSize = () => useLoadingPreferencesStore((state) => state.setSize);

export const useSetLoadingShowDelay = () =>
  useLoadingPreferencesStore((state) => state.setShowDelay);
