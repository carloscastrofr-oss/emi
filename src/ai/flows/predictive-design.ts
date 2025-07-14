'use server';
/**
 * @fileOverview Agent for Predictive Design.
 * Generates journey maps and wireframes from a planning document.
 *
 * - predictiveDesign - The main flow function.
 * - PredictiveDesignInput - The input type for the flow.
 * - PredictiveDesignOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const PredictiveDesignInputSchema = z.object({
  planningFileId: z.string().describe('ID or URL of the quarterly planning Excel file.'),
  maxScreens: z.number().int().positive().describe('Maximum number of screens to generate per flow.'),
  figmaFileId: z.string().describe('The destination Figma file ID to insert the frames into.'),
});
export type PredictiveDesignInput = z.infer<typeof PredictiveDesignInputSchema>;

export const PredictiveDesignOutputSchema = z.object({
  status: z.enum(['ready', 'error']),
  journeyUrls: z.array(z.string().url()).describe('An array of URLs to the generated FigJam journey maps.'),
  wireframeFrames: z.array(z.string()).describe('An array of Figma frame IDs for the generated wireframes.'),
  log: z.string().describe('A summary of the process, success, or error message.'),
});
export type PredictiveDesignOutput = z.infer<typeof PredictiveDesignOutputSchema>;

// This is a simulation. In a real scenario, this flow would:
// 1. Fetch and parse the Excel file.
// 2. Validate columns (`Feature`, `UserStory`, `Steps`, `Priority`).
// 3. Loop through rows and call a sub-flow or prompt for each feature.
// 4. The sub-flow would call the FigJam and Figma APIs (or plugins).
// 5. Aggregate the results and return them.
const predictiveDesignFlow = ai.defineFlow(
  {
    name: 'predictiveDesignFlow',
    inputSchema: PredictiveDesignInputSchema,
    outputSchema: PredictiveDesignOutputSchema,
  },
  async (input) => {
    // Simulate a successful run with mock data
    console.log('Simulating Predictive Design Flow with input:', input);

    // Simulate checking the Excel file. If a specific keyword is present, return an error.
    if (input.planningFileId.includes('error')) {
      return {
        status: 'error',
        journeyUrls: [],
        wireframeFrames: [],
        log: 'Error: El archivo de planning no contiene las columnas obligatorias: `Feature`, `UserStory`, `Steps`, `Priority`.',
      };
    }
    
    // Simulate a delay to make it feel like a real process
    await new Promise(resolve => setTimeout(resolve, 2500));

    return {
      status: 'ready',
      journeyUrls: [
        'https://www.figma.com/file/LKQ4FJ4E22B5W60W5C42C1/Untitled?type=whiteboard&node-id=0-1&t=pYqjV3qg8iY7s6E5-0',
        'https://www.figma.com/file/LKQ4FJ4E22B5W60W5C42C1/Untitled?type=whiteboard&node-id=0-2&t=pYqjV3qg8iY7s6E5-0'
      ],
      wireframeFrames: ['123:456', '123:789', '123:101'],
      log: 'Feature "Onboarding" y "Checkout" procesadas con éxito. Se generaron 2 journeys y 3 wireframes.',
    };
  }
);

export async function predictiveDesign(input: PredictiveDesignInput): Promise<PredictiveDesignOutput> {
  return predictiveDesignFlow(input);
}
