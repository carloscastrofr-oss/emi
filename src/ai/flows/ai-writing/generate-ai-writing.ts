"use server";
/**
 * @fileOverview AI-powered writing generator for copy and microcopy.
 * - generateAIWriting - Generates copy/microcopy content using Genkit with Gemini.
 * - GenerateAIWritingInput - The input type for the generateAIWriting function.
 * - GenerateAIWritingOutput - The return type for the generateAIWriting function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateAIWritingInputSchema = z.object({
  topic: z.string().describe("El tópico o tema principal del contenido a generar."),
  userType: z.string().describe("Tipo de usuario objetivo (ej: Joven profesional, Ejecutivo)."),
  clientType: z.string().describe("Tipo de cliente (ej: Cliente nuevo, Usuario recurrente)."),
  city: z.string().describe("Ciudad para segmentar el contenido."),
  language: z.string().describe("Idioma en el que se generará el contenido."),
  tone: z.string().describe("Tono del contenido (ej: Amigable, Profesional, Formal)."),
  blocks: z.number().describe("Número de bloques de contenido a generar."),
  kitResourcesContext: z
    .string()
    .optional()
    .describe("Contexto adicional de recursos de kit seleccionados."),
});

export type GenerateAIWritingInput = z.infer<typeof GenerateAIWritingInputSchema>;

const GenerateAIWritingOutputSchema = z.object({
  content: z
    .string()
    .describe("Contenido generado en formato markdown con títulos y párrafos estructurados."),
});

export type GenerateAIWritingOutput = z.infer<typeof GenerateAIWritingOutputSchema>;

const generateAIWritingFlow = ai.defineFlow(
  {
    name: "generateAIWritingFlow",
    inputSchema: GenerateAIWritingInputSchema,
    outputSchema: GenerateAIWritingOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: "generateAIWritingPrompt",
      model: "googleai/gemini-2.0-flash",
      input: { schema: GenerateAIWritingInputSchema },
      output: { schema: GenerateAIWritingOutputSchema },
      prompt: `Eres un experto en copywriting y generación de contenido para productos digitales. Tu tarea es generar copy y micro-copy segmentado por ciudad y audiencia usando RAG (Retrieval Augmented Generation) cuando esté disponible.

**Contexto del Contenido:**
- Tópico: {{topic}}
- Tipo de Usuario: {{userType}}
- Tipo de Cliente: {{clientType}}
- Ciudad: {{city}}
- Idioma: {{language}}
- Tono: {{tone}}
- Número de Bloques: {{blocks}}

{{#if kitResourcesContext}}
**Recursos de Kit Seleccionados (Contexto RAG):**
{{kitResourcesContext}}

**Instrucciones para usar el contexto RAG:**
1. **Voz y Tono**: Si los documentos incluyen manuales de voz y tono, extrae los principios clave y aplícalos consistentemente en todo el contenido generado. No copies frases literales, sino adapta los principios al contexto específico.

2. **Terminología**: Usa la terminología exacta que aparece en los documentos cuando sea relevante. Si hay términos específicos de producto o marca, úsalos correctamente.

3. **Valores y Propuestas de Valor**: Si los documentos mencionan valores de marca o propuestas de valor, refleja estos conceptos en el copy de manera natural y persuasiva.

4. **Guías de Estilo**: Sigue cualquier regla de estilo, formato o estructura que se mencione en los documentos (ej: longitud de frases, uso de mayúsculas, estructura de mensajes).

5. **Contexto de Marca**: Integra información sobre la empresa, producto o servicio que aparezca en los documentos para darle autenticidad y coherencia al copy.

**IMPORTANTE**: Los documentos proporcionados han sido pre-validados para contener contexto útil. Úsalos como fuente de verdad para mantener consistencia, pero siempre adapta el contenido al contexto específico (ciudad, tipo de usuario, tipo de cliente) solicitado.
{{/if}}

**Instrucciones Generales:**
1. Genera {{blocks}} bloques de contenido estructurado en formato markdown.
2. Cada bloque debe tener un título (###) seguido de contenido relevante.
3. El contenido debe estar segmentado específicamente para la ciudad de {{city}} y el tipo de usuario {{userType}}.
4. El tono debe ser {{tone}} y apropiado para {{clientType}}.
5. El contenido debe estar en {{language}}.
6. Asegúrate de que el copy sea claro, persuasivo y alineado con las mejores prácticas de UX writing.
7. Si hay recursos de kit proporcionados, úsalos como referencia para mantener consistencia en voz, tono, terminología y valores de marca.
8. Evita repetir literalmente textos largos de los recursos; extrae principios y adáptalos al contexto específico.

**Formato de Salida:**
El contenido debe estar en formato markdown con títulos de nivel 3 (###) para cada bloque. Usa párrafos claros y concisos.

Genera el contenido ahora:`,
    });

    const { output } = await prompt(input);
    if (!output) {
      throw new Error("No se pudo generar el contenido.");
    }

    return output;
  }
);

export async function generateAIWriting(
  input: GenerateAIWritingInput
): Promise<GenerateAIWritingOutput> {
  return generateAIWritingFlow(input);
}
