
'use server';

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigValid } from "@/lib/firebase";

// Import all agent flows
import { agentAccessibility } from "@/ai/flows/agent-accessibility";
import { agentDesign } from "@/ai/flows/agent-design";
import { agentContent } from "@/ai/flows/agent-content";
import { agentQA } from "@/ai/flows/agent-qa";
import { agentBusiness } from "@/ai/flows/agent-business";
import { agentDesignDebt } from "@/ai/flows/agent-design-debt";

export interface Recommendation {
  agent: "Accessibility" | "Design" | "Content" | "QA" | "Business" | "Design Debt";
  component: string,
  recommendation: string,
  figmaPrompt?: string,
}

export async function addRecommendation(recommendation: Recommendation) {
  if (!isFirebaseConfigValid) {
    console.log("Firebase no está configurado. Saltando addRecommendation.");
    console.log("Datos de la recomendación:", recommendation);
    return;
  }

  if (!recommendation.agent || !recommendation.component || !recommendation.recommendation) {
    throw new Error("Datos de recomendación no válidos.");
  }
  
  try {
    await addDoc(collection(db, "recommendations"), {
      ...recommendation,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.error("Error al añadir el documento: ", e);
    throw new Error("No se pudo añadir la recomendación a Firestore.");
  }
}

// Server action to run a specific agent flow by name
export async function runAgent(agentName: string, input: any): Promise<any> {
  switch (agentName) {
    case 'accessibility':
      return agentAccessibility(input);
    case 'design':
      return agentDesign(input);
    case 'content':
      return agentContent(input);
    case 'qa':
      return agentQA(input);
    case 'business':
      return agentBusiness(input);
    case 'design-debt':
        return agentDesignDebt(input);
    default:
      throw new Error(`Agent "${agentName}" not found.`);
  }
}
