/**
 * Readiness check endpoint
 * Verifica que todos los servicios externos (DB, Firebase) estén disponibles
 * GET /api/ready
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isFirebaseConfigValid } from "@/lib/firebase";
import { isFirebaseAdminAvailable } from "@/lib/firebase-admin";

interface HealthCheck {
  service: string;
  status: "healthy" | "unhealthy";
  message?: string;
}

export async function GET() {
  const checks: HealthCheck[] = [];
  let allHealthy = true;

  // Check 1: Database (Prisma)
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push({
      service: "database",
      status: "healthy",
    });
  } catch (error) {
    allHealthy = false;
    checks.push({
      service: "database",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Database connection failed",
    });
  }

  // Check 2: Firebase Client Config
  try {
    const firebaseValid = isFirebaseConfigValid;
    checks.push({
      service: "firebase_client",
      status: firebaseValid ? "healthy" : "unhealthy",
      message: firebaseValid ? undefined : "Firebase client configuration is invalid",
    });
    if (!firebaseValid) allHealthy = false;
  } catch (error) {
    allHealthy = false;
    checks.push({
      service: "firebase_client",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Firebase client check failed",
    });
  }

  // Check 3: Firebase Admin (opcional, puede no estar configurado en desarrollo)
  try {
    const adminAvailable = isFirebaseAdminAvailable();
    checks.push({
      service: "firebase_admin",
      status: adminAvailable ? "healthy" : "unhealthy",
      message: adminAvailable ? undefined : "Firebase Admin is not configured (this is optional)",
    });
    // No marcamos como unhealthy si Firebase Admin no está disponible
    // ya que es opcional en algunos ambientes
  } catch (error) {
    checks.push({
      service: "firebase_admin",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Firebase Admin check failed",
    });
  }

  const statusCode = allHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: allHealthy ? "ready" : "not_ready",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: statusCode }
  );
}
