"use server";

/**
 * Server actions para el módulo AI Writing
 */

import {
  generateAIWriting,
  type GenerateAIWritingInput,
} from "@/ai/flows/ai-writing/generate-ai-writing";
import {
  generateWritingInsights,
  type GenerateWritingInsightsInput,
} from "@/ai/flows/ai-writing/generate-writing-insights";
import { formatKitResourcesForPrompt, type KitResourceContent } from "@/lib/kit-content-reader";
import { validateMultipleDocumentsContext } from "@/lib/rag-validator";
import { prisma } from "@/lib/prisma";
import { apiFetch } from "@/lib/api-client";
import { ref, getDownloadURL } from "firebase/storage";
import { storage, isStorageAvailable } from "@/lib/firebase";
import type { Kit, KitItem } from "@/types/kit";
import type { ApiResponse } from "@/lib/api-utils";

/**
 * Extrae texto de un PDF usando una API route que se ejecuta en Node.js puro
 * Esto evita problemas con webpack bundling en Server Actions
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  console.log(
    "[extractPdfText] Starting PDF text extraction via API route, buffer size:",
    buffer.length
  );

  try {
    // Crear un FormData para enviar el PDF a la API route
    const formData = new FormData();
    const blob = new Blob([buffer], { type: "application/pdf" });
    formData.append("file", blob, "document.pdf");

    // Obtener la URL base - en Server Actions necesitamos la URL completa
    // Intentar detectar el puerto desde la variable de entorno o usar 3000 por defecto
    const port = process.env.PORT || process.env.NEXT_PUBLIC_PORT || "3000";
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${port}`);

    console.log("[extractPdfText] Using base URL:", baseUrl);

    // Llamar a la API route que se ejecuta en Node.js puro (sin webpack)
    const response = await fetch(`${baseUrl}/api/pdf/extract-text`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      console.error("[extractPdfText] API route error:", errorData);
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("[extractPdfText] API route extracted text length:", data.text?.length || 0);

    if (!data.text || data.text.trim().length < 50) {
      throw new Error("PDF sin texto extraíble (puede ser escaneado)");
    }

    return data.text;
  } catch (error: any) {
    console.error("[extractPdfText] API route failed:", error.message);
    throw new Error(`Error al extraer texto del PDF: ${error.message}`);
  }
}

/**
 * Obtiene archivos de kit directamente desde la base de datos por sus IDs
 */
async function fetchKitFilesByIds(fileIds: string[]): Promise<
  Array<{
    id: string;
    title: string;
    name: string;
    fileUrl: string;
    mimeType: string | null;
  }>
> {
  try {
    const files = await prisma.kitFile.findMany({
      where: {
        id: { in: fileIds },
      },
      select: {
        id: true,
        title: true,
        name: true,
        fileUrl: true,
        mimeType: true,
      },
    });

    return files.map((file) => ({
      id: file.id,
      title: file.title,
      name: file.name,
      fileUrl: file.fileUrl,
      mimeType: file.mimeType,
    }));
  } catch (error) {
    console.error("Error fetching kit files by IDs:", error);
    return [];
  }
}

/**
 * Lee el contenido de un archivo desde Firebase Storage
 * Optimizado con timeout y mejor manejo de errores
 */
