'use server';

/**
 * @fileOverview An AI agent for generating new component ideas based on user prompts.
 *
 * - generateComponentIdeas - A function that handles the component idea generation process.
 * - GenerateComponentIdeasInput - The input type for the generateComponentIdeas function.
 * - GenerateComponentIdeasOutput - The return type for the generateComponentIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateComponentIdeasInputSchema = z.object({
  prompt: z.string().describe('A natural language prompt describing the desired component.'),
});
export type GenerateComponentIdeasInput = z.infer<typeof GenerateComponentIdeasInputSchema>;

const GenerateComponentIdeasOutputSchema = z.object({
  componentIdeas: z.array(z.string()).describe('An array of generated component ideas.'),
});
export type GenerateComponentIdeasOutput = z.infer<typeof GenerateComponentIdeasOutputSchema>;

export async function generateComponentIdeas(input: GenerateComponentIdeasInput): Promise<GenerateComponentIdeasOutput> {
  return generateComponentIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateComponentIdeasPrompt',
  input: {schema: GenerateComponentIdeasInputSchema},
  output: {schema: GenerateComponentIdeasOutputSchema},
  prompt: `You are a design system expert. Generate a list of component ideas based on the following prompt:\n\nPrompt: {{{prompt}}}`,
});

const generateComponentIdeasFlow = ai.defineFlow(
  {
    name: 'generateComponentIdeasFlow',
    inputSchema: GenerateComponentIdeasInputSchema,
    outputSchema: GenerateComponentIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
