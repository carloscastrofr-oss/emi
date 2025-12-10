#!/usr/bin/env ts-node
/**
 * Script para verificar la configuración de Firebase Admin
 * Ejecutar con: npx tsx scripts/check-firebase-admin.ts
 */

// Cargar variables de entorno
require("dotenv").config({ path: ".env.local" });

import { isFirebaseAdminAvailable, getAdminAuth } from "../src/lib/firebase-admin";

async function checkFirebaseAdmin() {
  console.log("🔍 Verificando configuración de Firebase Admin...\n");

  // Verificar variables de entorno
  const hasCredentialsPath = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const hasCredentialsJson = !!process.env.FIREBASE_ADMIN_CREDENTIALS;
  const hasProjectId =
    !!process.env.FIREBASE_PROJECT_ID || !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  console.log("📋 Variables de entorno:");
  console.log(
    `  ${hasCredentialsPath ? "✅" : "❌"} GOOGLE_APPLICATION_CREDENTIALS: ${
      hasCredentialsPath ? "Configurada" : "No configurada"
    }`
  );
  console.log(
    `  ${hasCredentialsJson ? "✅" : "❌"} FIREBASE_ADMIN_CREDENTIALS: ${
      hasCredentialsJson ? "Configurada" : "No configurada"
    }`
  );
  console.log(
    `  ${hasProjectId ? "✅" : "❌"} FIREBASE_PROJECT_ID o NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${
      hasProjectId
        ? process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        : "No configurado"
    }`
  );
  console.log("");

  // Verificar si Firebase Admin está disponible
  const isAvailable = isFirebaseAdminAvailable();
  const auth = getAdminAuth();

  if (isAvailable && auth) {
    console.log("✅ Firebase Admin está configurado correctamente");
    console.log("   La validación de tokens verificará:");
    console.log("   - ✅ Firma del token");
    console.log("   - ✅ Expiración del token");
    console.log("   - ✅ Token no revocado");
    console.log("");
    return true;
  } else {
    console.log("⚠️  Firebase Admin NO está completamente configurado");
    console.log("   Actualmente usando validación básica:");
    console.log("   - ✅ Expiración del token");
    console.log("   - ❌ Firma del token (NO verificada)");
    console.log("   - ❌ Token revocado (NO verificado)");
    console.log("");
    console.log("📖 Para configurar Firebase Admin:");
    console.log("   1. Ve a Firebase Console → Project Settings → Service Accounts");
    console.log("   2. Genera una nueva clave privada");
    console.log("   3. Configura GOOGLE_APPLICATION_CREDENTIALS o FIREBASE_ADMIN_CREDENTIALS");
    console.log("   4. Ver docs/firebase-admin-setup.md para más detalles");
    console.log("");
    return false;
  }
}

// Ejecutar verificación
checkFirebaseAdmin()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
