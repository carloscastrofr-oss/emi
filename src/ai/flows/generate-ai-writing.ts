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
      prompt: `Eres un experto en copywriting y generación de contenido para productos digitales. Tu tarea es generar copy y micro-copy segmentado por ciudad y audiencia.

**Contexto del Contenido:**
- Tópico: {{topic}}
- Tipo de Usuario: {{userType}}
- Tipo de Cliente: {{clientType}}
- Ciudad: {{city}}
- Idioma: {{language}}
- Tono: {{tone}}
- Número de Bloques: {{blocks}}

{{#if kitResourcesContext}}
**Recursos de Kit Seleccionados (Contexto Adicional):**
{{kitResourcesContext}}

Estos recursos pueden incluir manuales de voz y tono, guías de estilo, o cualquier otro material de referencia. Úsalos para enriquecer el contexto y asegurar que el contenido generado sea consistente con la identidad de marca y las directrices establecidas.
{{/if}}

**Instrucciones:**
1. Genera {{blocks}} bloques de contenido estructurado en formato markdown.
2. Cada bloque debe tener un título (###) seguido de contenido relevante.
3. El contenido debe estar segmentado específicamente para la ciudad de {{city}} y el tipo de usuario {{userType}}.
4. El tono debe ser {{tone}} y apropiado para {{clientType}}.
5. El contenido debe estar en {{language}}.
6. Asegúrate de que el copy sea claro, persuasivo y alineado con las mejores prácticas de UX writing.
7. Si hay recursos de kit proporcionados, úsalos como referencia para mantener consistencia en voz, tono y estilo.

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
