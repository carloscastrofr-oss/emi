'use server';
/**
 * @fileOverview AI-powered Design Debt & Governance agent.
 * - agentDesignDebt - Analyzes design debt from various sources.
 * - AgentDesignDebtInput - The input type for the agentDesignDebt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { addRecommendation } from '@/app/(app)/agent/actions';

const AgentDesignDebtInputSchema = z.object({
  designDebtInput: z
    .string()
    .describe('JSON data representing an inventory of Figma components, code references, and issues tagged with "ds-debt".'),
});
export type AgentDesignDebtInput = z.infer<typeof AgentDesignDebtInputSchema>;

const AgentDesignDebtOutputSchema = z.object({
  debtScore: z.number().describe('A calculated Design Debt Score, where a higher score means more debt.'),
  divergentComponents: z.array(z.string()).describe('A list of components that have diverged from the design system.'),
  lostRoi: z.string().describe('An estimate of the lost ROI due to design debt.'),
  migrationPRPrompt: z.string().describe('A prompt to generate a pull request for migrating a component.'),
});

export async function agentDesignDebt(input: AgentDesignDebtInput): Promise<void> {
    const prompt = ai.definePrompt({
        name: 'agentDesignDebtPrompt',
        input: {schema: AgentDesignDebtInputSchema},
        output: {schema: AgentDesignDebtOutputSchema},
        prompt: `You are a Design System Governance AI agent. Analyze the provided data about design debt.

        Design Debt Data:
        \`\`\`json
        {{{designDebtInput}}}
        \`\`\`

        Your tasks are:
        1. Calculate a "Design Debt Score" from 0 to 100 based on the number of divergent components and issues.
        2. Identify the top 3-5 components that are cloned or have diverged.
        3. Estimate the potential lost ROI based on redevelopment costs and inconsistencies.
        4. Generate a prompt for creating a Pull Request to fix one of the key issues.

        Provide the output in the specified JSON format.`,
    });

    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Agent did not produce an output.");
    }

    const recommendationText = `Puntuación de Deuda: ${output.debtScore}/100. ROI perdido estimado: ${output.lostRoi}. Componentes divergentes: ${output.divergentComponents.join(', ')}.`;

    await addRecommendation({
        agent: "Design Debt",
        component: output.divergentComponents[0] || 'Varios',
        recommendation: recommendationText,
    });
}
