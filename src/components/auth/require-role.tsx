"use client";

import { ReactNode } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { hasMinimumRole } from "@/lib/auth";
import type { Role } from "@/types/auth";
import { Skeleton } from "../ui/skeleton";

interface RequireRoleProps {
  children: ReactNode;
  /** Lista de roles permitidos */
  roles?: Role[];
  /** Rol mínimo requerido (alternativa a lista de roles) */
  minRole?: Role;
  /** Contenido a mostrar si no tiene acceso */
  fallback?: ReactNode;
  /** Si true, muestra el contenido deshabilitado en vez de ocultarlo */
  showDisabled?: boolean;
}

/**
 * Componente que muestra su contenido solo si el usuario tiene el rol requerido
 */
export function RequireRole({
  children,
  roles,
  minRole,
  fallback = null,
  showDisabled = false,
}: RequireRoleProps) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  // Verificar acceso
  let hasAccess = false;

  if (user?.role) {
    if (minRole) {
      // Verificar por jerarquía de rol mínimo
      hasAccess = hasMinimumRole(user.role, minRole);
    } else if (roles && roles.length > 0) {
      // Verificar por lista de roles permitidos
      hasAccess = roles.includes(user.role);
    } else {
      // Si no se especifica restricción, tiene acceso
      hasAccess = true;
    }
  }

  if (!hasAccess) {
    if (showDisabled) {
      return <div className="pointer-events-none opacity-50">{children}</div>;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
