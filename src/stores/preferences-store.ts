/**
 * Store de preferencias del usuario con persistencia
 * Este store persiste en localStorage para mantener las preferencias entre sesiones
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// =============================================================================
// TIPOS
// =============================================================================

export type Theme = "light" | "dark" | "system";
export type ThemeColor =
  | "green" // Verde esmeralda (actual)
  | "blue" // Azul profesional
  | "purple" // Púrpura moderno
  | "pink" // Rosa vibrante
  | "indigo" // Índigo elegante
  | "teal"; // Verde azulado

export interface ColorScheme {
  name: ThemeColor;
  label: string;
  hue: number; // HSL hue value
  light: {
    primary: string; // HSL format
    primaryContainer: string;
  };
  dark: {
    primary: string;
    primaryContainer: string;
  };
}

// Definición de los 6 colores disponibles
export const colorSchemes: Record<ThemeColor, ColorScheme> = {
  green: {
    name: "green",
    label: "Forest",
    hue: 142,
    light: {
      primary: "142 56% 45%",
      primaryContainer: "142 69% 82%",
    },
    dark: {
      primary: "142 56% 56%",
      primaryContainer: "142 71% 15%",
    },
  },
  blue: {
    name: "blue",
    label: "Ocean",
    hue: 217,
    light: {
      primary: "217 91% 60%",
      primaryContainer: "217 100% 85%",
    },
    dark: {
      primary: "217 91% 70%",
      primaryContainer: "217 91% 20%",
    },
  },
  purple: {
    name: "purple",
    label: "Amethyst",
    hue: 270,
    light: {
      primary: "270 70% 58%",
      primaryContainer: "270 70% 85%",
    },
    dark: {
      primary: "270 70% 68%",
      primaryContainer: "270 70% 20%",
    },
  },
  pink: {
    name: "pink",
    label: "Blush",
    hue: 340,
    light: {
      primary: "340 82% 60%",
      primaryContainer: "340 82% 85%",
    },
    dark: {
      primary: "340 82% 70%",
      primaryContainer: "340 82% 20%",
    },
  },
  indigo: {
    name: "indigo",
    label: "Midnight",
    hue: 250,
    light: {
      primary: "250 80% 58%",
      primaryContainer: "250 80% 85%",
    },
    dark: {
      primary: "250 80% 68%",
      primaryContainer: "250 80% 20%",
    },
  },
  teal: {
    name: "teal",
    label: "Lagoon",
    hue: 195,
    light: {
      primary: "195 85% 52%",
      primaryContainer: "195 85% 85%",
    },
    dark: {
      primary: "195 85% 62%",
      primaryContainer: "195 85% 20%",
    },
  },
};

interface PreferencesState {
  // Apariencia
  theme: Theme;
  themeColor: ThemeColor;
}

interface PreferencesActions {
  setTheme: (theme: Theme) => void;
  setThemeColor: (color: ThemeColor) => void;
}

type PreferencesStore = PreferencesState & PreferencesActions;

// =============================================================================
// STORE CON PERSISTENCIA
// =============================================================================

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      // Estado inicial
      theme: "light", // Por defecto light
      themeColor: "green", // Por defecto verde (el actual)

      // Setters
      setTheme: (theme) => {
        set({ theme });
        // Actualizar el atributo del HTML para que next-themes lo detecte
        if (globalThis.window !== undefined) {
          const root = globalThis.window.document.documentElement;
          root.classList.remove("light", "dark");
          if (theme === "system") {
            const systemTheme = globalThis.window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light";
            root.classList.add(systemTheme);
          } else {
            root.classList.add(theme);
          }
        }
      },
      setThemeColor: (themeColor) => {
        set({ themeColor });
        // Aplicar el color inmediatamente
        if (globalThis.window !== undefined) {
          applyThemeColor(themeColor);
        }
      },
    }),
    {
      name: "emi-preferences-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Aplicar el color al rehidratar
        if (state && globalThis.window !== undefined) {
          applyThemeColor(state.themeColor);
        }
      },
    }
  )
);

// Función helper para aplicar el color del tema
export function applyThemeColor(color: ThemeColor) {
  if (globalThis.window === undefined) return;

  const scheme = colorSchemes[color];
  const root = globalThis.window.document.documentElement;
  const isDark = root.classList.contains("dark");

  const colors = isDark ? scheme.dark : scheme.light;

  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-container", colors.primaryContainer);
  root.style.setProperty("--ring", colors.primary);
  root.style.setProperty("--accent", isDark ? `${scheme.hue} 56% 15%` : `${scheme.hue} 56% 95%`);
  root.style.setProperty("--accent-foreground", isDark ? "0 0% 98%" : `${scheme.hue} 56% 15%`);
}

// =============================================================================
// HOOKS DERIVADOS
// =============================================================================

export const useTheme = () => usePreferencesStore((state) => state.theme);
export const useSetTheme = () => usePreferencesStore((state) => state.setTheme);
export const useThemeColor = () => usePreferencesStore((state) => state.themeColor);
export const useSetThemeColor = () => usePreferencesStore((state) => state.setThemeColor);
