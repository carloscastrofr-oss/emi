/**
 * Configuración de ambiente
 * Detecta automáticamente el ambiente y carga las variables de entorno correspondientes
 * Preparado para migración a Secret Manager de GCP
 */

// =============================================================================
// TIPOS
// =============================================================================

export type Environment = "development" | "qa" | "production";

export interface EnvConfig {
  // Ambiente actual
  environment: Environment;
  isDevelopment: boolean;
  isQA: boolean;
  isProduction: boolean;

  // Firebase
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };

  // API
  apiUrl: string;
  apiTimeout: number;

  // App
  appName: string;
  appVersion: string;
  nodeEnv: string;

  // Feature flags
  enableDebugTools: boolean;
  enableAnalytics: boolean;
}

// =============================================================================
// DETECCIÓN DE AMBIENTE
// =============================================================================

/**
 * Detecta el ambiente actual basado en:
 * 1. APP_ENV (variable personalizada)
 * 2. NODE_ENV (estándar de Node.js)
 * 3. VERCEL_ENV (si está en Vercel)
 */
function detectEnvironment(): Environment {
  // Prioridad 1: Variable personalizada APP_ENV
  const appEnv = process.env.APP_ENV?.toLowerCase();
  if (appEnv === "development" || appEnv === "dev") return "development";
  if (appEnv === "qa" || appEnv === "test") return "qa";
  if (appEnv === "production" || appEnv === "prod") return "production";

  // Prioridad 2: VERCEL_ENV (si está en Vercel)
  const vercelEnv = process.env.VERCEL_ENV?.toLowerCase();
  if (vercelEnv === "production") return "production";
  if (vercelEnv === "preview") return "qa";
  if (vercelEnv === "development") return "development";

  // Prioridad 3: NODE_ENV
  const nodeEnv = process.env.NODE_ENV?.toLowerCase();
  if (nodeEnv === "production") return "production";
  if (nodeEnv === "test") return "qa";

  // Por defecto: development
  return "development";
}

// =============================================================================
// CARGA DE VARIABLES DE ENTORNO
// =============================================================================

/**
 * Obtiene una variable de entorno con valor por defecto
 * En el futuro, esto se puede extender para usar Secret Manager de GCP
 *
 * NOTA: En el cliente (browser), las variables de entorno solo están disponibles
 * si empiezan con NEXT_PUBLIC_ y fueron cargadas en tiempo de build.
 * Si la variable no está disponible, retorna un string vacío en lugar de lanzar error.
 */
function getEnvVar(key: string, defaultValue = ""): string {
  // En el cliente, process.env puede no estar disponible o tener valores undefined
  if (typeof window !== "undefined") {
    // Estamos en el cliente
    const value = process.env[key];
    return value || defaultValue;
  }

  // En el servidor
  const value = process.env[key];
  if (value === undefined || value === "") {
    return defaultValue;
  }

  return value;
}

/**
 * Obtiene una variable de entorno opcional
 */
function getOptionalEnvVar(key: string, defaultValue = ""): string {
  return process.env[key] || defaultValue;
}

/**
 * Obtiene una variable de entorno numérica
 */
function getNumberEnvVar(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Obtiene una variable de entorno booleana
 */
function getBooleanEnvVar(key: string, defaultValue: boolean): boolean {
  const value = process.env[key]?.toLowerCase();
  if (!value) return defaultValue;
  return value === "true" || value === "1";
}

// =============================================================================
// CONFIGURACIÓN POR AMBIENTE
// =============================================================================

/**
 * Carga la configuración según el ambiente detectado
 * En producción, esto se puede extender para usar Secret Manager de GCP
 */
function loadConfig(): EnvConfig {
  const environment = detectEnvironment();

  // Configuración base
  const config: EnvConfig = {
    environment,
    isDevelopment: environment === "development",
    isQA: environment === "qa",
    isProduction: environment === "production",

    // Firebase - variables específicas por ambiente
    // En Next.js, las variables NEXT_PUBLIC_* se inyectan en tiempo de build
    // Accedemos directamente a process.env que Next.js ya ha inyectado
    firebase: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    },

    // API
    apiUrl: getOptionalEnvVar("NEXT_PUBLIC_API_URL", ""),
    apiTimeout: getNumberEnvVar("NEXT_PUBLIC_API_TIMEOUT", 30000),

    // App
    appName: getOptionalEnvVar("NEXT_PUBLIC_APP_NAME", "EMI"),
    appVersion: getOptionalEnvVar("NEXT_PUBLIC_APP_VERSION", "0.1.0"),
    nodeEnv: process.env.NODE_ENV || "development",

    // Feature flags
    enableDebugTools: getBooleanEnvVar(
      "NEXT_PUBLIC_ENABLE_DEBUG_TOOLS",
      !environment.includes("production")
    ),
    enableAnalytics: getBooleanEnvVar("NEXT_PUBLIC_ENABLE_ANALYTICS", environment === "production"),
  };

  return config;
}

