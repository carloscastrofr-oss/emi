/**
 * Utilidades de autenticación para API routes
 * Proporciona helpers para validar tokens en endpoints
 */

import { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth-cookies";
import { verifyIdToken } from "@/lib/firebase-admin";
import { errorResponse } from "@/lib/api-utils";

/**
 * Resultado de la validación de autenticación
 */
export interface AuthValidationResult {
  userId: string;
  decodedToken: { uid: string; [key: string]: unknown };
}

/**
 * Valida el token de autenticación en una request
 * @param request - Request de Next.js
 * @returns AuthValidationResult con userId y token decodificado
 * @throws Error si el token es inválido, expirado o no está presente
 */
export async function validateAuth(request: NextRequest): Promise<AuthValidationResult> {
  // Obtener token de la cookie
  const authCookie = request.cookies.get(AUTH_COOKIE);
  const token = authCookie?.value;

  if (!token) {
    throw new Error("No se encontró token de autenticación");
  }

  // Verificar token con Firebase Admin (valida firma, expiración, etc.)
  let decodedToken;
  try {
    decodedToken = await verifyIdToken(token);
  } catch (error: unknown) {
    // Token inválido, expirado o revocado
    const errorMessage = error instanceof Error ? error.message : "Token de autenticación inválido";
    throw new Error(errorMessage);
  }

  // Verificar que el token fue decodificado correctamente
  if (!decodedToken) {
    throw new Error("Token de autenticación inválido");
  }

  // Extraer userId del token verificado
  const userId = decodedToken.uid;
  if (!userId) {
    throw new Error("Token de autenticación inválido: no se pudo obtener userId");
  }

  return {
    userId,
    decodedToken,
  };
}

/**
 * Wrapper para endpoints que requieren autenticación
 * Valida el token y ejecuta el handler si es válido
 * @param request - Request de Next.js
 * @param handler - Función handler que recibe userId y decodedToken
 * @returns Response de Next.js
 */
export async function withAuth(
  request: NextRequest,
  handler: (auth: AuthValidationResult) => Promise<Response> | Response
): Promise<Response> {
  try {
    const auth = await validateAuth(request);
    return await handler(auth);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error de autenticación";
    console.warn("Error de autenticación:", errorMessage);
    return errorResponse(errorMessage, 401);
  }
}
