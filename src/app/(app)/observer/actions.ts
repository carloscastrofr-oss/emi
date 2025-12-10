"use server";

import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db, isFirebaseConfigValid, isFirestoreAvailable } from "@/lib/firebase";
import { revalidatePath } from "next/cache";
import type { ABTest } from "@/types/ab-test";

type NewABTestPayload = Omit<ABTest, "id" | "status" | "createdAt" | "ownerUid">;

export async function createABTest(payload: NewABTestPayload & { ownerUid: string }) {
  if (!isFirebaseConfigValid || !isFirestoreAvailable() || !db) {
    console.log("Firebase no está configurado. Saltando createABTest.");
    // For demo purposes, we can return a success message without actually saving.
    return { success: true, message: "Experimento A/B simulado creado." };
  }

  try {
    const newTest: Omit<ABTest, "id"> = {
      ...payload,
      status: "running",
      createdAt: serverTimestamp() as unknown as Timestamp,
    };
    await addDoc(collection(db, "abTests"), newTest);
    revalidatePath("/(app)/observer");
    return { success: true, message: "Experimento A/B creado exitosamente." };
  } catch (error) {
    console.error("Error al crear el experimento A/B: ", error);
    return { success: false, message: "No se pudo crear el experimento." };
  }
}
