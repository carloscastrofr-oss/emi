/**
 * Utilidades para la API
 * Helpers para modo dev, delays y respuestas estándar
 */

import { NextResponse } from "next/server";

/**
 * Delay simulado para modo dev (2 segundos)
 */
export const DEV_API_DELAY = 2000;

/**
 * Obtiene si estamos en modo dev API desde las cookies
 */
export function isDevApiMode(request: Request): boolean {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/emi-debug-storage=([^;]+)/);

  if (match && match[1]) {
    try {
      const decoded = decodeURIComponent(match[1]);
      const parsed = JSON.parse(decoded);
      return parsed.state?.devApi === true;
    } catch {
      // Ignorar errores de parsing
    }
  }

  return false;
}

/**
 * Aplica delay si estamos en modo dev
 */
export async function applyDevDelay(request: Request): Promise<void> {
  if (isDevApiMode(request)) {
    await new Promise((resolve) => setTimeout(resolve, DEV_API_DELAY));
  }
}

/**
 * Respuesta de éxito estándar
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Respuesta de error estándar
 */
export function errorResponse(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Tipo para respuestas de API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
  timestamp: string;
}