async function readFileContentFromStorage(
  fileUrl: string,
  mimeType?: string | null
): Promise<string> {
  if (!isStorageAvailable() || !storage) {
    throw new Error("Firebase Storage no está disponible");
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB límite
  const TIMEOUT_MS = 30000; // 30 segundos timeout

  try {
    // Obtener la URL de descarga
    const downloadURL = fileUrl.startsWith("http")
      ? fileUrl
      : await getDownloadURL(ref(storage, fileUrl));

    // Descargar el archivo con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(downloadURL, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText} (${response.status})`);
      }

      // Verificar tamaño del archivo
      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
        throw new Error(
          `El archivo es demasiado grande (${Math.round(parseInt(contentLength, 10) / 1024 / 1024)}MB). Límite: 10MB`
        );
      }

      // Para archivos de texto, leer directamente
      if (mimeType?.startsWith("text/") || mimeType === "application/json") {
        const text = await response.text();
        if (text.length > MAX_FILE_SIZE) {
          throw new Error("El contenido del archivo excede el límite de 10MB");
        }
        return text;
      }

      // Para PDFs, usar pdf-parse para extraer texto
      if (mimeType === "application/pdf") {
        try {
          // Obtener el buffer del PDF
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          console.log(`[PDF Extraction] Starting extraction for PDF, size: ${buffer.length} bytes`);

          // Verificar tamaño del buffer
          if (buffer.length > MAX_FILE_SIZE) {
            throw new Error(
              `El archivo PDF es demasiado grande (${Math.round(buffer.length / 1024 / 1024)}MB). Límite: 10MB`
            );
          }

          // Extraer texto usando pdf-parse
          const extractedText = (await extractPdfText(buffer)).trim();

          console.log(`[PDF Extraction] Extracted text length: ${extractedText.length} characters`);

          if (!extractedText || extractedText.length < 50) {
            // PDF sin texto extraíble (puede ser solo imágenes)
            console.warn("[PDF Extraction] PDF has no extractable text (may be scanned)");
            return `[Archivo PDF: El PDF no contiene texto extraíble. Puede ser un PDF escaneado o basado en imágenes. Por favor, considera usar un PDF con texto seleccionable o convertir el PDF a texto.]`;
          }

          // Limitar a 100k caracteres para evitar tokens excesivos
          const finalText =
            extractedText.length > 100000
              ? `${extractedText.substring(0, 50000)}\n\n[... contenido omitido ...]\n\n${extractedText.substring(extractedText.length - 50000)}`
              : extractedText;

          console.log(
            `[PDF Extraction] Success! Final text length: ${finalText.length} characters`
          );
          return finalText;
        } catch (pdfError) {
          console.error("[PDF Extraction] Error extracting text from PDF:", pdfError);
          // Si falla la extracción, retornar un mensaje más específico
          const errorMessage = pdfError instanceof Error ? pdfError.message : "Error desconocido";
          console.error("[PDF Extraction] Error message:", errorMessage);
          console.error(
            "[PDF Extraction] Error stack:",
            pdfError instanceof Error ? pdfError.stack : "No stack"
          );
          if (errorMessage.includes("demasiado grande")) {
            throw new Error(errorMessage);
          }
          return `[Archivo PDF: No se pudo extraer el texto del PDF. Error: ${errorMessage}. Por favor, verifica que el PDF no esté corrupto o protegido con contraseña.]`;
        }
      }

      // Para otros tipos, intentar leer como texto
      try {
        const text = await response.text();
        if (text.length > MAX_FILE_SIZE) {
          throw new Error("El contenido del archivo excede el límite de 10MB");
        }
        return text;
      } catch {
        return `[Archivo binario: ${mimeType || "tipo desconocido"}. No se puede extraer contenido de texto.]`;
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error("Timeout al descargar el archivo (30s)");
      }
      throw fetchError;
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
 * Genera contenido de copy/microcopy usando Genkit con validación RAG
 */
export async function generateAIWritingContent(
  input: Omit<GenerateAIWritingInput, "kitResourcesContext"> & {
    selectedKitResourceIds?: string[];
  }
): Promise<{
  content: string;
  discardedFiles?: Array<{ id: string; title: string; reason: string }>;
}> {
  try {
    let kitResourcesContext = "";
    const discardedFiles: Array<{ id: string; title: string; reason: string }> = [];

    // Si hay recursos seleccionados, obtener su contenido y validar
    if (input.selectedKitResourceIds && input.selectedKitResourceIds.length > 0) {
      try {
        // Obtener los archivos directamente desde la DB
        const files = await fetchKitFilesByIds(input.selectedKitResourceIds);

        if (files.length > 0) {
          // Leer el contenido de todos los archivos primero
          const filesWithContent: Array<{
            file: { id: string; title: string; fileUrl: string; mimeType: string | null };
            content: string;
          }> = [];
          const validResources: KitResourceContent[] = [];

          for (const file of files) {
            try {
              // Leer el contenido del archivo
              const content = await readFileContentFromStorage(file.fileUrl, file.mimeType);
              filesWithContent.push({ file, content });
            } catch (error) {
              console.error(`Error reading file ${file.id}:`, error);
              // Si falla la lectura, descartar el archivo
              discardedFiles.push({
                id: file.id,
                title: file.title,
                reason: "No se pudo leer el contenido del archivo.",
              });
            }
          }

          // Validar todos los documentos en batch (más eficiente)
          if (filesWithContent.length > 0) {
            const validations = await validateMultipleDocumentsContext(
              filesWithContent.map(({ file, content }) => ({
                title: file.title,
                content,
              }))
            );

            // Procesar resultados de validación
            filesWithContent.forEach(({ file, content }, index) => {
              const validation = validations[index];
              if (validation?.isValid) {
                validResources.push({
                  id: file.id,
                  title: file.title,
                  type: "file",
                  content,
                });
              } else {
                // Agregar a la lista de descartados
                discardedFiles.push({
                  id: file.id,
                  title: file.title,
                  reason: validation?.reason || "No tiene suficiente contexto para generar copys.",
                });
              }
            });
          }

          // Formatear solo los recursos válidos para el prompt
          if (validResources.length > 0) {
            kitResourcesContext = formatKitResourcesForPrompt(validResources);
          }
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

    return {
      content: result.content,
      discardedFiles: discardedFiles.length > 0 ? discardedFiles : undefined,
    };
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
