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
