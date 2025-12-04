/**
 * Store de autenticación con Zustand
 * Maneja el estado global de auth, usuario y permisos
 */

import { create } from "zustand";
import type { Role, SessionUser, Client } from "@/types/auth";

// =============================================================================
// TIPOS DEL STORE
// =============================================================================

interface AuthState {
  // Estado
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;

  // Usuario
  user: SessionUser | null;

  // Cliente/workspace actual (para futuro multi-tenant)
  currentClient: Client | null;

  // Error
  error: string | null;
}

interface AuthActions {
  // Inicializar auth (llamar al montar la app)
  initialize: () => Promise<void>;

  // Actualizar usuario manualmente
  setUser: (user: SessionUser | null) => void;

  // Actualizar rol (útil para testing)
  setRole: (role: Role) => void;

  // Logout
  logout: () => void;

  // Reset error
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// =============================================================================
// MOCK: Simula fetch de perfil de Google Auth
// =============================================================================

/**
 * Simula obtener el perfil del usuario desde Google Auth
 * TODO: Reemplazar con llamada real a Google Auth cuando esté implementado
 */
async function fetchMockUserProfile(): Promise<SessionUser> {
  // Simular delay de red (200-500ms)
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Datos mock - cambiar el rol aquí para probar diferentes permisos
  const mockUser: SessionUser = {
    uid: "mock-uid-12345",
    email: "designer@example.com",
    displayName: "Product Designer",
    photoUrl: null,

    // ROL HARDCODED PARA PRUEBAS - cambiar según necesidad
    role: "product_designer",

    // Sin permisos adicionales por ahora
    permissions: [],

    // Metadata
    emailVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date("2024-01-01"),

    // Onboarding
    onboarding: {
      completed: [],
      currentStep: undefined,
    },

    // Preferencias default
    preferences: {
      theme: "system",
      language: "es",
      notifications: {
        email: true,
        push: true,
        inApp: true,
      },
    },
  };

  return mockUser;
}

// =============================================================================
// STORE
// =============================================================================

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Estado inicial
  isLoading: true,
  isInitialized: false,
  isAuthenticated: false,
  user: null,
  currentClient: null,
  error: null,

  // Inicializar - llamar una vez al montar la app
  initialize: async () => {
    // Evitar re-inicialización
    if (get().isInitialized) return;

    set({ isLoading: true, error: null });

    try {
      // Fetch del perfil (mock por ahora)
      const user = await fetchMockUserProfile();

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: error instanceof Error ? error.message : "Error de autenticación",
      });
    }
  },

  // Actualizar usuario
  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  // Cambiar rol (útil para testing desde devtools)
  setRole: (role) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, role },
      });
    }
  },

  // Logout
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      currentClient: null,
    });
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  },
}));

// =============================================================================
// HOOKS DERIVADOS (para conveniencia)
// =============================================================================

/**
 * Hook para obtener solo el usuario actual
 */
export const useCurrentUser = () => useAuthStore((state) => state.user);

/**
 * Hook para obtener solo el rol actual
 */
export const useCurrentRole = () => useAuthStore((state) => state.user?.role ?? null);

/**
 * Hook para verificar si está autenticado
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

/**
 * Hook para obtener el estado de carga
 */
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