// =============================================================================
// EXPORTACIÓN
// =============================================================================

/**
 * Configuración del ambiente actual
 * Se carga una vez al importar el módulo
 */
export const env = loadConfig();

/**
 * Helper para obtener el ambiente en formato corto (para el debug store)
 */
export function getEnvironmentShort(): "DEV" | "QA" | "PROD" {
  switch (env.environment) {
    case "development":
      return "DEV";
    case "qa":
      return "QA";
    case "production":
      return "PROD";
    default:
      return "DEV";
  }
}

/**
 * Helper para validar si la configuración de Firebase es válida
 */
export function isFirebaseConfigValid(): boolean {
  const { firebase } = env;

  // Verificar que todas las variables existan y no sean placeholders
  const hasAllValues =
    !!firebase.apiKey &&
    !!firebase.authDomain &&
    !!firebase.projectId &&
    !!firebase.storageBucket &&
    !!firebase.messagingSenderId &&
    !!firebase.appId;

  // Verificar que no sean placeholders comunes
  const placeholderChecks = {
    apiKey:
      firebase.apiKey.includes("YOUR_API_KEY") ||
      firebase.apiKey.includes("your_dev_api_key") ||
      firebase.apiKey.includes("placeholder"),
    authDomain:
      firebase.authDomain.includes("your_dev_project") ||
      firebase.authDomain.includes("placeholder"),
    projectId:
      firebase.projectId.includes("your_dev_project") || firebase.projectId.includes("placeholder"),
    storageBucket:
      firebase.storageBucket.includes("your_dev_project") ||
      firebase.storageBucket.includes("placeholder"),
    messagingSenderId: firebase.messagingSenderId === "123456789",
    appId: firebase.appId.includes("abcdef"),
  };

  const noPlaceholders = !Object.values(placeholderChecks).some((v) => v);
  const isValid = hasAllValues && noPlaceholders;

  // Log de debug en desarrollo para ayudar a identificar problemas
  if (typeof window !== "undefined" && !isValid && env.isDevelopment) {
    const missingVars = [];
    if (!firebase.apiKey) missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
    if (!firebase.authDomain) missingVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
    if (!firebase.projectId) missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    if (!firebase.storageBucket) missingVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
    if (!firebase.messagingSenderId) missingVars.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
    if (!firebase.appId) missingVars.push("NEXT_PUBLIC_FIREBASE_APP_ID");

    if (missingVars.length > 0) {
      console.warn(
        `⚠️ Firebase: Faltan variables de entorno: ${missingVars.join(", ")}.\n` +
          `Asegúrate de que estén en .env.local y reinicia el servidor de desarrollo.`
      );
    } else if (!noPlaceholders) {
      const placeholderVars = [];
      if (placeholderChecks.apiKey) placeholderVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
      if (placeholderChecks.authDomain) placeholderVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
      if (placeholderChecks.projectId) placeholderVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
      if (placeholderChecks.storageBucket)
        placeholderVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
      if (placeholderChecks.messagingSenderId)
        placeholderVars.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
      if (placeholderChecks.appId) placeholderVars.push("NEXT_PUBLIC_FIREBASE_APP_ID");

      console.warn(
        `⚠️ Firebase: Las siguientes variables contienen valores placeholder: ${placeholderVars.join(", ")}.\n` +
          `Por favor, reemplaza estos valores en .env.local con tus credenciales reales de Firebase y reinicia el servidor.`
      );
    }
  }

  return isValid;
}

// =============================================================================
// FUTURO: SECRET MANAGER DE GCP
// =============================================================================

/**
 * TODO: Migrar a Secret Manager de GCP
 *
 * Estructura sugerida:
 *
 * ```typescript
 * import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
 *
 * async function loadSecretsFromGCP(projectId: string, environment: Environment) {
 *   const client = new SecretManagerServiceClient();
 *   const secrets = await client.listSecrets({ parent: `projects/${projectId}` });
 *   // Cargar secretos según el ambiente
 * }
 * ```
 *
 * Para migrar:
 * 1. Instalar @google-cloud/secret-manager
 * 2. Configurar credenciales de GCP
 * 3. Reemplazar getEnvVar() con carga desde Secret Manager
 * 4. Mantener fallback a variables de entorno para desarrollo local
 */
