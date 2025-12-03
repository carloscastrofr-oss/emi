"use server";
/**
 * @fileOverview AI-powered business agent.
 * - agentBusiness - Analyzes component usage against business KPIs.
 * - AgentBusinessInput - The input type for the agentBusiness function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const AgentBusinessInputSchema = z.object({
  kpiData: z
    .string()
    .describe(
      "JSON data correlating component usage with business KPIs like conversion and retention."
    ),
});
export type AgentBusinessInput = z.infer<typeof AgentBusinessInputSchema>;

const AgentBusinessOutputSchema = z.object({
  componentId: z.string().describe("The ID of the component being analyzed."),
  roiEstimate: z
    .string()
    .describe("An estimated Return on Investment (ROI) of using or reusing a specific component."),
  refactorPriority: z
    .string()
    .describe(
      "A suggested priority level (e.g., High, Medium, Low) for refactoring the component."
    ),
  businessRisk: z
    .string()
    .describe(
      "An assessment of business risk from inconsistent or underperforming design system elements."
    ),
});
export type AgentBusinessOutput = z.infer<typeof AgentBusinessOutputSchema>;

const agentBusinessFlow = ai.defineFlow(
  {
    name: "agentBusinessFlow",
    inputSchema: AgentBusinessInputSchema,
    outputSchema: AgentBusinessOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: "agentBusinessPrompt",
      input: { schema: AgentBusinessInputSchema },
      output: { schema: AgentBusinessOutputSchema },
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
        5. Extract the componentId from the input data.

        Provide the output in the specified JSON format.`,
    });

    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Agent did not produce an output.");
    }

    return output;
  }
);

export async function agentBusiness(input: AgentBusinessInput): Promise<AgentBusinessOutput> {
  return agentBusinessFlow(input);
}
