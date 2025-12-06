#!/usr/bin/env tsx
/**
 * Script para setup inicial de la base de datos
 * - Verifica/crea .env.development con DATABASE_URL
 * - Levanta PostgreSQL en Docker
 * - Crea migración inicial
 * - Genera cliente de Prisma
 */

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ENV_FILE = join(process.cwd(), ".env.development");
const DOCKER_COMPOSE_FILE = join(process.cwd(), "docker-compose.yml");
const DATABASE_URL = "postgresql://emi_user:emi_dev_password@localhost:5432/emi_dev";

function log(message: string) {
  console.log(`[db:setup] ${message}`);
}

function exec(command: string, options?: { cwd?: string; stdio?: any }) {
  try {
    execSync(command, {
      stdio: options?.stdio || "inherit",
      cwd: options?.cwd || process.cwd(),
    });
  } catch (error) {
    console.error(`Error ejecutando: ${command}`);
    throw error;
  }
}

async function waitForPostgres(maxRetries = 30) {
  log("Esperando a que PostgreSQL esté listo...");

  for (let i = 0; i < maxRetries; i++) {
    try {
      execSync(`docker exec emi-postgres-dev pg_isready -U emi_user -d emi_dev`, { stdio: "pipe" });
      log("PostgreSQL está listo ✓");
      return;
    } catch {
      if (i === maxRetries - 1) {
        throw new Error("PostgreSQL no está respondiendo después de varios intentos");
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

function setupEnvFile() {
  log("Configurando .env.development...");

  let envContent = "";

  if (existsSync(ENV_FILE)) {
    envContent = readFileSync(ENV_FILE, "utf-8");
    log("Archivo .env.development encontrado");
  } else {
    log("Creando .env.development...");
  }

  // Verificar si DATABASE_URL ya existe
  if (envContent.includes("DATABASE_URL")) {
    log("DATABASE_URL ya existe en .env.development");
    // Actualizar si es necesario
    const lines = envContent.split("\n");
    const updatedLines = lines.map((line) => {
      if (line.startsWith("DATABASE_URL=")) {
        return `DATABASE_URL=${DATABASE_URL}`;
      }
      return line;
    });
    envContent = updatedLines.join("\n");
  } else {
    // Agregar DATABASE_URL
    if (envContent && !envContent.endsWith("\n")) {
      envContent += "\n";
    }
    envContent += `\n# Database\nDATABASE_URL=${DATABASE_URL}\n`;
  }

  writeFileSync(ENV_FILE, envContent);
  log("✓ .env.development configurado");
}

function startPostgres() {
  log("Iniciando PostgreSQL en Docker...");

  if (!existsSync(DOCKER_COMPOSE_FILE)) {
    throw new Error("docker-compose.yml no encontrado");
  }

  // Verificar si el contenedor ya está corriendo
  try {
    execSync(`docker ps --filter name=emi-postgres-dev --format "{{.Names}}"`, {
      stdio: "pipe",
    });
    const isRunning = execSync(`docker ps --filter name=emi-postgres-dev --format "{{.Names}}"`, {
      stdio: "pipe",
      encoding: "utf-8",
    })
      .toString()
      .trim()
      .includes("emi-postgres-dev");

    if (isRunning) {
      log("PostgreSQL ya está corriendo");
      return;
    }
  } catch {
    // Contenedor no existe o no está corriendo
  }

  // Levantar contenedor
  exec(`docker compose up -d postgres`);
  log("✓ PostgreSQL iniciado");
}

async function createInitialMigration() {
  log("Creando migración inicial...");

  // Verificar si ya hay migraciones
  const migrationsDir = join(process.cwd(), "prisma", "migrations");
  if (existsSync(migrationsDir)) {
    const migrations = execSync(`ls -1 "${migrationsDir}"`, {
      encoding: "utf-8",
      stdio: "pipe",
    })
      .toString()
      .trim()
      .split("\n")
      .filter((line) => line.length > 0);

    if (migrations.length > 0) {
      log("Ya existen migraciones, saltando creación inicial");
      return;
    }
  }

  // Crear migración inicial
  try {
    exec(`npx prisma migrate dev --name init --create-only`, {
      stdio: "pipe",
    });
    log("✓ Migración inicial creada");
  } catch (error) {
    log("⚠️  No se pudo crear migración (puede que ya exista)");
  }
}

function generatePrismaClient() {
  log("Generando cliente de Prisma...");
  exec(`npx prisma generate`);
  log("✓ Cliente de Prisma generado");
}

async function main() {
  log("🚀 Iniciando setup de base de datos...\n");

  try {
    // 1. Configurar .env.development
    setupEnvFile();

    // 2. Iniciar PostgreSQL
    startPostgres();

    // 3. Esperar a que PostgreSQL esté listo
    await waitForPostgres();

    // 4. Crear migración inicial (genera cliente automáticamente)
    await createInitialMigration();

    log("\n✅ Setup completado exitosamente!");
    log("\nPróximos pasos:");
    log("  1. Revisa la migración en prisma/migrations/");
    log("  2. Aplica la migración: npm run db:migrate:dev");
    log("  3. (Opcional) Ejecuta seeds: npm run db:seed");
  } catch (error) {
    console.error("\n❌ Error durante el setup:", error);
    process.exit(1);
  }
}

main();
