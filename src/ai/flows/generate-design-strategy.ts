'use server';
/**
 * @fileOverview AI-powered Design Strategy Generator.
 *
 * - generateDesignStrategy - A function that generates a design strategy document.
 * - GenerateDesignStrategyInput - The input type for the generateDesignStrategy function.
 * - GenerateDesignStrategyOutput - The return type for the generateDesignStrategy function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigValid } from '@/lib/firebase';

const OKRSchema = z.object({
  objective: z.string(),
  krs: z.string(),
});

const GenerateDesignStrategyInputSchema = z.object({
  vision: z.string().min(1, "La visión es requerida.").max(140),
  valueProp: z.string().min(1, "La propuesta de valor es requerida.").max(200),
  primaryColor: z.string().optional(),
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

const GenerateDesignStrategyOutputSchema = z.object({
  strategyId: z.string(),
  markdown: z.string(),
  json: z.string(),
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

const generateDesignStrategyFlow = ai.defineFlow(
  {
    name: 'generateDesignStrategyFlow',
    inputSchema: GenerateDesignStrategyInputSchema,
    outputSchema: GenerateDesignStrategyOutputSchema,
  },
  async (data) => {

    if (!isFirebaseConfigValid) {
        throw new Error("La configuración de Firebase no es válida. No se puede guardar la estrategia.");
    }
    
    const markdownContent = generateMarkdown(data);
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
    };
  }
);
