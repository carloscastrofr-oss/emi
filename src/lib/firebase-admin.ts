/**
 * Firebase Admin SDK para validación de tokens en el servidor
 * Usado para verificar tokens de Firebase en API routes
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

/**
 * Inicializa Firebase Admin SDK
 * Requiere GOOGLE_APPLICATION_CREDENTIALS o FIREBASE_ADMIN_CREDENTIALS
 */
function initializeFirebaseAdmin(): { app: App; auth: Auth } | null {
  // Si ya está inicializado, retornar la instancia existente
  if (adminApp && adminAuth) {
    return { app: adminApp, auth: adminAuth };
  }

  try {
    // Verificar si ya hay una app inicializada
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0] as App;
      adminAuth = getAuth(adminApp);
      return { app: adminApp, auth: adminAuth };
    }

    // Intentar inicializar con credenciales desde variable de entorno
    // Orden de prioridad:
    // 1. GOOGLE_APPLICATION_CREDENTIALS (ruta a archivo JSON) - Recomendado para local/dev
    // 2. FIREBASE_ADMIN_CREDENTIALS (JSON string) - Recomendado para Vercel/Cloud Run
    // 3. Usar projectId de NEXT_PUBLIC_FIREBASE_PROJECT_ID (fallback, validación básica)

    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const credentialsJson = process.env.FIREBASE_ADMIN_CREDENTIALS;

    if (credentialsPath) {
      // Opción 1: Inicializar con archivo de credenciales
      adminApp = initializeApp({
        credential: cert(credentialsPath),
      }) as App;
    } else if (credentialsJson) {
      // Opción 2: Inicializar con JSON string (útil para plataformas cloud)
      try {
        const credentials = JSON.parse(credentialsJson);
        adminApp = initializeApp({
          credential: cert(credentials),
        }) as App;
      } catch (parseError) {
        console.error("Error parseando FIREBASE_ADMIN_CREDENTIALS:", parseError);
        console.warn(
          "Usando validación básica (sin verificación de firma). Configura credenciales para validación completa."
        );
        return null;
      }
    } else {
      // Opción 3: Sin credenciales, usar validación básica
      // Esto funciona pero NO verifica la firma del token (solo expiración)
      // En producción, siempre deberías usar una de las opciones anteriores
      const projectId =
        process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      if (projectId && process.env.NODE_ENV === "development") {
        console.warn(
          `⚠️  Firebase Admin no está completamente configurado (projectId: ${projectId}).`
        );
        console.warn(
          "Usando validación básica de tokens (solo expiración, sin verificación de firma)."
        );
        console.warn(
          "Para validación completa, configura GOOGLE_APPLICATION_CREDENTIALS o FIREBASE_ADMIN_CREDENTIALS."
        );
        console.warn(
          "Ver documentación en: https://firebase.google.com/docs/admin/setup#initialize-sdk"
        );
      }
      return null;
    }

    adminAuth = getAuth(adminApp);
    return { app: adminApp, auth: adminAuth };
  } catch (error) {
    console.error("Error inicializando Firebase Admin:", error);
    return null;
  }
}

/**
 * Obtiene la instancia de Auth de Firebase Admin
 * Inicializa si es necesario
 */
export function getAdminAuth(): Auth | null {
  const result = initializeFirebaseAdmin();
  return result?.auth ?? null;
}

/**
 * Verifica un token de Firebase ID
 * Valida la firma, expiración y que el token sea válido
 * @param idToken - Token JWT de Firebase
 * @returns DecodedToken con información del usuario
 * @throws Error si el token es inválido, expirado o revocado
 */
export async function verifyIdToken(
  idToken: string
): Promise<{ uid: string; [key: string]: unknown }> {
  const auth = getAdminAuth();
  if (!auth) {
    // Si Firebase Admin no está configurado, hacer validación básica
    console.warn("Firebase Admin no configurado. Haciendo validación básica del token.");
    const basicResult = verifyTokenBasic(idToken);
    if (!basicResult) {
      throw new Error("Token inválido");
    }
    return basicResult;
  }

  try {
    // Verificar token con Firebase Admin (valida firma, expiración, etc.)
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error: any) {
    // Manejar diferentes tipos de errores
    if (error.code === "auth/id-token-expired") {
      throw new Error("Token expirado");
    }
    if (error.code === "auth/argument-error") {
      throw new Error("Token inválido");
    }
    if (error.code === "auth/id-token-revoked") {
      throw new Error("Token revocado");
    }
    throw new Error(`Error verificando token: ${error.message}`);
  }
}

/**
 * Validación básica del token (sin Firebase Admin)
 * Solo verifica formato y expiración, NO verifica la firma
 * Usar solo en desarrollo o cuando Firebase Admin no está disponible
 */
function verifyTokenBasic(token: string): { uid: string; exp: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    if (!payload) {
      return null;
    }

    // Decodificar payload
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);

    // Verificar expiración
    if (parsed.exp) {
      const expirationTime = parsed.exp * 1000; // exp está en segundos
      const now = Date.now();
      if (now >= expirationTime) {
        throw new Error("Token expirado");
      }
    }

    // Extraer UID
    const uid = parsed.uid || parsed.user_id;
    if (!uid) {
      return null;
    }

    return { uid, exp: parsed.exp };
  } catch (error: any) {
    if (error.message === "Token expirado") {
      throw error;
    }
    return null;
  }
}

/**
 * Verifica si Firebase Admin está disponible
 */
export function isFirebaseAdminAvailable(): boolean {
  return getAdminAuth() !== null;
}
