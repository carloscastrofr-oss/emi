"use server";

import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigValid } from "@/lib/firebase";
import { revalidatePath } from "next/cache";

export async function assignRisk(
  riskId: string,
  assigneeUid: string,
  assigneeName: string,
  assignerUid: string
) {
  if (!isFirebaseConfigValid) {
    console.warn("Firebase no está configurado. Saltando assignRisk.");
    // For demo purposes, we can return a success message without actually saving.
    return { success: true, message: "Riesgo simulado asignado." };
  }

  if (!riskId || !assigneeUid || !assigneeName || !assignerUid) {
    return { success: false, message: "Faltan datos para la asignación." };
  }

  const riskRef = doc(db, "risks", riskId);

  try {
    await updateDoc(riskRef, {
      ownerUid: assigneeUid,
      ownerName: assigneeName,
      status: "in-progress",
      updatedAt: serverTimestamp(),
      history: arrayUnion({
        action: "assigned",
        byUid: assignerUid,
        toUid: assigneeUid,
        at: serverTimestamp(),
      }),
    });
    revalidatePath("/(app)/risk");
    return { success: true };
  } catch (error) {
    console.error("Error al asignar el riesgo:", error);
    return { success: false, message: "No se pudo asignar el riesgo." };
  }
}
