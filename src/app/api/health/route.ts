/**
 * Health check endpoint
 * Usado por Cloud Run y otros servicios para verificar que la aplicación está corriendo
 * GET /api/health
 */

import { NextResponse } from "next/server";

const startTime = Date.now();

export async function GET() {
  try {
    const uptime = Math.floor((Date.now() - startTime) / 1000); // segundos

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime,
        version: process.env.npm_package_version || "0.1.0",
        environment: process.env.APP_ENV || process.env.NODE_ENV || "unknown",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
