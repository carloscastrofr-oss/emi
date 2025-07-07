
'use server';

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigValid } from "@/lib/firebase";

export interface Recommendation {
  agent: "Design" | "Content" | "QA" | "Business",
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
