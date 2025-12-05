/**
 * Script helper para cargar el archivo .env correcto según APP_ENV
 * Next.js carga automáticamente .env.development cuando NODE_ENV=development,
 * pero nosotros usamos APP_ENV para mayor control.
 */

const fs = require("fs");
const path = require("path");

const appEnv = process.env.APP_ENV || "development";
const envFile = path.join(process.cwd(), `.env.${appEnv}`);
const localEnvFile = path.join(process.cwd(), ".env.local");

if (fs.existsSync(envFile)) {
  fs.copyFileSync(envFile, localEnvFile);
  console.log(`✅ Cargado .env.${appEnv} como .env.local`);
} else {
  console.warn(`⚠️  Archivo .env.${appEnv} no encontrado. Usando .env.local si existe.`);
}
