'use server';
/**
 * @fileOverview AI-powered business agent.
 * - agentBusiness - Analyzes component usage against business KPIs.
 * - AgentBusinessInput - The input type for the agentBusiness function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { addRecommendation } from '@/app/(app)/agent/actions';


const AgentBusinessInputSchema = z.object({
  kpiData: z
    .string()
    .describe('JSON data correlating component usage with business KPIs like conversion and retention.'),
});
export type AgentBusinessInput = z.infer<typeof AgentBusinessInputSchema>;

const AgentBusinessOutputSchema = z.object({
  roiEstimate: z.string().describe('An estimated Return on Investment (ROI) of using or reusing a specific component.'),
  refactorPriority: z.string().describe('A suggested priority level (e.g., High, Medium, Low) for refactoring the component.'),
  businessRisk: z.string().describe('An assessment of business risk from inconsistent or underperforming design system elements.'),
});

export async function agentBusiness(input: AgentBusinessInput): Promise<void> {
    const prompt = ai.definePrompt({
        name: 'agentBusinessPrompt',
        input: {schema: AgentBusinessInputSchema},
        output: {schema: AgentBusinessOutputSchema},
        prompt: `You are a business analyst AI agent specializing in design systems. Analyze the provided data correlating component usage with business KPIs.

        KPI Data:
        \`\`\`json
        {{{kpiData}}}
        \`\`\`

        Your tasks are:
        1. If the 'impact' is negative, suggest revising the layout or messaging.
        2. Estimate the ROI of using/reusing the component.
        3. Suggest a priority level for refactoring the component based on its business impact.
        4. Indicate the business risk associated with this component or inconsistent design system elements.

        Provide the output in the specified JSON format.`,
    });

    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Agent did not produce an output.");
    }
    
    let componentId = "Unknown Component";
    try {
        // Safely parse the input JSON
        const kpiDataObject = JSON.parse(input.kpiData);
        componentId = kpiDataObject.componentId || componentId;
    } catch(e) {
        console.error("Could not parse kpiData JSON in agent-business flow:", e);
        // Keep componentId as "Unknown Component" and continue
    }

    const recommendationText = `Business Risk: ${output.businessRisk}. Refactor Priority: ${output.refactorPriority}. Estimated ROI: ${output.roiEstimate}.`;

    await addRecommendation({
        agent: "Business",
        component: componentId,
        recommendation: recommendationText,
    });
}
