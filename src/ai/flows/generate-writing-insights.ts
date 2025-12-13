"use server";
/**
 * @fileOverview AI-powered insights generator for writing content.
 * - generateWritingInsights - Generates insights about user behavior and generated content.
 * - GenerateWritingInsightsInput - The input type for the generateWritingInsights function.
 * - GenerateWritingInsightsOutput - The return type for the generateWritingInsights function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateWritingInsightsInputSchema = z.object({
  topic: z.string().describe("El tópico del contenido generado."),
  userType: z.string().describe("Tipo de usuario objetivo."),
  clientType: z.string().describe("Tipo de cliente."),
  city: z.string().describe("Ciudad para la que se generó el contenido."),
  language: z.string().describe("Idioma del contenido."),
  tone: z.string().describe("Tono utilizado en el contenido."),
  generatedContent: z.string().describe("El contenido generado para analizar."),
});

export type GenerateWritingInsightsInput = z.infer<typeof GenerateWritingInsightsInputSchema>;

const GenerateWritingInsightsOutputSchema = z.object({
  insights: z
    .array(z.string())
    .length(3)
    .describe(
      "Array de exactamente 3 insights sobre comportamiento de usuarios, análisis del contenido y mejores prácticas."
    ),
});

export type GenerateWritingInsightsOutput = z.infer<typeof GenerateWritingInsightsOutputSchema>;

const generateWritingInsightsFlow = ai.defineFlow(
  {
    name: "generateWritingInsightsFlow",
    inputSchema: GenerateWritingInsightsInputSchema,
    outputSchema: GenerateWritingInsightsOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: "generateWritingInsightsPrompt",
      model: "googleai/gemini-2.0-flash",
      input: { schema: GenerateWritingInsightsInputSchema },
      output: { schema: GenerateWritingInsightsOutputSchema },
      prompt: `Eres un analista experto en UX writing y comportamiento de usuarios. Tu tarea es generar 3 insights valiosos basados en el contexto y el contenido generado.

**Contexto:**
- Tópico: {{topic}}
- Tipo de Usuario: {{userType}}
- Tipo de Cliente: {{clientType}}
- Ciudad: {{city}}
- Idioma: {{language}}
- Tono: {{tone}}

**Contenido Generado:**
{{generatedContent}}

**Instrucciones:**
Genera exactamente 3 insights diferentes:

1. **Insight sobre Comportamiento de Usuarios**: Basado en el tipo de cliente ({{clientType}}), tipo de usuario ({{userType}}) y ciudad ({{city}}), proporciona un insight sobre cómo este segmento de usuarios se comporta, qué valoran, o qué barreras enfrentan. Este insight debe ser específico y accionable.

2. **Insight sobre el Contenido Generado**: Analiza el contenido generado y proporciona un insight sobre su efectividad, qué elementos funcionan bien, o qué podría mejorarse. Considera el tono, la claridad, y la persuasión del copy.

3. **Insight sobre Mejores Prácticas o Recomendaciones**: Proporciona una recomendación o mejor práctica relacionada con el tópico, el segmento de usuarios, o el tipo de contenido generado. Este insight debe ser práctico y útil para futuras iteraciones.

**Formato de Salida:**
Retorna un array con exactamente 3 strings, cada uno conteniendo un insight completo y bien formulado. Cada insight debe ser una oración o párrafo corto (máximo 2-3 oraciones) que sea claro y accionable.

Genera los 3 insights ahora:`,
    });

    const { output } = await prompt(input);
    if (!output) {
      throw new Error("No se pudieron generar los insights.");
    }

    return output;
  }
);

export async function generateWritingInsights(
  input: GenerateWritingInsightsInput
): Promise<GenerateWritingInsightsOutput> {
  return generateWritingInsightsFlow(input);
}
