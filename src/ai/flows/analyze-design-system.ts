'use server';

/**
 * @fileOverview AI-powered design system analyzer.
 *
 * - analyzeDesignSystem - Analyzes component analytics and usage data.
 * - AnalyzeDesignSystemInput - The input type for the analyzeDesignSystem function.
 * - AnalyzeDesignSystemOutput - The return type for the analyzeDesignSystem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDesignSystemInputSchema = z.object({
  componentAnalytics: z
    .string()
    .describe('Component analytics and usage data as JSON string.'),
});
export type AnalyzeDesignSystemInput = z.infer<typeof AnalyzeDesignSystemInputSchema>;

const AnalyzeDesignSystemOutputSchema = z.object({
  diagnosis: z.string().describe('Summary diagnosis of the design system.'),
  recommendedActions: z.string().describe('Recommended actions to improve the design system.'),
  figmaPrompt: z
    .string()
    .describe('Prompt for Figma to generate new components or update existing ones.'),
  codeGenerationPrompt: z
    .string()
    .describe('Prompt for code generation to create or update components.'),
});
export type AnalyzeDesignSystemOutput = z.infer<typeof AnalyzeDesignSystemOutputSchema>;

export async function analyzeDesignSystem(input: AnalyzeDesignSystemInput): Promise<AnalyzeDesignSystemOutput> {
  return analyzeDesignSystemFlow(input);
}

const analyzeDesignSystemPrompt = ai.definePrompt({
  name: 'analyzeDesignSystemPrompt',
  input: {schema: AnalyzeDesignSystemInputSchema},
  output: {schema: AnalyzeDesignSystemOutputSchema},
  prompt: `You are an AI-powered design system analysis tool. Analyze the following component analytics and usage data to provide a summary diagnosis, recommended actions, and a prompt for Figma/code generation.

Component Analytics and Usage Data:
{{componentAnalytics}}

Instructions:
1.  Provide a concise summary diagnosis of the design system based on the analytics data.
2.  Recommend specific actions to improve the design system's efficiency and adoption.
3.  Generate a prompt for Figma that can be used to generate new components or update existing ones.
4.  Generate a prompt for code generation that can be used to create or update components.

Output the result as JSON:
{{output}}`,
});

const analyzeDesignSystemFlow = ai.defineFlow(
  {
    name: 'analyzeDesignSystemFlow',
    inputSchema: AnalyzeDesignSystemInputSchema,
    outputSchema: AnalyzeDesignSystemOutputSchema,
  },
  async input => {
    const {output} = await analyzeDesignSystemPrompt(input);
    return output!;
  }
);
