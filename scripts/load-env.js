/**
 * Script helper para cargar el archivo .env correcto según APP_ENV
 * Next.js carga automáticamente .env.development cuando NODE_ENV=development,
 * pero nosotros usamos APP_ENV para mayor control.
 *
 * Este script hace merge de las variables de entorno:
 * 1. Carga las variables base de .env.${APP_ENV}
 * 2. Si existe .env.local, preserva las variables personalizadas del usuario
 * 3. Las variables en .env.local tienen prioridad sobre las de .env.${APP_ENV}
 */

const fs = require("fs");
const path = require("path");

const appEnv = process.env.APP_ENV || "development";
const envFile = path.join(process.cwd(), `.env.${appEnv}`);
const localEnvFile = path.join(process.cwd(), ".env.local");

/**
 * Parsea un archivo .env y retorna un objeto con las variables
 */
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf8");
  const vars = {};

  content.split("\n").forEach((line) => {
    // Ignorar comentarios y líneas vacías
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    // Parsear KEY=VALUE
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();

      // Remover comillas si existen
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      vars[key] = value;
    }
  });

  return vars;
}

/**
 * Escribe un objeto de variables a un archivo .env
 */
function writeEnvFile(filePath, vars, baseContent = "") {
  const lines = [];
  const writtenKeys = new Set();

  // Primero, escribir el contenido base (comentarios, etc.) preservando la estructura
  if (baseContent) {
    baseContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const match = trimmed.match(/^([^=]+)=/);
        if (match) {
          const key = match[1].trim();
          if (vars[key] !== undefined) {
            lines.push(`${key}=${vars[key]}`);
            writtenKeys.add(key);
          } else {
            lines.push(line); // Preservar líneas que no están en vars
          }
        } else {
          lines.push(line);
        }
      } else {
        lines.push(line); // Preservar comentarios y líneas vacías
      }
    });
  }

  // Agregar variables que no estaban en el contenido base
  Object.keys(vars).forEach((key) => {
    if (!writtenKeys.has(key)) {
      lines.push(`${key}=${vars[key]}`);
    }
  });

  fs.writeFileSync(filePath, lines.join("\n") + "\n", "utf8");
}

// Leer variables base del archivo de ambiente
const baseVars = parseEnvFile(envFile);
let baseContent = "";

if (fs.existsSync(envFile)) {
  baseContent = fs.readFileSync(envFile, "utf8");
}

// Leer variables existentes en .env.local (si existe)
const localVars = parseEnvFile(localEnvFile);

// Hacer merge: las variables en .env.local tienen prioridad
const mergedVars = { ...baseVars, ...localVars };

// Escribir el resultado
if (fs.existsSync(envFile)) {
  writeEnvFile(localEnvFile, mergedVars, baseContent);
  console.log(
    `✅ Merge completado: .env.${appEnv} + .env.local → .env.local (${Object.keys(mergedVars).length} variables)`
  );
} else {
  if (Object.keys(localVars).length > 0) {
    console.warn(`⚠️  Archivo .env.${appEnv} no encontrado. Preservando .env.local existente.`);
  } else {
    console.warn(`⚠️  Archivo .env.${appEnv} no encontrado y .env.local está vacío.`);
  }
}
