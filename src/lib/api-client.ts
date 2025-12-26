/**
 * Cliente de API con soporte para modo dev
 * Agrega headers necesarios para que el servidor sepa si usar mocks
 */

import type { SessionData } from "@/types/session";
import { getAuthCookie, isTokenExpired } from "@/lib/auth-cookies";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Obtiene el estado de devApi desde localStorage
 */
function getDevApiState(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const stored = localStorage.getItem("emi-debug-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.devApi === true;
    }
  } catch {
    // Ignorar errores
  }
  return false;
}

/**
 * Fetch wrapper que incluye el header de modo dev
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const devApi = getDevApiState();

  const headers = new Headers(options.headers);
  headers.set("X-Dev-Mode", devApi ? "true" : "false");

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Obtiene los datos de sesión del usuario
 * Incluye información del usuario, clientes accesibles, workspaces y configuraciones
 */
export async function getSessionData(): Promise<SessionData> {
  const authToken = getAuthCookie();

  if (!authToken) {
    throw new Error("No hay token de autenticación. Por favor, inicia sesión.");
  }

  // Verificar si el token está expirado antes de hacer la request
  if (isTokenExpired(authToken, 60)) {
    // Intentar renovar el token antes de continuar
    try {
      await useAuthStore.getState().checkAndRefreshToken();
    } catch {
      throw new Error("Token expirado. Por favor, inicia sesión nuevamente.");
    }
  }

  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[API Client] 📡 getSessionData() iniciando petición (${requestId})`, {
    url: "/api/sesion",
    hasAuthCookie: typeof document !== "undefined" ? !!document.cookie.includes("emi_auth") : "N/A",
    currentUrl: typeof window !== "undefined" ? window.location.href : "N/A",
  });

  const response = await apiFetch("/api/sesion", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // El token se enviará vía cookie automáticamente
    },
    credentials: "include",
  });

  console.log(`[API Client] ✅ getSessionData() respuesta recibida (${requestId})`, {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: { message: "Error al obtener datos de sesión" },
    }));

    throw new Error(
      errorData.error?.message ||
        `Error ${response.status}: No se pudieron obtener los datos de sesión`
    );
  }

  const data = await response.json();

  if (!data.success || !data.data) {
    throw new Error("Respuesta inválida del servidor");
  }

  return data.data as SessionData;
}

/**
 * Actualiza los valores de cliente y workspace por defecto del usuario
 * @param defaultClientId - ID del cliente por defecto
 * @param defaultWorkspaceId - ID del workspace por defecto
 * @returns Objeto con los defaults actualizados
 */
export async function updateSessionDefaults(
  defaultClientId: string,
  defaultWorkspaceId: string
): Promise<{ defaultClientId: string; defaultWorkspaceId: string }> {
  // Verificar y renovar el token antes de hacer la request
  const checkToken = useAuthStore.getState().checkAndRefreshToken;
  try {
    await checkToken();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error al verificar el token de autenticación"
    );
  }

  const authToken = getAuthCookie();

  if (!authToken) {
    throw new Error("No hay token de autenticación. Por favor, inicia sesión.");
  }

  const response = await apiFetch("/api/sesion/defaults", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      defaultClientId,
      defaultWorkspaceId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: { message: "Error al actualizar defaults" },
    }));

    throw new Error(
      errorData.error?.message || `Error ${response.status}: No se pudieron actualizar los defaults`
    );
  }

  const data = await response.json();

  if (!data.success || !data.data) {
    throw new Error("Respuesta inválida del servidor");
  }

  return data.data as { defaultClientId: string; defaultWorkspaceId: string };
}
