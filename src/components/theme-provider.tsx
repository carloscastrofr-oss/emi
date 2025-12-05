"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import { usePreferencesStore, applyThemeColor } from "@/stores/preferences-store";

export function ThemeProvider({ children, ...props }: Readonly<ThemeProviderProps>) {
  const [mounted, setMounted] = React.useState(false);
  const theme = usePreferencesStore((state) => state.theme);
  const themeColor = usePreferencesStore((state) => state.themeColor);

  React.useEffect(() => {
    setMounted(true);
    // Aplicar el color inicial cuando se monta
    if (globalThis.window !== undefined) {
      applyThemeColor(themeColor);
    }
  }, []);

  // Sincronizar el tema del store con next-themes cuando cambie
  React.useEffect(() => {
    if (mounted && globalThis.window !== undefined) {
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

      // Aplicar el color del tema después de cambiar light/dark
      applyThemeColor(themeColor);
    }
  }, [theme, themeColor, mounted]);

  return (
    <NextThemesProvider {...props} defaultTheme={theme} enableSystem={theme === "system"}>
      {children}
    </NextThemesProvider>
  );
}
