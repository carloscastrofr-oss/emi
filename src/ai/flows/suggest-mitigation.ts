
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

export async function suggestMitigation(risk: Risk): Promise<string> {
  const prompt = ai.definePrompt({
    name: 'suggestMitigationPrompt',
    input: { schema: MitigationInputSchema },
    output: { schema: MitigationOutputSchema },
    prompt: `Suggest ONE actionable fix (max 30 words) for this Design System risk:
       Category: {{{category}}}. Title: {{{title}}}. Component: {{{componentId}}}.`,
  });

  const { output } = await prompt({
    category: risk.category,
    title: risk.title,
    componentId: risk.componentId,
  });

  if (!output?.recommendation) {
    console.error("Failed to generate recommendation for risk:", risk.id);
    return "No se pudo generar una recomendación. Revise manualmente.";
  }

  // In a real scenario, we would update the Firestore document here.
  // For the prototype, we just return the string.
  return output.recommendation.trim();
}
