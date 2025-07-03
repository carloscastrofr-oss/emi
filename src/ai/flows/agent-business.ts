'use server';
/**
 * @fileOverview AI-powered business agent.
 * - agentBusiness - Analyzes component usage against business KPIs.
 * - AgentBusinessInput - The input type for the agentBusiness function.
 * - AgentBusinessOutput - The return type for the agentBusiness function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AgentBusinessInputSchema = z.object({
  kpiData: z
    .string()
    .describe('JSON data correlating component usage with business KPIs like conversion and retention.'),
});
export type AgentBusinessInput = z.infer<typeof AgentBusinessInputSchema>;

export const AgentBusinessOutputSchema = z.object({
  roiEstimate: z.string().describe('An estimated Return on Investment (ROI) of using or reusing a specific component.'),
  refactorPriority: z.string().describe('A suggested priority level (e.g., High, Medium, Low) for refactoring the component.'),
  businessRisk: z.string().describe('An assessment of business risk from inconsistent or underperforming design system elements.'),
});
export type AgentBusinessOutput = z.infer<typeof AgentBusinessOutputSchema>;

export async function agentBusiness(input: AgentBusinessInput): Promise<AgentBusinessOutput> {
    const prompt = ai.definePrompt({
        name: 'agentBusinessPrompt',
        input: {schema: AgentBusinessInputSchema},
        output: {schema: AgentBusinessOutputSchema},
        prompt: `You are EMI.Agent.Business, a business analyst specializing in design systems. Analyze the provided data correlating component usage with business KPIs.

        KPI Data:
        \`\`\`json
        {{{kpiData}}}
        \`\`\`

        Your tasks are:
        1. Estimate the ROI of using/reusing the component.
        2. Suggest a priority level for refactoring the component based on its business impact.
        3. Indicate the business risk associated with this component or inconsistent design system elements.

        Provide the output in the specified JSON format.`,
    });

    const {output} = await prompt(input);
    return output!;
}
