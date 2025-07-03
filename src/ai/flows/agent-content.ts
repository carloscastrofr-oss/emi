'use server';
/**
 * @fileOverview AI-powered content agent.
 * - agentContent - Analyzes UX writing and suggests improvements.
 * - AgentContentInput - The input type for the agentContent function.
 * - AgentContentOutput - The return type for the agentContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AgentContentInputSchema = z.object({
  uiText: z.string().describe('Current UI text to be analyzed (e.g., labels, placeholders, error messages).'),
  userFeedback: z.string().optional().describe('User feedback from a feedback collection.'),
});
export type AgentContentInput = z.infer<typeof AgentContentInputSchema>;

const AgentContentOutputSchema = z.object({
  rewriteProposals: z.array(z.object({
    original: z.string(),
    suggestion: z.string(),
    reasoning: z.string(),
  })).describe('Rewrite proposals for labels, placeholders, error messages.'),
  toneAnalysis: z.string().describe('A check on the tone (e.g., formal, friendly, compliant) with suggestions.'),
  accessibilityHints: z.string().describe('Hints for accessibility, such as using labels correctly or improving error message specificity.'),
});
export type AgentContentOutput = z.infer<typeof AgentContentOutputSchema>;

export async function agentContent(input: AgentContentInput): Promise<AgentContentOutput> {
    const prompt = ai.definePrompt({
        name: 'agentContentPrompt',
        input: {schema: AgentContentInputSchema},
        output: {schema: AgentContentOutputSchema},
        prompt: `You are EMI.Agent.Content, a UX writing expert. Analyze the provided UI text and optional user feedback.

        UI Text: "{{uiText}}"
        {{#if userFeedback}}
        User Feedback: "{{userFeedback}}"
        {{/if}}

        Your tasks are:
        1. If the user feedback contains words like "confusing" or "don't understand", suggest a microcopy improvement.
        2. Propose rewrites for any problematic text. For each, provide the original, the suggestion, and reasoning.
        3. Analyze the tone and provide feedback.
        4. Offer accessibility hints to improve the user experience.

        Provide the output in the specified JSON format.`,
    });
    
    const {output} = await prompt(input);
    return output!;
}
