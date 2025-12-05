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
 * Verifica si la petición viene en modo dev API
 * Lee el header X-Dev-Mode enviado por el cliente
 */
export function isDevApiMode(request: Request): boolean {
  return request.headers.get("X-Dev-Mode") === "true";
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
 * Respuesta para cuando no hay backend conectado
 */
export function noBackendResponse() {
  return errorResponse("Error de conexión con el servidor. Intenta de nuevo más tarde.", 503);
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
