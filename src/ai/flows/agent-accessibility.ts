'use server';
/**
 * @fileOverview AI-powered Accessibility & Inclusion agent.
 * - agentAccessibility - Runs an accessibility audit on a given URL.
 * - AgentAccessibilityInput - The input type for the agentAccessibility function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { addRecommendation } from '@/app/(app)/agent/actions';

const AgentAccessibilityInputSchema = z.object({
  url: z.string().url().describe('The URL of the page to audit for accessibility.'),
});
export type AgentAccessibilityInput = z.infer<typeof AgentAccessibilityInputSchema>;

const AgentAccessibilityOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('The overall accessibility score from 0 to 100.'),
  issues: z.array(z.object({
    rule: z.string().describe('The accessibility rule that was violated (e.g., "color-contrast").'),
    node: z.string().describe('The CSS selector or identifier for the problematic element.'),
    details: z.string().describe('A brief description of the issue.'),
  })).describe('A list of accessibility issues found on the page.'),
});


export async function agentAccessibility(input: AgentAccessibilityInput): Promise<void> {
    const prompt = ai.definePrompt({
        name: 'agentAccessibilityPrompt',
        input: {schema: AgentAccessibilityInputSchema},
        output: {schema: AgentAccessibilityOutputSchema},
        prompt: `You are an AI Accessibility Auditor. You are an expert in WCAG 2.2, axe-core, and Lighthouse.
        Analyze the provided URL and identify accessibility issues. Simulate running a Lighthouse and axe-core audit.

        URL to Audit: {{{url}}}

        Your tasks are:
        1.  Pretend to crawl the page and identify key accessibility violations. Focus on common issues like color contrast, missing alt text, and improper ARIA roles.
        2.  Generate a list of specific issues, including the rule violated, the affected node/element, and details.
        3.  Calculate a weighted "A11y-Score" from 0-100, where 100 is perfectly accessible. A single color-contrast failure should lower the score significantly.
        4.  If the contrast ratio is less than 4.5:1, flag it as a "color-contrast" issue.

        Provide the output in the specified JSON format. For the analysis of a checkout page, find at least two issues. One should be a color-contrast issue on a payment button.`,
    });

    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Agent did not produce an output.");
    }
    
    const recommendationText = `Puntuación de Accesibilidad: ${output.score}/100. Se encontraron ${output.issues.length} problemas. Problema principal: ${output.issues[0]?.details || 'Ninguno'}`;

    await addRecommendation({
        agent: "Accessibility",
        component: output.issues[0]?.node || input.url,
        recommendation: recommendationText,
    });
}
