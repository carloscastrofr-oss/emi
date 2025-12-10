import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { env, isFirebaseConfigValid as validateFirebaseConfig } from "@/lib/env";

// Usar la configuración desde el módulo de ambiente
export const firebaseConfig = env.firebase;

// Validar la configuración usando el helper del módulo de ambiente
export const isFirebaseConfigValid = validateFirebaseConfig();

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigValid) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    app = null;
    db = null;
    auth = null;
  }
} else {
  console.warn(
    "Firebase configuration is incomplete or contains placeholder values. Firebase features will be disabled. Please update your .env file."
  );
}

/**
 * Helper para verificar si Firebase Auth está disponible
 */
export function isAuthAvailable(): boolean {
  return auth !== null && typeof auth === "object" && "onAuthStateChanged" in auth;
}

/**
 * Helper para verificar si Firestore está disponible
 */
export function isFirestoreAvailable(): boolean {
  return db !== null && typeof db === "object";
}

export { app, db, auth };
