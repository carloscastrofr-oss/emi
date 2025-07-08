'use server';

import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, isFirebaseConfigValid } from "@/lib/firebase";
import { revalidatePath } from "next/cache";
import type { ComponentRequest, RequestStatus } from "@/types/component-request";

// This is a subset of the ComponentRequest type for creating a new one.
type NewRequestPayload = Pick<ComponentRequest, 'title' | 'description' | 'priority' | 'figmaFileUrl'> & { requesterUid: string };

export async function submitComponentRequest(payload: NewRequestPayload) {
  if (!isFirebaseConfigValid) {
    console.log("Firebase no está configurado. Saltando submitComponentRequest.");
    return { success: false, message: "La configuración de Firebase no es válida." };
  }
  
  try {
    const newRequest = {
      ...payload,
      status: "Solicitado",
      championUid: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      history: [{
        status: "Solicitado",
        byUid: payload.requesterUid,
        at: serverTimestamp(),
      }],
    };
    await addDoc(collection(db, "componentRequests"), newRequest);
    revalidatePath('/(app)/workbench'); // Revalidate the entire workbench page
    return { success: true };
  } catch (error) {
    console.error("Error al crear la solicitud: ", error);
    return { success: false, message: "No se pudo crear la solicitud." };
  }
}
