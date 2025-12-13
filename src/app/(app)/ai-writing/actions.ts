"use server";

/**
 * Server actions para el módulo AI Writing
 */

import { generateAIWriting, type GenerateAIWritingInput } from "@/ai/flows/generate-ai-writing";
import {
  generateWritingInsights,
  type GenerateWritingInsightsInput,
} from "@/ai/flows/generate-writing-insights";
import {
  getMultipleKitResourcesContent,
  formatKitResourcesForPrompt,
} from "@/lib/kit-content-reader";
import { apiFetch } from "@/lib/api-client";
import type { Kit, KitItem } from "@/types/kit";
import type { ApiResponse } from "@/lib/api-utils";

/**
 * Genera contenido de copy/microcopy usando Genkit
 */
export async function generateAIWritingContent(
  input: Omit<GenerateAIWritingInput, "kitResourcesContext"> & {
    selectedKitResourceIds?: string[];
  }
): Promise<{ content: string }> {
  try {
    let kitResourcesContext = "";

    // Si hay recursos seleccionados, obtener su contenido
    if (input.selectedKitResourceIds && input.selectedKitResourceIds.length > 0) {
      try {
        // Obtener los recursos de los kits
        const resources = await fetchKitResourcesByIds(input.selectedKitResourceIds);

        if (resources.length > 0) {
          // Leer el contenido de los recursos
          const resourcesContent = await getMultipleKitResourcesContent(resources);
          kitResourcesContext = formatKitResourcesForPrompt(resourcesContent);
        }
      } catch (error) {
        console.error("Error fetching kit resources content:", error);
        // Continuar sin el contexto de recursos si hay error
      }
    }

    // Llamar al flow de Genkit
    const result = await generateAIWriting({
      ...input,
      kitResourcesContext: kitResourcesContext || undefined,
    });

    return { content: result.content };
  } catch (error) {
    console.error("Error generating AI writing content:", error);
    throw new Error(
      error instanceof Error
        ? `Error al generar contenido: ${error.message}`
        : "Error desconocido al generar contenido"
    );
  }
}

/**
 * Genera insights sobre el contenido generado
 */
export async function generateInsights(input: GenerateWritingInsightsInput): Promise<string[]> {
  try {
    const result = await generateWritingInsights(input);
    return result.insights;
  } catch (error) {
    console.error("Error generating insights:", error);
    throw new Error(
      error instanceof Error
        ? `Error al generar insights: ${error.message}`
        : "Error desconocido al generar insights"
    );
  }
}

/**
 * Obtiene todos los kits disponibles
 */
export async function fetchKits(): Promise<Kit[]> {
  try {
    const response = await apiFetch("/api/kit");
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudieron obtener los kits`);
    }
    const data: ApiResponse<Kit[]> = await response.json();
    if (!data.success || !data.data) {
      throw new Error("Error al obtener los kits");
    }
    return data.data;
  } catch (error) {
    console.error("Error fetching kits:", error);
    throw new Error(
      error instanceof Error
        ? `Error al obtener kits: ${error.message}`
        : "Error desconocido al obtener kits"
    );
  }
}

/**
 * Obtiene los recursos (archivos y enlaces) de un kit específico
 */
export async function fetchKitResources(kitId: string): Promise<KitItem[]> {
  try {
    const response = await apiFetch(`/api/kit/${kitId}/files`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudieron obtener los recursos del kit`);
    }
    const data: ApiResponse<KitItem[]> = await response.json();
    if (!data.success || !data.data) {
      throw new Error("Error al obtener los recursos del kit");
    }
    return data.data;
  } catch (error) {
    console.error("Error fetching kit resources:", error);
    throw new Error(
      error instanceof Error
        ? `Error al obtener recursos del kit: ${error.message}`
        : "Error desconocido al obtener recursos del kit"
    );
  }
}

/**
 * Obtiene recursos de kits por sus IDs
 * Esta función busca en todos los kits para encontrar los recursos por ID
 */
async function fetchKitResourcesByIds(resourceIds: string[]): Promise<KitItem[]> {
  try {
    // Obtener todos los kits
    const kits = await fetchKits();
    const allResources: KitItem[] = [];

    // Buscar recursos en cada kit
    for (const kit of kits) {
      try {
        const resources = await fetchKitResources(kit.id);
        // Filtrar solo los recursos que están en la lista de IDs
        const matchingResources = resources.filter((resource) => resourceIds.includes(resource.id));
        allResources.push(...matchingResources);
      } catch (error) {
        // Continuar si un kit falla
        console.warn(`Error fetching resources for kit ${kit.id}:`, error);
      }
    }

    return allResources;
  } catch (error) {
    console.error("Error fetching kit resources by IDs:", error);
    return [];
  }
}
