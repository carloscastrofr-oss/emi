"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  /**
   * Tamaño del spinner
   */
  size?: "sm" | "md" | "lg";

  /**
   * Variante del spinner
   */
  variant?: "default" | "pulse" | "dots" | "bars";

  /**
   * Color del spinner (clase de Tailwind)
   */
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

/**
 * Componente Spinner animado con Framer Motion
 */
export function Spinner({ size = "md", variant = "default", className }: SpinnerProps) {
  const sizeClass = sizeClasses[size];

  if (variant === "pulse") {
    return (
      <motion.div
        className={cn("rounded-full bg-primary", sizeClass, className)}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              "rounded-full bg-primary",
              size === "sm" ? "h-1.5 w-1.5" : size === "md" ? "h-2 w-2" : "h-3 w-3"
            )}
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "bars") {
    return (
      <div className={cn("flex items-end gap-1", className)}>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={cn(
              "bg-primary rounded-sm",
              size === "sm" ? "w-1" : size === "md" ? "w-1.5" : "w-2",
              size === "sm" ? "h-3" : size === "md" ? "h-4" : "h-6"
            )}
            animate={{
              height: [
                size === "sm" ? "0.75rem" : size === "md" ? "1rem" : "1.5rem",
                size === "sm" ? "1.5rem" : size === "md" ? "2rem" : "3rem",
                size === "sm" ? "0.75rem" : size === "md" ? "1rem" : "1.5rem",
              ],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  // Variante default: spinner circular con gradiente
  return (
    <motion.div
      className={cn("relative", sizeClass, className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-full border-4 border-transparent",
          "border-t-primary border-r-primary/50"
        )}
        style={{
          background: `conic-gradient(from 0deg, transparent, var(--primary), transparent)`,
          mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))",
        }}
      />
      <div className="absolute inset-2 rounded-full bg-background" />
    </motion.div>
  );
}
