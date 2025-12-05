# Configuración de Ambientes

Este proyecto utiliza un sistema de configuración de ambientes que detecta automáticamente el ambiente actual y carga las variables de entorno correspondientes.

## 📁 Archivos de Configuración

El proyecto utiliza archivos `.env` específicos para cada ambiente:

- `.env.development` - Configuración para desarrollo local
- `.env.qa` - Configuración para ambiente de QA/testing
- `.env.production` - Configuración para producción

**Nota:** Los archivos `.env` están en `.gitignore` y no se suben al repositorio. Usa `.env.example` como plantilla.

## 🚀 Configuración Inicial

### 1. Crear los archivos de entorno

Copia el archivo `.env.example` y crea los archivos para cada ambiente:

```bash
# Desarrollo
cp .env.example .env.development

# QA
cp .env.example .env.qa

# Producción
cp .env.example .env.production
```

### 2. Configurar las variables

Edita cada archivo `.env` y reemplaza los valores placeholder con tus credenciales reales:

- **Firebase**: Obtén las credenciales desde la consola de Firebase
- **API URLs**: Configura las URLs según el ambiente
- **Feature Flags**: Ajusta según necesites

## 🔍 Detección Automática del Ambiente

El sistema detecta automáticamente el ambiente usando el siguiente orden de prioridad:

1. **APP_ENV** - Variable de entorno personalizada (más alta prioridad)
2. **VERCEL_ENV** - Si está desplegado en Vercel
3. **NODE_ENV** - Variable estándar de Node.js

### Mapeo de Ambientes

- `development` o `dev` → **DEV**
- `qa` o `test` → **QA**
- `production` o `prod` → **PROD**

## 📜 Scripts Disponibles

### Desarrollo

```bash
# Desarrollo (usa .env.development)
npm run dev

# QA local (usa .env.qa)
npm run dev:qa

# Producción local (usa .env.production)
npm run dev:prod
```

### Build

```bash
# Build para desarrollo
npm run build:dev

# Build para QA
npm run build:qa

# Build para producción
npm run build:prod
```

### Start (después de build)

```bash
# Start en desarrollo
npm run start:dev

# Start en QA
npm run start:qa

# Start en producción
npm run start:prod
```

## 🎯 Uso en el Código

### Importar la configuración

```typescript
import { env } from "@/lib/env";

// Acceder a variables de entorno
const apiUrl = env.apiUrl;
const isDevelopment = env.isDevelopment;
const firebaseConfig = env.firebase;
```

### Helpers disponibles

```typescript
import { getEnvironmentShort, isFirebaseConfigValid } from "@/lib/env";

// Obtener ambiente en formato corto (DEV | QA | PROD)
const envShort = getEnvironmentShort();

// Validar configuración de Firebase
if (isFirebaseConfigValid()) {
  // Firebase está configurado correctamente
}
```

## 🐛 Debug Dialog

El Debug Dialog muestra:

- **Ambiente Detectado**: El ambiente real detectado desde las variables de entorno
- **Ambiente Seleccionado**: El ambiente seleccionado en el debug dialog (solo para desarrollo/QA)
- **Nota**: En producción, el ambiente está bloqueado y no se puede cambiar

## 🔐 Secret Manager de GCP (Futuro)

El sistema está preparado para migrar a Secret Manager de GCP. La estructura actual permite una migración sencilla:

1. Instalar `@google-cloud/secret-manager`
2. Configurar credenciales de GCP
3. Actualizar `src/lib/env.ts` para cargar secretos desde GCP
4. Mantener fallback a variables de entorno para desarrollo local

Ver comentarios en `src/lib/env.ts` para más detalles.

## 📝 Variables de Entorno Disponibles

### Firebase

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### API

- `NEXT_PUBLIC_API_URL` - URL base de la API
- `NEXT_PUBLIC_API_TIMEOUT` - Timeout en milisegundos (default: 30000)

### App

- `NEXT_PUBLIC_APP_NAME` - Nombre de la aplicación
- `NEXT_PUBLIC_APP_VERSION` - Versión de la aplicación

### Feature Flags

- `NEXT_PUBLIC_ENABLE_DEBUG_TOOLS` - Habilitar herramientas de debug (default: true en dev/qa)
- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Habilitar analytics (default: true en prod)

### Ambiente

- `APP_ENV` - Ambiente actual (development | qa | production)

## ⚠️ Notas Importantes

1. **Nunca subas archivos `.env` al repositorio** - Están en `.gitignore`
2. **Usa `.env.example` como referencia** - Manténlo actualizado con todas las variables necesarias
3. **En producción**, el ambiente se detecta automáticamente y no se puede cambiar desde el debug dialog
4. **Las variables deben empezar con `NEXT_PUBLIC_`** para estar disponibles en el cliente
5. **Reinicia el servidor** después de cambiar variables de entorno

## 🔄 Migración desde Configuración Anterior

Si ya tenías variables de entorno configuradas:

1. Crea los archivos `.env.development`, `.env.qa`, `.env.production`
2. Mueve tus variables existentes a los archivos correspondientes
3. El código ahora usa `env` desde `@/lib/env` en lugar de `process.env` directamente
4. Actualiza cualquier referencia directa a `process.env` para usar el módulo `env`
