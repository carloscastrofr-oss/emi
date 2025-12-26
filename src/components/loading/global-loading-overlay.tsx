"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useIsLoading, useLoadingMessage, useLoadingStore } from "@/stores/loading-store";
import { Spinner } from "./spinner";
import { cn } from "@/lib/utils";

/**
 * Rutas donde el GlobalLoadingOverlay NO debe mostrarse
 * Estas rutas tienen su propia experiencia de carga
 */
const EXCLUDED_ROUTES = ["/auth-loading", "/login", "/no-access", "/forbidden"];

interface GlobalLoadingOverlayProps {
  /**
   * Delay en ms antes de mostrar el overlay (evita flash en cargas rápidas)
   */
  showDelay?: number;

  /**
   * Timeout en ms para auto-hide (prevenir loadings stuck)
   */
  timeout?: number;

  /**
   * Variante del spinner
   */
  spinnerVariant?: "default" | "pulse" | "dots" | "bars";

  /**
   * Tamaño del spinner
   */
  spinnerSize?: "sm" | "md" | "lg";
}

/**
 * Componente de overlay global para mostrar loading
 * Se muestra automáticamente cuando hay operaciones de loading activas
 */
export function GlobalLoadingOverlay({
  showDelay = 150,
  timeout = 30000,
  spinnerVariant = "dots",
  spinnerSize = "lg",
}: GlobalLoadingOverlayProps) {
  const pathname = usePathname();
  const isLoading = useIsLoading();
  const message = useLoadingMessage();
  const clearStuckOperations = useLoadingStore((state) => state.clearStuckOperations);
  const [shouldShow, setShouldShow] = useState(false);

  // Verificar si estamos en una ruta excluida
  const isExcludedRoute = EXCLUDED_ROUTES.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    // No mostrar en rutas excluidas (tienen su propia experiencia de carga)
    if (isExcludedRoute) {
      setShouldShow(false);
      return undefined;
    }

    if (isLoading) {
      // Delay antes de mostrar (evitar flash en cargas rápidas)
      const delayTimer = setTimeout(() => {
        setShouldShow(true);
      }, showDelay);

      // Timeout para prevenir loadings stuck
      const timeoutTimer = setTimeout(() => {
        console.warn(
          "[GlobalLoadingOverlay] Loading activo por más de",
          timeout,
          "ms. Limpiando operaciones stuck."
        );
        // Limpiar operaciones stuck del store
        clearStuckOperations(timeout);
      }, timeout);

      return () => {
        clearTimeout(delayTimer);
        clearTimeout(timeoutTimer);
      };
    }
    // Si no hay loading, ocultar inmediatamente
    setShouldShow(false);
    return undefined;
  }, [isLoading, showDelay, timeout, clearStuckOperations, isExcludedRoute]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          role="status"
          aria-live="polite"
          aria-label={message || "Cargando"}
        >
          {/* Backdrop con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 backdrop-blur-md bg-black/20 dark:bg-black/40"
          />

          {/* Contenido centrado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative flex flex-col items-center gap-4"
          >
            {/* Spinner */}
            <div className="relative">
              <Spinner variant={spinnerVariant} size={spinnerSize} className="text-primary" />
              {/* Sombra sutil */}
              <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full -z-10" />
            </div>

            {/* Mensaje opcional */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                {/* Efecto de glow sutil detrás del texto */}
                <div className="absolute inset-0 blur-md bg-primary/20 rounded-full -z-10" />
                <p
                  className={cn(
                    "text-sm font-medium",
                    "text-foreground/90",
                    "relative z-10",
                    "px-4 py-2",
                    "bg-gradient-to-b from-background/95 to-background/85",
                    "backdrop-blur-xl",
                    "rounded-full",
                    "border border-primary/30",
                    "shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
                    "dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                  )}
                >
                  {message}
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
