# Configuración de Firebase Admin

Este documento explica cómo configurar Firebase Admin SDK para validación de tokens en el servidor.

## ¿Por qué necesitamos Firebase Admin?

Firebase Admin SDK nos permite **verificar la firma** de los tokens JWT de Firebase en el backend, asegurando que:

- ✅ El token no ha sido modificado
- ✅ El token es válido y no ha sido revocado
- ✅ El token no ha expirado
- ✅ Solo tokens emitidos por tu proyecto de Firebase son aceptados

Sin Firebase Admin, solo podemos verificar la expiración del token (validación básica), pero no podemos verificar que la firma sea válida.

## Opciones de Configuración

Hay 3 formas de configurar Firebase Admin, en orden de prioridad:

### Opción 1: Archivo de Credenciales (Recomendado para desarrollo local)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Project Settings** (⚙️) → **Service Accounts**
4. Haz clic en **Generate New Private Key**
5. Descarga el archivo JSON
6. Guarda el archivo en un lugar seguro (NO lo subas a git)
7. Agrega a `.env.local`:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/ruta/completa/al/archivo/service-account-key.json
```

**Ejemplo:**

```bash
GOOGLE_APPLICATION_CREDENTIALS=/Users/tu-usuario/proyectos/emi/firebase-service-account.json
```

### Opción 2: JSON String (Recomendado para Vercel/Cloud Run)

1. Descarga el archivo JSON como en la Opción 1
2. Convierte el contenido del JSON a una sola línea (o usa un minificador)
3. Agrega a `.env.local` o variables de entorno de tu plataforma:

```bash
FIREBASE_ADMIN_CREDENTIALS='{"type":"service_account","project_id":"tu-proyecto",...}'
```

**Para Vercel:**

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega `FIREBASE_ADMIN_CREDENTIALS` con el JSON completo (sin saltos de línea)

### Opción 3: Validación Básica (Solo desarrollo)

Si no configuras credenciales, el sistema usará validación básica:

- ✅ Verifica expiración del token
- ❌ NO verifica la firma
- ❌ NO verifica si el token fue revocado

**Esto solo funciona en desarrollo. En producción siempre debes usar Opción 1 o 2.**

## Verificar la Configuración

Una vez configurado, puedes verificar que funciona:

1. Reinicia el servidor de Next.js
2. Revisa los logs al iniciar - deberías ver que Firebase Admin se inicializó correctamente
3. Prueba un endpoint autenticado - si el token es inválido/expirado, debería rechazarse

## Seguridad

⚠️ **IMPORTANTE:**

- ❌ **NUNCA** subas el archivo de credenciales a git
- ❌ **NUNCA** expongas las credenciales en el código
- ✅ Usa variables de entorno para las credenciales
- ✅ Agrega `*-service-account*.json` a `.gitignore`
- ✅ En producción, usa Secret Manager o variables de entorno de tu plataforma

## Archivos Relacionados

- `src/lib/firebase-admin.ts` - Configuración de Firebase Admin
- `src/lib/api-auth.ts` - Utilidades para validar tokens en endpoints
- `.gitignore` - Asegúrate de que ignora archivos de credenciales

## Referencias

- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup#initialize-sdk)
- [Obtener credenciales de Service Account](https://firebase.google.com/docs/admin/setup#initialize-sdk)
