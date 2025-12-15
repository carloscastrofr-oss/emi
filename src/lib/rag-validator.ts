/**
 * Utilidades para validar el contexto de documentos para RAG
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const ValidateDocumentContextInputSchema = z.object({
  documentTitle: z.string().describe("Título del documento"),
  documentContent: z.string().describe("Contenido del documento"),
});

const ValidateDocumentContextOutputSchema = z.object({
  isValid: z
    .boolean()
    .describe("Indica si el documento tiene suficiente contexto para generar copys"),
  reason: z.string().optional().describe("Razón por la cual el documento es válido o no para RAG"),
});

const ValidateMultipleDocumentsInputSchema = z.object({
  documents: z
    .array(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .describe("Array de documentos a validar"),
});

const ValidateMultipleDocumentsOutputSchema = z.object({
  results: z
    .array(
      z.object({
        isValid: z.boolean(),
        reason: z.string().optional(),
      })
    )
    .describe("Resultados de validación para cada documento"),
});

type ValidateDocumentContextInput = z.infer<typeof ValidateDocumentContextInputSchema>;
type ValidateDocumentContextOutput = z.infer<typeof ValidateDocumentContextOutputSchema>;

/**
 * Valida si un documento tiene suficiente contexto para ser usado en RAG
 * para generar copys y microcopys.
 */
export async function validateDocumentContext(
  title: string,
  content: string
): Promise<{ isValid: boolean; reason?: string }> {
  // Si el contenido está vacío o es muy corto, descartar directamente
  if (!content || content.trim().length < 50) {
    return {
      isValid: false,
      reason: "El documento no tiene suficiente contenido para extraer contexto útil.",
    };
  }

  // Si el contenido parece ser solo metadatos o información técnica sin contexto útil
  if (content.length < 200 && !content.match(/[a-záéíóúñ]{4,}/i)) {
    return {
      isValid: false,
      reason:
        "El documento contiene principalmente metadatos técnicos sin contexto útil para copywriting.",
    };
  }

  // Si el contenido es un mensaje de error o placeholder, descartar
  // Pero solo si es claramente un mensaje de error, no contenido real que pueda contener estas frases
  if (
    (content.includes("[Archivo PDF:") &&
      (content.includes("no se puede extraer") ||
        content.includes("No se pudo extraer") ||
        content.includes("no contiene texto extraíble") ||
        content.includes("no esté corrupto"))) ||
    (content.includes("[Archivo binario:") && content.includes("No se puede extraer"))
  ) {
    return {
      isValid: false,
      reason:
        "El archivo no se puede procesar automáticamente (formato no soportado, binario, o PDF sin texto extraíble).",
    };
  }

  try {
    const prompt = ai.definePrompt({
      name: "validateDocumentContextPrompt",
      model: "googleai/gemini-2.0-flash",
      input: { schema: ValidateDocumentContextInputSchema },
      output: { schema: ValidateDocumentContextOutputSchema },
      prompt: `Eres un experto en validación de documentos para uso en generación de contenido (RAG - Retrieval Augmented Generation).

Tu tarea es evaluar si un documento tiene suficiente contexto útil para generar copys y microcopys para productos digitales.

**Documento a evaluar:**
- Título: {{documentTitle}}
- Contenido: {{documentContent}}

**Criterios de validez:**
Un documento es válido para RAG si contiene información útil sobre:
- Voz y tono de marca
- Guías de estilo de escritura
- Información sobre la empresa/producto
- Valores y propuestas de valor
- Terminología preferida
- Directrices de comunicación
- Manuales de marca
- Información sobre audiencia objetivo

Un documento NO es válido si:
- Solo contiene metadatos técnicos
- Es un archivo binario sin texto extraíble
- No tiene información contextual relevante para copywriting
- Es demasiado corto o genérico
- Solo contiene listas de datos sin contexto

**Instrucciones:**
1. Analiza el contenido del documento.
2. Determina si tiene información útil para generar copys.
3. Proporciona una razón clara y concisa.

Responde con un objeto JSON que indique si el documento es válido y por qué.`,
    });

    const { output } = await prompt({
      documentTitle: title,
      documentContent: content.substring(0, 10000), // Limitar a 10k caracteres para evitar tokens excesivos
    });

    return {
      isValid: output?.isValid ?? false,
      reason: output?.reason,
    };
  } catch (error) {
    console.error("Error validating document context:", error);
    // En caso de error, ser conservador y permitir el documento
    // (mejor tener contexto extra que descartar algo útil)
    return {
      isValid: true,
      reason: "No se pudo validar el contexto, se incluirá por precaución.",
    };
  }
}

/**
 * Valida múltiples documentos en una sola llamada a la API (más eficiente)
 */
