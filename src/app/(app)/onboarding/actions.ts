
'use server';

import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, isFirebaseConfigValid } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export async function completeOnboardingStep(stepId: string) {
  if (!isFirebaseConfigValid) {
    console.log("Firebase not configured. Skipping completeOnboardingStep.");
    // In a real scenario, you might want to handle this differently,
    // maybe by updating a local state for the mock user.
    return { success: true, message: "Mock step completed." };
  }

  // This is a placeholder for getting the current user's ID.
  // In a real app with server-side auth, you would get this from the session.
  // For this prototype, we'll assume a way to get the user's ID exists.
  // This part of the code will not work without a proper auth session setup.
  const userId = 'HARDCODED_USER_ID_NEEDS_REPLACEMENT'; 

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const userDocRef = doc(db, 'users', userId);

  try {
    await updateDoc(userDocRef, {
      'onboarding.completed': arrayUnion(stepId),
    });
    // Revalidate paths to update UI that depends on this data
    revalidatePath('/(app)/dashboard', 'page');
    revalidatePath('/(app)/onboarding', 'page');
    revalidatePath('/(app)/layout', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Error completing onboarding step:', error);
    return { success: false, message: 'Failed to update progress.' };
  }
}
