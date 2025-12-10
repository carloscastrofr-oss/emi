/**
 * Prisma Client singleton con inicialización lazy
 */

const globalForPrisma = globalThis as unknown as {
  prisma: import("@prisma/client").PrismaClient | undefined;
};

function ensureDatabaseUrl() {
  if (typeof window !== "undefined") return; // Solo en servidor

  if (!process.env.DATABASE_URL) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { config } = require("dotenv");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { resolve } = require("path");

      // Intentar cargar .env.local primero
      config({ path: resolve(process.cwd(), ".env.local") });

      // Si aún no hay DATABASE_URL, intentar con .env
      if (!process.env.DATABASE_URL) {
        config({ path: resolve(process.cwd(), ".env") });
      }
    } catch (error) {
      console.warn("Error loading .env files:", error);
    }

    // Fallback para desarrollo local
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = "postgresql://emi_user:emi_dev_password@localhost:5432/emi_dev";
      console.warn("Using fallback DATABASE_URL for local development");
    }
  }
}

function getPrismaClient() {
  ensureDatabaseUrl();

  if (!globalForPrisma.prisma) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client");

    // Verificar que DATABASE_URL esté disponible antes de crear el cliente
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL no está configurada. Verifica que .env.local exista y contenga DATABASE_URL."
      );
    }

    try {
      // Prisma 7.1.0 con engine type "client" requiere un adaptador
      // Usar el adaptador oficial de PostgreSQL
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Pool } = require("pg");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaPg } = require("@prisma/adapter-pg");

      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);

      globalForPrisma.prisma = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    } catch (error: any) {
      console.error("Error creating PrismaClient:", error);
      console.error("DATABASE_URL available:", !!process.env.DATABASE_URL);
      if (process.env.DATABASE_URL) {
        console.error("DATABASE_URL value:", process.env.DATABASE_URL.substring(0, 30) + "...");
      }
      throw error;
    }
  }

  return globalForPrisma.prisma;
}

// Proxy para acceso lazy
export const prisma = new Proxy({} as import("@prisma/client").PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
