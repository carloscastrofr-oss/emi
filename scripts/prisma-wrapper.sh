#!/bin/bash
# Wrapper para comandos de Prisma que asegura que DATABASE_URL esté disponible

# Determinar qué archivo .env usar según APP_ENV
APP_ENV=${APP_ENV:-development}
ENV_FILE=".env.${APP_ENV}"

# Si APP_ENV=development, usar directamente .env.development (tiene DB real de GCloud)
# Si no, usar .env.local como fallback
if [ "$APP_ENV" = "development" ] && [ -f "$ENV_FILE" ]; then
  echo "📦 Cargando variables desde $ENV_FILE para Prisma..."
  set -a
  source "$ENV_FILE"
  set +a
elif [ -f .env.local ]; then
  echo "📦 Cargando variables desde .env.local para Prisma..."
  set -a
  source .env.local
  set +a
fi

# Si aún no hay DATABASE_URL, intentar cargar desde .env.development como último recurso
if [ -z "$DATABASE_URL" ] && [ -f .env.development ]; then
  echo "📦 Cargando DATABASE_URL desde .env.development..."
  set -a
  source .env.development
  set +a
fi

# Verificar que DATABASE_URL esté disponible
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL no está configurada en .env.local o .env.development" >&2
  exit 1
fi

# Ejecutar el comando de Prisma con todos los argumentos
npx prisma "$@"

