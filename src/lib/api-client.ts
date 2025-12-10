/**
 * Cliente de API con soporte para modo dev
 * Agrega headers necesarios para que el servidor sepa si usar mocks
 */

import type { SessionData } from "@/types/session";
import { getAuthCookie } from "@/lib/auth-cookies";

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

  const response = await apiFetch("/api/sesion", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // El token se enviará vía cookie automáticamente
    },
    credentials: "include",
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
