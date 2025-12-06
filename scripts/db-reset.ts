#!/usr/bin/env tsx
/**
 * Script para resetear la base de datos sin borrar datos
 * - Baja y levanta el contenedor (sin eliminar volúmenes)
 * - Aplica migraciones pendientes
 * - No borra datos existentes
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

const DOCKER_COMPOSE_FILE = join(process.cwd(), "docker-compose.yml");
const CONTAINER_NAME = "emi-postgres-dev";

function log(message: string) {
  console.log(`[db:reset] ${message}`);
}

function exec(command: string, options?: { cwd?: string }) {
  try {
    execSync(command, {
      stdio: "inherit",
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
      execSync(`docker exec ${CONTAINER_NAME} pg_isready -U emi_user -d emi_dev`, {
        stdio: "pipe",
      });
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

async function main() {
  log("Iniciando reset de la base de datos (sin borrar datos)...");

  // Verificar que docker-compose.yml existe
  if (!existsSync(DOCKER_COMPOSE_FILE)) {
    throw new Error("docker-compose.yml no encontrado");
  }

  // 1. Bajar contenedor (sin eliminar volúmenes)
  log("Reiniciando contenedor...");
  try {
    exec(`docker compose down`);
  } catch {
    log("Contenedor no estaba corriendo, continuando...");
  }

  // 2. Levantar contenedor
  log("Levantando contenedor...");
  exec(`docker compose up -d postgres`);

  // 3. Esperar a que PostgreSQL esté listo
  await waitForPostgres();

  // 4. Aplicar migraciones pendientes
  log("Aplicando migraciones pendientes...");
  exec(`npx prisma migrate deploy`);

  log("✓ Base de datos reseteada exitosamente (datos preservados)");
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
