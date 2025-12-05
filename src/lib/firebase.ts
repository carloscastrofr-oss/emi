import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { env, isFirebaseConfigValid as validateFirebaseConfig } from "@/lib/env";

// Usar la configuración desde el módulo de ambiente
export const firebaseConfig = env.firebase;

// Validar la configuración usando el helper del módulo de ambiente
export const isFirebaseConfigValid = validateFirebaseConfig();

let app: FirebaseApp;
let db: Firestore;

if (isFirebaseConfigValid) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
} else {
  console.warn(
    "Firebase configuration is incomplete or contains placeholder values. Firebase features will be disabled. Please update your .env file."
  );
  app = {} as FirebaseApp; // Use a dummy object to avoid crashing
  db = {} as Firestore; // Use a dummy object to avoid crashing
}

export { app, db };
