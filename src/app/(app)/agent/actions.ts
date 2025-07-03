'use server';

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Recommendation {
  agent: "Design" | "Content" | "QA" | "Business",
  component: string,
  recommendation: string,
  figmaPrompt?: string,
}

export async function addRecommendation(recommendation: Recommendation) {
  if (!recommendation.agent || !recommendation.component || !recommendation.recommendation) {
    throw new Error("Invalid recommendation data.");
  }
  
  try {
    await addDoc(collection(db, "recommendations"), {
      ...recommendation,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Could not add recommendation to Firestore.");
  }
}
