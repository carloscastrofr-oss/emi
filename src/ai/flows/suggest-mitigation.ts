
'use server';
/**
 * @fileOverview AI-powered risk mitigation suggestion flow.
 * - suggestMitigation - Suggests a fix for a given design system risk.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Risk } from '@/types/risk';

const MitigationInputSchema = z.object({
  category: z.string(),
  title: z.string(),
  componentId: z.string().nullable(),
});

const MitigationOutputSchema = z.object({
  recommendation: z.string().describe('A concise, actionable suggestion for fixing the risk, under 30 words.'),
});

const suggestMitigationPrompt = ai.definePrompt({
    name: 'suggestMitigationPrompt',
    input: { schema: MitigationInputSchema },
    output: { schema: MitigationOutputSchema },
    prompt: `Suggest ONE actionable fix (max 30 words) for this Design System risk:
       Category: {{{category}}}. Title: {{{title}}}. Component: {{{componentId}}}.`,
});


const suggestMitigationFlow = ai.defineFlow(
  {
    name: 'suggestMitigationFlow',
    inputSchema: MitigationInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await suggestMitigationPrompt(input);
    
    if (!output?.recommendation) {
        console.error("Failed to generate recommendation for risk input:", input);
        return "No se pudo generar una recomendación. Revise manualmente.";
    }

    return output.recommendation.trim();
  }
);


export async function suggestMitigation(risk: Risk): Promise<string> {
    return suggestMitigationFlow({
        category: risk.category,
        title: risk.title,
        componentId: risk.componentId,
    });
}
