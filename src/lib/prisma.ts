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
      config({ path: resolve(process.cwd(), ".env.local") });
    } catch {
      // Ignorar errores
    }

    // Fallback para desarrollo
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = "postgresql://emi_user:emi_dev_password@localhost:5432/emi_dev";
    }
  }
}

function getPrismaClient() {
  ensureDatabaseUrl();

  if (!globalForPrisma.prisma) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client");
    globalForPrisma.prisma = new PrismaClient();
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
