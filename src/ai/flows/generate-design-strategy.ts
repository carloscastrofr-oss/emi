
'use server';
/**
 * @fileOverview AI-powered Design Strategy Generator.
 *
 * - generateDesignStrategy - A function that generates a design strategy document.
 * - GenerateDesignStrategyInput - The input type for the generateDesignStrategy function.
 * - GenerateDesignStrategyOutput - The return type for the generateDesignStrategy function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigValid } from '@/lib/firebase';

const OKRSchema = z.object({
  objective: z.string(),
  krs: z.string(),
});

const GenerateDesignStrategyInputSchema = z.object({
  vision: z.string().min(1, "La visión es requerida.").max(140),
  valueProp: z.string().min(1, "La propuesta de valor es requerida.").max(200),
  okrs: z.array(OKRSchema).min(1).max(3),
  personas: z.array(z.string()).min(1).max(5),
  principles: z.array(z.string()).min(1).max(5),
  pages: z.array(z.string()).min(1).max(3),
  kpis: z.array(z.string()).min(1).max(3),
  componentsRoadmap: z.array(z.string()).min(1).max(5),
  risks: z.array(z.string()).max(3),
  milestones: z.array(z.string()).max(5),
  authorUid: z.string().optional(),
});

export type GenerateDesignStrategyInput = z.infer<typeof GenerateDesignStrategyInputSchema>;

const DesignInterpretationSchema = z.object({
    strategicSummary: z.string().describe("A brief summary of the design strategy for a designer."),
    componentSuggestions: z.array(z.string()).describe("A list of concrete component ideas based on the roadmap and personas."),
    visualDirection: z.string().describe("Suggestions for the visual look and feel, referencing the design principles."),
    userExperienceGoals: z.string().describe("Key user experience goals to focus on during implementation.")
});

const GenerateDesignStrategyOutputSchema = z.object({
  strategyId: z.string(),
  markdown: z.string(),
  json: z.string(),
  designInterpretation: DesignInterpretationSchema,
});
export type GenerateDesignStrategyOutput = z.infer<typeof GenerateDesignStrategyOutputSchema>;


function generateMarkdown(data: GenerateDesignStrategyInput): string {
    const okrsMd = data.okrs.map(okr => `* **${okr.objective}**\n  * ${okr.krs.split('\n').join('\n  * ')}`).join('\n\n');
    const personasMd = data.personas.map(p => `* ${p}`).join('\n');
    const principlesMd = data.principles.map(p => `* ${p}`).join('\n');
    const pagesMd = data.pages.map(p => `* \`${p}\``).join('\n');
    const kpisMd = data.kpis.map(k => `* ${k}`).join('\n');
    const roadmapMd = data.componentsRoadmap.map(c => `* ${c}`).join('\n');
    const risksMd = data.risks.map(r => `* ${r}`).join('\n');
    const milestonesMd = data.milestones.map(m => `* ${m}`).join('\n');

    return `
# Visión
${data.vision}

## Propuesta de Valor
${data.valueProp}

## 🎯 Objetivos y Resultados Clave (OKRs)
${okrsMd}

## 👥 Personas
${personasMd}

## ⚖️ Principios de Diseño
${principlesMd}

## 🗺️ Alcance (Páginas Clave)
${pagesMd}

## 📊 KPIs de UX
${kpisMd}

## 🛣️ Road-map de Componentes
${roadmapMd}

## ⚠️ Riesgos
${risksMd}

## 🏁 Hitos (Milestones)
${milestonesMd}
    `.trim();
}


export async function generateDesignStrategy(input: GenerateDesignStrategyInput): Promise<GenerateDesignStrategyOutput> {
  return generateDesignStrategyFlow(input);
}

const interpretationPrompt = ai.definePrompt({
    name: 'interpretDesignStrategyPrompt',
    input: { schema: z.object({ markdownContent: z.string() }) },
    output: { schema: DesignInterpretationSchema },
    prompt: `You are an expert design strategist and coach. Your task is to analyze the following design strategy document (in Markdown format) and translate it into actionable insights and creative ideas for a UI/UX designer.

Focus on providing concrete, inspiring, and practical advice.

Design Strategy Document:
---
{{{markdownContent}}}
---

Based on the document, provide the following:
1.  **Strategic Summary:** A short, motivational summary for the design team, highlighting the core mission.
2.  **Component Suggestions:** Brainstorm specific, new components that would directly support the OKRs and roadmap. Think beyond the obvious.
3.  **Visual Direction:** Describe the look and feel. How can the design principles (like radius, motion) be translated into a tangible visual language?
4.  **User Experience Goals:** What are the most critical UX goals the designer should focus on to satisfy the target personas and KPIs?

Provide the output in the specified JSON format.
`,
});


const generateDesignStrategyFlow = ai.defineFlow(
  {
    name: 'generateDesignStrategyFlow',
    inputSchema: GenerateDesignStrategyInputSchema,
    outputSchema: GenerateDesignStrategyOutputSchema,
  },
  async (data) => {
    const markdownContent = generateMarkdown(data);
    
    const { output: interpretationOutput } = await interpretationPrompt({ markdownContent });
    if (!interpretationOutput) {
        throw new Error("The design interpretation agent failed to produce an output.");
    }

    if (!isFirebaseConfigValid) {
        console.warn("Firebase no está configurado. Se devolverá una estrategia simulada sin guardarla.");
        const mockStrategyData = {
            ...data,
            status: 'draft',
        };
        return {
            strategyId: "mock-strategy-" + Date.now(),
            markdown: markdownContent,
            json: JSON.stringify(mockStrategyData, null, 2),
            designInterpretation: interpretationOutput,
        };
    }
    
    const strategyData = {
        ...data,
        status: 'draft',
        createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "designStrategies"), strategyData);

    return {
        strategyId: docRef.id,
        markdown: markdownContent,
        json: JSON.stringify(strategyData, null, 2),
        designInterpretation: interpretationOutput,
    };
  }
);
