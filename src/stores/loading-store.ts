/**
 * Store de Loading Global con Zustand
 * Maneja el estado global de loading para toda la aplicación
 */

import { create } from "zustand";

// =============================================================================
// TIPOS
// =============================================================================

interface LoadingOperation {
  id: string;
  message?: string;
  startedAt: number;
}

interface LoadingState {
  // Stack de operaciones de loading activas
  operations: LoadingOperation[];

  // Mensaje actual (del loading más reciente)
  currentMessage?: string;

  // Si hay al menos una operación activa
  isLoading: boolean;
}

interface LoadingActions {
  // Iniciar una operación de loading
  startLoading: (message?: string) => string;

  // Detener una operación de loading por ID
  stopLoading: (id: string) => void;

  // Actualizar mensaje de la operación actual
  setLoadingMessage: (message: string) => void;

  // Limpiar operaciones stuck (más antiguas que el timeout)
  clearStuckOperations: (timeoutMs?: number) => void;
}

type LoadingStore = LoadingState & LoadingActions;

// =============================================================================
// STORE
// =============================================================================

export const useLoadingStore = create<LoadingStore>((set, get) => ({
  // Estado inicial
  operations: [],
  currentMessage: undefined,
  isLoading: false,

  // Iniciar loading
  startLoading: (message?: string) => {
    const id = `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const operation: LoadingOperation = {
      id,
      message,
      startedAt: Date.now(),
    };

    set((state) => {
      const newOperations = [...state.operations, operation];
      return {
        operations: newOperations,
        currentMessage: message || state.currentMessage,
        isLoading: true,
      };
    });

    return id;
  },

  // Detener loading
  stopLoading: (id: string) => {
    set((state) => {
      const newOperations = state.operations.filter((op) => op.id !== id);
      const latestOperation = newOperations[newOperations.length - 1];

      return {
        operations: newOperations,
        currentMessage: latestOperation?.message,
        isLoading: newOperations.length > 0,
      };
    });
  },

  // Actualizar mensaje
  setLoadingMessage: (message: string) => {
    set((state) => {
      if (state.operations.length === 0) return state;

      const updatedOperations = state.operations.map((op, index) =>
        index === state.operations.length - 1 ? { ...op, message } : op
      );

      return {
        operations: updatedOperations,
        currentMessage: message,
      };
    });
  },

  // Limpiar operaciones stuck (más antiguas que el timeout)
  clearStuckOperations: (timeoutMs = 30000) => {
    const now = Date.now();
    set((state) => {
      const validOperations = state.operations.filter((op) => now - op.startedAt < timeoutMs);

      if (validOperations.length === state.operations.length) {
        // No hay operaciones stuck, no hacer nada
        return state;
      }

      const latestOperation = validOperations[validOperations.length - 1];

      return {
        operations: validOperations,
        currentMessage: latestOperation?.message,
        isLoading: validOperations.length > 0,
      };
    });
  },
}));

// =============================================================================
// HOOKS DERIVADOS
// =============================================================================

/**
 * Hook para obtener el estado de loading
 */
export const useIsLoading = () => useLoadingStore((state) => state.isLoading);

/**
 * Hook para obtener el mensaje de loading actual
 */
export const useLoadingMessage = () => useLoadingStore((state) => state.currentMessage);
