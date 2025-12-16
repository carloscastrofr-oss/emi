/**
 * Servicio de API centralizado con integración automática de loading
 * Wrapper mejorado sobre apiFetch que maneja loading global automáticamente
 */

import { apiFetch } from "./api-client";
import { useLoadingStore } from "@/stores/loading-store";
import type { ApiResponse } from "./api-utils";

// =============================================================================
// TIPOS
// =============================================================================

export interface ApiServiceOptions {
  /**
   * Mensaje personalizado para el loading
   */
  loadingMessage?: string;

  /**
   * Si debe mostrar loading (default: true)
   */
  showLoading?: boolean;

  /**
   * Timeout en ms para la request
   */
  timeout?: number;

  /**
   * Headers adicionales
   */
  headers?: Record<string, string>;

  /**
   * Si debe incluir credenciales (cookies)
   */
  credentials?: RequestCredentials;
}

interface ServerActionOptions {
  /**
   * Mensaje personalizado para el loading
   */
  loadingMessage?: string;

  /**
   * Si debe mostrar loading (default: true)
   */
  showLoading?: boolean;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Obtiene el store de loading (funciona fuera de componentes React)
 */
function getLoadingStore() {
  return useLoadingStore.getState();
}

/**
 * Crea un AbortController con timeout
 */
function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller;
}

// =============================================================================
// API SERVICE
// =============================================================================

class ApiService {
  /**
   * Realiza una petición GET
   */
  async get<T = unknown>(url: string, options: ApiServiceOptions = {}): Promise<T> {
    const { showLoading = true, loadingMessage, timeout, headers, credentials } = options;
    let loadingId: string | undefined;

    try {
      if (showLoading) {
        loadingId = getLoadingStore().startLoading(loadingMessage || "Cargando...");
      }

      const fetchOptions: RequestInit = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        credentials: credentials || "include",
      };

      if (timeout) {
        fetchOptions.signal = createTimeoutController(timeout).signal;
      }

      const response = await apiFetch(url, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: { message: `Error ${response.status}` },
        }));
        throw new Error(errorData.error?.message || `Error ${response.status}`);
      }

      const data = await response.json();

      // Si es una respuesta con formato ApiResponse, extraer data
      if (data && typeof data === "object" && "success" in data) {
        const apiResponse = data as ApiResponse<T>;
        if (!apiResponse.success) {
          throw new Error(apiResponse.error?.message || "Error en la respuesta del servidor");
        }
        return apiResponse.data as T;
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("La petición tardó demasiado y fue cancelada");
      }
      throw error;
    } finally {
      if (loadingId) {
        getLoadingStore().stopLoading(loadingId);
      }
    }
  }

  /**
   * Realiza una petición POST
   */
  async post<T = unknown>(
    url: string,
    body?: unknown,
    options: ApiServiceOptions = {}
  ): Promise<T> {
    const { showLoading = true, loadingMessage, timeout, headers, credentials } = options;
    let loadingId: string | undefined;

    try {
      if (showLoading) {
        loadingId = getLoadingStore().startLoading(loadingMessage || "Guardando...");
      }

      const fetchOptions: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: credentials || "include",
      };

      if (timeout) {
        fetchOptions.signal = createTimeoutController(timeout).signal;
      }

      const response = await apiFetch(url, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: { message: `Error ${response.status}` },
        }));
        throw new Error(errorData.error?.message || `Error ${response.status}`);
      }

      const data = await response.json();

      if (data && typeof data === "object" && "success" in data) {
        const apiResponse = data as ApiResponse<T>;
        if (!apiResponse.success) {
          throw new Error(apiResponse.error?.message || "Error en la respuesta del servidor");
        }
        return apiResponse.data as T;
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("La petición tardó demasiado y fue cancelada");
      }
      throw error;
    } finally {
      if (loadingId) {
        getLoadingStore().stopLoading(loadingId);
      }
    }
  }

  /**
   * Realiza una petición PUT
   */
  async put<T = unknown>(url: string, body?: unknown, options: ApiServiceOptions = {}): Promise<T> {
    const { showLoading = true, loadingMessage, timeout, headers, credentials } = options;
    let loadingId: string | undefined;

    try {
      if (showLoading) {
        loadingId = getLoadingStore().startLoading(loadingMessage || "Actualizando...");
      }

      const fetchOptions: RequestInit = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: credentials || "include",
      };

      if (timeout) {
        fetchOptions.signal = createTimeoutController(timeout).signal;
      }

      const response = await apiFetch(url, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: { message: `Error ${response.status}` },
        }));
        throw new Error(errorData.error?.message || `Error ${response.status}`);
      }

      const data = await response.json();

      if (data && typeof data === "object" && "success" in data) {
        const apiResponse = data as ApiResponse<T>;
        if (!apiResponse.success) {
          throw new Error(apiResponse.error?.message || "Error en la respuesta del servidor");
        }
        return apiResponse.data as T;
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("La petición tardó demasiado y fue cancelada");
      }
      throw error;
    } finally {
      if (loadingId) {
        getLoadingStore().stopLoading(loadingId);
      }
    }
  }

  /**
   * Realiza una petición DELETE
   */
  async delete<T = unknown>(url: string, options: ApiServiceOptions = {}): Promise<T> {
    const { showLoading = true, loadingMessage, timeout, headers, credentials } = options;
    let loadingId: string | undefined;

    try {
      if (showLoading) {
        loadingId = getLoadingStore().startLoading(loadingMessage || "Eliminando...");
      }

      const fetchOptions: RequestInit = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        credentials: credentials || "include",
      };

      if (timeout) {
        fetchOptions.signal = createTimeoutController(timeout).signal;
      }

      const response = await apiFetch(url, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: { message: `Error ${response.status}` },
        }));
        throw new Error(errorData.error?.message || `Error ${response.status}`);
      }

      const data = await response.json();

      if (data && typeof data === "object" && "success" in data) {
        const apiResponse = data as ApiResponse<T>;
        if (!apiResponse.success) {
          throw new Error(apiResponse.error?.message || "Error en la respuesta del servidor");
        }
        return apiResponse.data as T;
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("La petición tardó demasiado y fue cancelada");
      }
      throw error;
    } finally {
      if (loadingId) {
        getLoadingStore().stopLoading(loadingId);
      }
    }
  }

  /**
   * Llama a un Server Action de Next.js con loading automático
   */
  async callServerAction<T = unknown>(
    action: (...args: any[]) => Promise<T>,
    ...args: any[]
  ): Promise<T> {
    const options: ServerActionOptions = {};

    // Si el último argumento es un objeto con opciones, extraerlo
    if (
      args.length > 0 &&
      typeof args[args.length - 1] === "object" &&
      args[args.length - 1] !== null &&
      !Array.isArray(args[args.length - 1])
    ) {
      const lastArg = args[args.length - 1];
      if ("loadingMessage" in lastArg || "showLoading" in lastArg) {
        Object.assign(options, lastArg);
        args = args.slice(0, -1);
      }
    }

    const { showLoading = true, loadingMessage } = options;
    let loadingId: string | undefined;

    try {
      if (showLoading) {
        loadingId = getLoadingStore().startLoading(loadingMessage || "Procesando...");
      }

      const result = await action(...args);
      return result;
    } finally {
      if (loadingId) {
        getLoadingStore().stopLoading(loadingId);
      }
    }
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();

// Exportar clase para testing
export { ApiService };
