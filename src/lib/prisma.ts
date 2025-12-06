/**
 * Prisma Client singleton
 * En Prisma 7, la URL se pasa al constructor o se lee de prisma.config.ts
 */

import { PrismaClient } from "@prisma/client";

// En Prisma 7, la URL se configura en prisma.config.ts
// o se puede pasar directamente al constructor
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // La URL se lee automáticamente de DATABASE_URL en prisma.config.ts
    // Si necesitas pasarla explícitamente, puedes hacerlo así:
    // datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
