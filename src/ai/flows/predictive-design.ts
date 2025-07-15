'use server';
/**
 * @fileOverview Agent for Predictive Design.
 * Generates journey maps and wireframes from a planning document.
 *
 * - predictiveDesign - The main flow function.
 */

import { ai } from '@/ai/genkit';
import { PredictiveDesignInputSchema, PredictiveDesignOutputSchema, type PredictiveDesignInput, type PredictiveDesignOutput } from '@/types/predictive-design';

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

// This function is now just a wrapper and might be deprecated if the new server action is used directly.
export async function predictiveDesign(input: PredictiveDesignInput): Promise<PredictiveDesignOutput> {
  return predictiveDesignFlow(input);
}
