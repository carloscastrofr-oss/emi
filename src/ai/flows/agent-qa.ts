'use server';
/**
 * @fileOverview AI-powered QA agent.
 * - agentQA - Analyzes usability failures and suggests improvements.
 * - AgentQaInput - The input type for the agentQA function.
 * - AgentQaOutput - The return type for the agentQA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AgentQaInputSchema = z.object({
  errorEvents: z
    .string()
    .describe('JSON data representing UI error events, like `ui_error` or `form_failure`.'),
});
export type AgentQaInput = z.infer<typeof AgentQaInputSchema>;

const AgentQaOutputSchema = z.object({
  highErrorRateComponents: z.array(z.string()).describe('A list of component names flagged for high error rates.'),
  validationSuggestions: z.string().describe('Suggestions for real-time validation or structural fixes to prevent errors.'),
  testRecommendations: z.string().describe('Recommendations for new test cases or QA checklist items.'),
});
export type AgentQaOutput = z.infer<typeof AgentQaOutputSchema>;

export async function agentQA(input: AgentQaInput): Promise<AgentQaOutput> {
    const prompt = ai.definePrompt({
        name: 'agentQaPrompt',
        input: {schema: AgentQaInputSchema},
        output: {schema: AgentQaOutputSchema},
        prompt: `You are EMI.Agent.QA, a quality assurance expert. Analyze the provided UI error event data.

        Error Events Data:
        \`\`\`json
        {{{errorEvents}}}
        \`\`\`

        Your tasks are:
        1. Identify patterns of usability failures or interaction bugs.
        2. Flag components that have a high error rate.
        3. Suggest improvements to validation logic or component structure to fix these issues.
        4. Recommend new test cases or items to add to a QA checklist.

        Provide the output in the specified JSON format.`,
    });
    
    const {output} = await prompt(input);
    return output!;
}
