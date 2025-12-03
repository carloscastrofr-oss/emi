"use server";
/**
 * @fileOverview AI-powered QA agent.
 * - agentQA - Analyzes usability failures and suggests improvements.
 * - AgentQaInput - The input type for the agentQA function.
 * - AgentQaOutput - The return type for the agentQA function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const AgentQaInputSchema = z.object({
  qaData: z
    .string()
    .describe("JSON data representing UI error events, like `ui_error` or `form_failure`."),
});
export type AgentQaInput = z.infer<typeof AgentQaInputSchema>;

const AgentQaOutputSchema = z.object({
  component: z.string().describe("The component being analyzed"),
  highErrorRateComponents: z
    .array(z.string())
    .describe("A list of component names flagged for high error rates."),
  validationSuggestions: z
    .string()
    .describe("Suggestions for real-time validation or structural fixes to prevent errors."),
  testRecommendations: z
    .string()
    .describe("Recommendations for new test cases or QA checklist items."),
});
export type AgentQaOutput = z.infer<typeof AgentQaOutputSchema>;

const agentQaFlow = ai.defineFlow(
  {
    name: "agentQaFlow",
    inputSchema: AgentQaInputSchema,
    outputSchema: AgentQaOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: "agentQaPrompt",
      input: { schema: AgentQaInputSchema },
      output: { schema: AgentQaOutputSchema },
      prompt: `You are a quality assurance expert AI agent. Analyze the provided UI QA data.

        QA Data:
        \`\`\`json
        {{{qaData}}}
        \`\`\`

        Your tasks are:
        1. If the error_rate is above 30%, suggest real-time validation or structural fixes.
        2. Identify patterns of usability failures or interaction bugs.
        3. Flag components that have a high error rate.
        4. Recommend new test cases or items to add to a QA checklist.
        5. Extract the component name from the input data.

        Provide the output in the specified JSON format.`,
    });

    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Agent did not produce an output.");
    }

    return output;
  }
);

export async function agentQA(input: AgentQaInput): Promise<AgentQaOutput> {
  return agentQaFlow(input);
}
