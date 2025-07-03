'use server';
/**
 * @fileOverview AI-powered design agent.
 * - agentDesign - Analyzes design properties and suggests improvements.
 * - AgentDesignInput - The input type for the agentDesign function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { addRecommendation } from '@/app/(app)/agent/actions';

const AgentDesignInputSchema = z.object({
  componentUsage: z
    .string()
    .describe('JSON data representing component usage, including token values, visual properties, and accessibility metrics.'),
});
export type AgentDesignInput = z.infer<typeof AgentDesignInputSchema>;

const AgentDesignOutputSchema = z.object({
  contrastScore: z.string().describe('The calculated contrast score of the component.'),
  designTokenSuggestions: z.object({
    colors: z.array(z.string()).describe('Suggested new color tokens.'),
    spacing: z.array(z.string()).describe('Suggested new spacing tokens.'),
    typography: z.array(z.string()).describe('Suggested new typography tokens.'),
  }).describe('Suggestions for updating design tokens.'),
  layoutImprovements: z.string().describe('Suggestions for layout or responsiveness improvements.'),
  figmaPrompt: z.string().describe('A prompt for Figma to generate an improved component variant.'),
});

export async function agentDesign(input: AgentDesignInput): Promise<void> {
  const prompt = ai.definePrompt({
    name: 'agentDesignPrompt',
    input: {schema: AgentDesignInputSchema},
    output: {schema: AgentDesignOutputSchema},
    prompt: `You are EMI.Agent.Design, an expert in design systems. Analyze the provided component usage data.

    Component Usage Data:
    \`\`\`json
    {{{componentUsage}}}
    \`\`\`

    Your tasks are:
    1.  Analyze token values, visual properties, and accessibility metrics.
    2.  If the contrast_ratio is less than 4.5, suggest a better color and formulate a recommendation.
    3.  Suggest updated design tokens (colors, spacing, typography).
    4.  Suggest layout or responsiveness improvements.
    5.  Generate a detailed prompt for Figma to create an improved version of the component based on the findings.

    Provide the output in the specified JSON format.`,
  });

  const {output} = await prompt(input);
  if (!output) {
    throw new Error("Agent did not produce an output.");
  }
  
  let componentId = "Unknown Component";
  try {
    const componentUsageData = JSON.parse(input.componentUsage);
    componentId = componentUsageData.componentId || componentId;
  } catch (e) {
    console.error("Could not parse componentUsage JSON");
  }


  const recommendationText = `Contrast Score of ${output.contrastScore} is too low. ${output.layoutImprovements}. Consider updating tokens:
- Colors: ${output.designTokenSuggestions.colors.join(', ')}
- Spacing: ${output.designTokenSuggestions.spacing.join(', ')}
- Typography: ${output.designTokenSuggestions.typography.join(', ')}`.trim();

  await addRecommendation({
    agent: "Design",
    component: componentId,
    recommendation: recommendationText,
    figmaPrompt: output.figmaPrompt,
  });
}
