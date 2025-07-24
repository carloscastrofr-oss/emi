
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
  scopeProducts: z.array(z.string()).min(1, "Define al menos un producto en el alcance."),
  legacyConstraints: z.string().optional(),
  governance: z.object({
      accountableRole: z.string(),
      workflow: z.string(),
  }),
  kpiWeights: z.object({
      csat: z.number(),
      a11y: z.number(),
      adoption: z.number(),
  }),
  budget: z.object({
      usd: z.number().optional(),
      hoursWeek: z.number().optional(),
  }),
  authorUid: z.string().optional(),
});


export type GenerateDesignStrategyInput = z.infer<typeof GenerateDesignStrategyInputSchema>;

const DesignInterpretationSchema = z.object({
    strategicSummary: z.string().describe("Un resumen breve de la estrategia de diseño para un diseñador."),
    componentSuggestions: z.array(z.string()).describe("Una lista de ideas concretas de componentes basadas en el roadmap y las personas."),
    userExperienceGoals: z.string().describe("Objetivos clave de experiencia de usuario en los que centrarse durante la implementación, ponderados por los KPIs."),
    governanceModel: z.string().describe("Recomendaciones sobre cómo implementar el modelo de gobernanza propuesto."),
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
    const scopeMd = data.scopeProducts.map(p => `* ${p}`).join('\n');
    const kpisMd = `* CSAT (Peso: ${data.kpiWeights.csat})\n* Accesibilidad (Peso: ${data.kpiWeights.a11y})\n* Adopción (Peso: ${data.kpiWeights.adoption})`;
    
    return `
# Estrategia de Sistema de Diseño

## 1. Visión y Propuesta de Valor
**Visión:** ${data.vision}
**Propuesta de Valor:** ${data.valueProp}

## 2. Alcance y Gobernanza
**Productos en Alcance:**
${scopeMd}
**Gobernanza:**
* **Rol Responsable:** ${data.governance.accountableRole}
* **Flujo de Trabajo:** ${data.governance.workflow}
**Restricciones Legacy:**
${data.legacyConstraints || "Ninguna especificada."}

## 3. Objetivos y Métricas
**Objetivos y Resultados Clave (OKRs):**
${okrsMd}
**KPIs Prioritarios:**
${kpisMd}

## 4. Usuarios y Principios
**Personas:**
${personasMd}
**Principios de Diseño:**
${principlesMd}

## 5. Presupuesto (Opcional)
* **USD:** ${data.budget.usd || "No especificado"}
* **Horas/Semana:** ${data.budget.hoursWeek || "No especificado"}
    `.trim();
}


export async function generateDesignStrategy(input: GenerateDesignStrategyInput): Promise<GenerateDesignStrategyOutput> {
  return generateDesignStrategyFlow(input);
}

const interpretationPrompt = ai.definePrompt({
    name: 'interpretDesignStrategyPrompt',
    input: { schema: z.object({ markdownContent: z.string(), inputData: GenerateDesignStrategyInputSchema }) },
    output: { schema: DesignInterpretationSchema },
    prompt: `Eres un estratega y coach de diseño experto. Tu tarea es analizar el siguiente documento de estrategia de diseño y los datos de entrada para traducirlo en ideas accionables y creativas para un diseñador UI/UX.

IMPORTANTE: Toda la salida y las respuestas DEBEN estar en español.

Concéntrate en proporcionar consejos concretos, inspiradores y prácticos. Usa el contexto completo, incluyendo presupuesto y restricciones.

Datos de Entrada:
\`\`\`json
{{{json inputData}}}
\`\`\`

Documento de Estrategia de Diseño:
---
{{{markdownContent}}}
---

Basado en TODOS los datos proporcionados, genera lo siguiente:
1.  **Resumen Estratégico:** Un resumen corto y motivador para el equipo de diseño, destacando la misión principal.
2.  **Sugerencias de Componentes:** Piensa en componentes nuevos y específicos que apoyarían directamente los OKRs y el roadmap. Deben ser factibles considerando el presupuesto y las restricciones.
3.  **Objetivos de Experiencia de Usuario:** ¿Cuáles son los objetivos de UX más críticos en los que el diseñador debería centrarse? Pondera su importancia según los pesos de los KPIs definidos.
4.  **Modelo de Gobernanza:** Ofrece consejos prácticos sobre cómo implementar el flujo de trabajo y el rol responsable definidos en el día a día.

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
    
    const { output: interpretationOutput } = await interpretationPrompt({ markdownContent, inputData: data });

    if (!interpretationOutput) {
        throw new Error("The design interpretation agent failed to produce an output.");
    }

    const strategyData = {
        ...data,
        status: 'draft',
        createdAt: serverTimestamp(),
    };

    if (!isFirebaseConfigValid) {
        console.warn("Firebase no está configurado. Se devolverá una estrategia simulada sin guardarla.");
        return {
            strategyId: "mock-strategy-" + Date.now(),
            markdown: markdownContent,
            json: JSON.stringify({ ...strategyData, createdAt: new Date().toISOString() }, null, 2),
            designInterpretation: interpretationOutput,
        };
    }
    
    try {
        const docRef = await addDoc(collection(db, "designStrategies"), strategyData);
        return {
            strategyId: docRef.id,
            markdown: markdownContent,
            json: JSON.stringify(strategyData, null, 2),
            designInterpretation: interpretationOutput,
        };
    } catch (error) {
        console.error("Error al guardar en Firestore: ", error);
        throw new Error("No se pudo guardar la estrategia en la base de datos.");
    }
  }
);
