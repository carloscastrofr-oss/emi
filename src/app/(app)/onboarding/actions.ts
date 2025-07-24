
'use server';

import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigValid } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export async function completeOnboardingStep(userId: string | null, stepId: string): Promise<{ success: boolean; message?: string }> {
  if (!isFirebaseConfigValid) {
    console.log("Firebase no está configurado. Saltando completeOnboardingStep.");
    return { success: true, message: "Paso de onboarding simulado completado." };
  }

  // El UID del usuario debe pasarse como argumento desde un componente de cliente que tenga acceso a él.
  if (!userId) {
    console.warn('No se proporcionó un UID de usuario a la acción del servidor. No se puede completar el paso de onboarding.');
    return { success: false, message: 'Usuario no autenticado.' };
  }

  const userDocRef = doc(db, 'users', userId);

  try {
    await updateDoc(userDocRef, {
      'onboarding.completed': arrayUnion(stepId),
      'onboarding.updatedAt': serverTimestamp(),
    });
    // Revalidar rutas para actualizar la UI que depende de estos datos
    revalidatePath('/(app)/dashboard', 'page');
    revalidatePath('/(app)/onboarding', 'page');
    revalidatePath('/(app)/layout', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Error al completar el paso de onboarding:', error);
    return { success: false, message: 'No se pudo actualizar el progreso.' };
  }
}