export async function validateMultipleDocumentsContext(
  documents: Array<{ title: string; content: string }>
): Promise<Array<{ isValid: boolean; reason?: string }>> {
  // Si no hay documentos, retornar array vacío
  if (documents.length === 0) {
    return [];
  }

  // Si solo hay un documento, usar la función individual
  if (documents.length === 1) {
    const doc = documents[0];
    if (!doc) return [];
    const result = await validateDocumentContext(doc.title, doc.content);
    return [result];
  }

  // Filtrar documentos que claramente no son válidos antes de llamar a la API
  const preFiltered: Array<{ title: string; content: string; originalIndex: number }> = [];
  const quickRejections: Array<{ isValid: boolean; reason?: string }> = [];

  documents.forEach((doc, index) => {
    // Validaciones rápidas
    if (!doc.content || doc.content.trim().length < 50) {
      quickRejections[index] = {
        isValid: false,
        reason: "El documento no tiene suficiente contenido para extraer contexto útil.",
      };
      return;
    }

    if (doc.content.length < 200 && !doc.content.match(/[a-záéíóúñ]{4,}/i)) {
      quickRejections[index] = {
        isValid: false,
        reason:
          "El documento contiene principalmente metadatos técnicos sin contexto útil para copywriting.",
      };
      return;
    }

    if (
      doc.content.includes("[Archivo PDF:") ||
      doc.content.includes("[Archivo binario:") ||
      doc.content.includes("No se puede extraer")
    ) {
      quickRejections[index] = {
        isValid: false,
        reason: "El archivo no se puede procesar automáticamente (formato no soportado o binario).",
      };
      return;
    }

    preFiltered.push({ ...doc, originalIndex: index });
  });

  // Si todos fueron rechazados rápidamente, retornar resultados
  if (preFiltered.length === 0) {
    return quickRejections;
  }

  try {
    const prompt = ai.definePrompt({
      name: "validateMultipleDocumentsContextPrompt",
      model: "googleai/gemini-2.0-flash",
      input: { schema: ValidateMultipleDocumentsInputSchema },
      output: { schema: ValidateMultipleDocumentsOutputSchema },
      prompt: `Eres un experto en validación de documentos para uso en generación de contenido (RAG - Retrieval Augmented Generation).

Tu tarea es evaluar múltiples documentos y determinar si cada uno tiene suficiente contexto útil para generar copys y microcopys para productos digitales.

**Documentos a evaluar:**
{{#each documents}}
- **{{title}}**: {{content}}
{{/each}}

**Criterios de validez:**
Un documento es válido para RAG si contiene información útil sobre:
- Voz y tono de marca
- Guías de estilo de escritura
- Información sobre la empresa/producto
- Valores y propuestas de valor
- Terminología preferida
- Directrices de comunicación
- Manuales de marca
- Información sobre audiencia objetivo

Un documento NO es válido si:
- Solo contiene metadatos técnicos
- Es un archivo binario sin texto extraíble
- No tiene información contextual relevante para copywriting
- Es demasiado corto o genérico
- Solo contiene listas de datos sin contexto

**Instrucciones:**
1. Analiza cada documento del array.
2. Determina si tiene información útil para generar copys.
3. Proporciona una razón clara y concisa para cada uno.
4. Retorna un array con los resultados en el mismo orden que los documentos de entrada.

Responde con un objeto JSON que contenga un array de resultados, uno por cada documento.`,
    });

    const { output } = await prompt({
      documents: preFiltered.map((doc) => ({
        title: doc.title,
        // Limitar a 8k caracteres por documento para batch (balance entre contexto y tokens)
        // Tomar inicio y final del documento para mantener contexto
        content:
          doc.content.length > 8000
            ? `${doc.content.substring(0, 4000)}\n\n[... contenido omitido ...]\n\n${doc.content.substring(doc.content.length - 4000)}`
            : doc.content,
      })),
    });

    // Construir el array de resultados completo
    const results: Array<{ isValid: boolean; reason?: string }> = [];
    let filteredIndex = 0;

    const validationResults = output?.results ?? [];

    for (let i = 0; i < documents.length; i++) {
      const quickRejection = quickRejections[i];
      if (quickRejection) {
        results[i] = quickRejection;
      } else {
        const validationResult = validationResults[filteredIndex];
        results[i] = {
          isValid: validationResult?.isValid ?? true,
          reason: validationResult?.reason,
        };
        filteredIndex++;
      }
    }

    return results;
  } catch (error) {
    console.error("Error validating multiple documents context:", error);
    // En caso de error, ser conservador y permitir todos los documentos
    return documents.map(() => ({
      isValid: true,
      reason: "No se pudo validar el contexto, se incluirá por precaución.",
    }));
  }
}
