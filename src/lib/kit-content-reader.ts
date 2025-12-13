/**
 * Utilidades para leer contenido de archivos de kits desde Firebase Storage
 */

import { ref, getDownloadURL } from "firebase/storage";
import { storage, isStorageAvailable } from "@/lib/firebase";
import type { KitItem } from "@/types/kit";

export interface KitResourceContent {
  id: string;
  title: string;
  type: "file" | "link";
  content?: string; // Contenido extraído del archivo (para archivos)
  metadata?: {
    url: string;
    description?: string;
  }; // Para enlaces
}

/**
 * Obtiene el contenido de un recurso de kit
 * Para archivos: intenta leer el contenido
 * Para enlaces: retorna metadatos
 */
export async function getKitResourceContent(resource: KitItem): Promise<KitResourceContent> {
  if (resource.type === "link") {
    return {
      id: resource.id,
      title: resource.title,
      type: "link",
      metadata: {
        url: resource.url,
        description: resource.description,
      },
    };
  }

  // Para archivos, intentar leer el contenido
  if (resource.type === "file") {
    try {
      const content = await readFileContent(resource.fileUrl, resource.mimeType);
      return {
        id: resource.id,
        title: resource.title,
        type: "file",
        content,
      };
    } catch (error) {
      console.error(`Error reading file ${resource.id}:`, error);
      // Retornar sin contenido si falla la lectura
      return {
        id: resource.id,
        title: resource.title,
        type: "file",
      };
    }
  }

  throw new Error(`Unknown resource type: ${resource}`);
}

/**
 * Lee el contenido de un archivo desde Firebase Storage
 */
async function readFileContent(fileUrl: string, mimeType?: string): Promise<string> {
  if (!isStorageAvailable() || !storage) {
    throw new Error("Firebase Storage no está disponible");
  }

  try {
    // Obtener la URL de descarga
    const downloadURL = fileUrl.startsWith("http")
      ? fileUrl
      : await getDownloadURL(ref(storage, fileUrl));

    // Descargar el archivo
    const response = await fetch(downloadURL);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // Para archivos de texto, leer directamente
    if (mimeType?.startsWith("text/") || mimeType === "application/json") {
      return await response.text();
    }

    // Para PDFs, por ahora retornar una nota (se puede mejorar con una librería de PDF)
    if (mimeType === "application/pdf") {
      return `[Archivo PDF: ${fileUrl}. El contenido completo del PDF no se puede extraer automáticamente. Por favor, revisa el archivo manualmente.]`;
    }

    // Para otros tipos, intentar leer como texto
    try {
      return await response.text();
    } catch {
      return `[Archivo binario: ${mimeType || "tipo desconocido"}. No se puede extraer contenido de texto.]`;
    }
  } catch (error) {
    console.error("Error reading file content:", error);
    throw new Error(
      error instanceof Error
        ? `Error al leer archivo: ${error.message}`
        : "Error desconocido al leer archivo"
    );
  }
}

/**
 * Obtiene el contenido de múltiples recursos de kit
 */
export async function getMultipleKitResourcesContent(
  resources: KitItem[]
): Promise<KitResourceContent[]> {
  const promises = resources.map((resource) => getKitResourceContent(resource));
  return Promise.all(promises);
}

/**
 * Formatea el contenido de recursos para incluir en el prompt de Genkit
 */
export function formatKitResourcesForPrompt(resources: KitResourceContent[]): string {
  if (resources.length === 0) {
    return "";
  }

  const sections = resources.map((resource) => {
    if (resource.type === "link") {
      return `- **${resource.title}** (Enlace): ${resource.metadata?.url}\n  ${resource.metadata?.description || "Sin descripción"}`;
    } else {
      const contentSection = resource.content
        ? `\n  Contenido:\n  ${resource.content
            .split("\n")
            .map((line) => `  ${line}`)
            .join("\n")}`
        : "\n  [Contenido no disponible]";
      return `- **${resource.title}** (Archivo)${contentSection}`;
    }
  });

  return `\n\n## Recursos de Kit Seleccionados:\n${sections.join("\n\n")}`;
}
