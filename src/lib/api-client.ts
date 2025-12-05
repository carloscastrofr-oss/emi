/**
 * Cliente de API con soporte para modo dev
 * Agrega headers necesarios para que el servidor sepa si usar mocks
 */

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
