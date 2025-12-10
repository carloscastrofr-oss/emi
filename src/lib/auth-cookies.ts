/**
 * Utilidades para manejar cookies de autenticación
 * Usadas para comunicar el estado de autenticación y rol al middleware de Next.js
 */

import type { Role } from "@/types/auth";

const ROLE_COOKIE_NAME = "emi_role";
const AUTH_COOKIE_NAME = "emi_auth";

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
 * Establece la cookie de autenticación con el ID token de Firebase
 * Esta cookie contiene el token JWT que el middleware puede verificar
 */
export function setAuthCookie(idToken: string): void {
  if (typeof document === "undefined") return;

  // Cookie válida por 1 hora (los tokens de Firebase expiran después de 1 hora)
  // Se renovará automáticamente cuando el usuario esté activo
  const maxAge = 60 * 60; // 1 hora
  const isProduction = window.location.protocol === "https:";
  const secureFlag = isProduction ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE_NAME}=${idToken}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
}

/**
 * Elimina la cookie de autenticación
 */
export function clearAuthCookie(): void {
  if (typeof document === "undefined") return;

  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
}

/**
 * Obtiene el token de autenticación desde la cookie (client-side)
 */
export function getAuthCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp(`(^| )${AUTH_COOKIE_NAME}=([^;]+)`));
  return match && match[2] ? match[2] : null;
}

/**
 * Decodifica un token JWT para obtener el payload
 * Sin verificar la firma (solo para obtener información como expiración)
 * Compatible con browser (usa atob en lugar de Buffer)
 */
function decodeJWT(token: string): { exp?: number; [key: string]: unknown } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    if (!payload) {
      return null;
    }

    // Decodificar base64 en browser (compatible con Node.js también)
    let decoded: string;
    if (typeof window !== "undefined") {
      // Browser: usar atob
      decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    } else {
      // Node.js: usar Buffer
      decoded = Buffer.from(payload, "base64").toString("utf-8");
    }

    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Verifica si un token JWT está expirado
 * @param token - Token JWT de Firebase
 * @param bufferSeconds - Segundos de buffer antes de considerar expirado (default: 60s)
 * @returns true si el token está expirado o cerca de expirar
 */
export function isTokenExpired(token: string, bufferSeconds: number = 60): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true; // Si no podemos decodificar, considerar expirado
  }

  const expirationTime = decoded.exp * 1000; // exp está en segundos, convertir a ms
  const now = Date.now();
  const bufferMs = bufferSeconds * 1000;

  // Considerar expirado si ya expiró o está cerca de expirar (dentro del buffer)
  return now >= expirationTime - bufferMs;
}

/**
 * Obtiene el tiempo restante hasta la expiración del token en milisegundos
 * @returns Tiempo en ms hasta expiración, o null si no se puede determinar
 */
export function getTokenTimeToExpiry(token: string): number | null {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  const expirationTime = decoded.exp * 1000;
  const now = Date.now();
  return Math.max(0, expirationTime - now);
}

/**
 * Verifica que ambas cookies (auth y role) estén establecidas
 * Útil para verificar antes de redirigir después del login
 */
export function areAuthCookiesSet(): boolean {
  if (typeof document === "undefined") return false;
  return !!getAuthCookie() && !!getRoleCookie();
}

/**
 * Espera hasta que las cookies de autenticación estén establecidas
 * Útil después del login para asegurar que las cookies estén disponibles antes de redirigir
 */
export async function waitForAuthCookies(maxWaitMs: number = 1000): Promise<boolean> {
  if (typeof document === "undefined") return false;

  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    if (areAuthCookiesSet()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return areAuthCookiesSet();
}

/**
 * Nombres de las cookies exportados para uso en middleware
 */
export const ROLE_COOKIE = ROLE_COOKIE_NAME;
export const AUTH_COOKIE = AUTH_COOKIE_NAME;
