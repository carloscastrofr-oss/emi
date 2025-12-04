/**
 * Utilidades para manejar cookies de autenticación
 * Usadas para comunicar el rol al middleware de Next.js
 */

import type { Role } from "@/types/auth";

const ROLE_COOKIE_NAME = "emi_role";

/**
 * Guarda el rol del usuario en una cookie
 * Esta cookie será leída por el middleware para verificar permisos
 */
export function setRoleCookie(role: Role): void {
  if (typeof document === "undefined") return;

  // Cookie válida por 7 días
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${ROLE_COOKIE_NAME}=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Obtiene el rol desde la cookie (client-side)
 */
export function getRoleCookie(): Role | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp(`(^| )${ROLE_COOKIE_NAME}=([^;]+)`));
  return match ? (match[2] as Role) : null;
}

/**
 * Elimina la cookie de rol
 */
export function clearRoleCookie(): void {
  if (typeof document === "undefined") return;

  document.cookie = `${ROLE_COOKIE_NAME}=; path=/; max-age=0`;
}

/**
 * Nombre de la cookie exportado para uso en middleware
 */
export const ROLE_COOKIE = ROLE_COOKIE_NAME;
