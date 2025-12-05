"use client";

import { useEffect } from "react";
import { useDebugStore } from "@/stores/debug-store";
import { getEnvironmentShort } from "@/lib/env";

/**
 * Componente que inyecta el ambiente detectado en el cliente
 * Se ejecuta después de la hidratación para sincronizar el store con el ambiente real
 */
export function EnvInjector() {
  const setDetectedEnvironment = useDebugStore((state) => state.setDetectedEnvironment);

  useEffect(() => {
    // Obtener el ambiente detectado desde el servidor
    // En el cliente, intentamos leer desde window.__ENV__ primero
    // Si no existe, usamos el módulo de env (que funciona en el cliente también)
    let detectedEnv: "DEV" | "QA" | "PROD" = "DEV";

    if (typeof window !== "undefined") {
      // Intentar leer desde variable global inyectada
      const windowEnv = (window as any).__ENV__?.environment;
      if (windowEnv) {
        detectedEnv = windowEnv;
      } else {
        // Fallback: usar el módulo de env
        try {
          detectedEnv = getEnvironmentShort();
        } catch {
          // Si falla, usar DEV por defecto
          detectedEnv = "DEV";
        }
      }
    }

    // Sincronizar el store con el ambiente detectado
    setDetectedEnvironment(detectedEnv);
  }, [setDetectedEnvironment]);

  return null;
}
