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
    strategicSummary: z.string().describe("Un resumen breve de la estrategia de diseño para un diseñador."),
    componentSuggestions: z.array(z.string()).describe("Una lista de ideas concretas de componentes basadas en el roadmap y las personas."),
    visualDirection: z.string().describe("Sugerencias para la apariencia y el estilo visual, haciendo referencia a los principios de diseño."),
    userExperienceGoals: z.string().describe("Objetivos clave de experiencia de usuario en los que centrarse durante la implementación.")
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
    prompt: `Eres un estratega y coach de diseño experto. Tu tarea es analizar el siguiente documento de estrategia de diseño (en formato Markdown) y traducirlo en ideas accionables y creativas para un diseñador UI/UX.

IMPORTANTE: Toda la salida y las respuestas DEBEN estar en español.

Concéntrate en proporcionar consejos concretos, inspiradores y prácticos.

Documento de Estrategia de Diseño:
---
{{{markdownContent}}}
---

Basado en el documento, proporciona lo siguiente:
1.  **Resumen Estratégico:** Un resumen corto y motivador para el equipo de diseño, destacando la misión principal.
2.  **Sugerencias de Componentes:** Piensa en componentes nuevos y específicos que apoyarían directamente los OKRs y el roadmap. Piensa más allá de lo obvio.
3.  **Dirección Visual:** Describe la apariencia y la sensación. ¿Cómo se pueden traducir los principios de diseño (como el radio, el movimiento) en un lenguaje visual tangible?
4.  **Objetivos de Experiencia de Usuario:** ¿Cuáles son los objetivos de UX más críticos en los que el diseñador debería centrarse para satisfacer a las personas y los KPIs objetivo?

Proporciona la salida en el formato JSON especificado.
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
