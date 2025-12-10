#!/bin/bash
# Script para ejecutar migraciones de Prisma en diferentes ambientes
# Uso: ./scripts/prisma-migrate.sh <ambiente> <comando-prisma>
# Ambientes: local, dev, prod
# Comandos: migrate dev, migrate deploy, migrate status, etc.

ENV=$1
shift 1
PRISMA_CMD="$@"

if [ -z "$ENV" ] || [ -z "$PRISMA_CMD" ]; then
  echo "Error: Uso incorrecto. Formato: ./scripts/prisma-migrate.sh <ambiente> <comando-prisma>"
  echo "Ejemplo: ./scripts/prisma-migrate.sh local migrate dev"
  exit 1
fi

# Determinar el archivo .env según el ambiente
case "$ENV" in
  local)
    ENV_FILE=".env.local"
    ;;
  dev)
    ENV_FILE=".env.dev"
    ;;
  prod|production)
    ENV_FILE=".env.production"
    ;;
  *)
    echo "Error: Ambiente inválido. Usa: local, dev, prod"
    exit 1
    ;;
esac

# Verificar que el archivo .env existe
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Archivo $ENV_FILE no encontrado"
  exit 1
fi

# Cargar variables de entorno desde el archivo .env correspondiente
echo "📦 Cargando variables de entorno desde $ENV_FILE..."
export $(cat "$ENV_FILE" | grep -v '^#' | grep -v '^$' | xargs)

# Verificar que DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL no está definida en $ENV_FILE"
  exit 1
fi

echo "✅ Variables cargadas. Ejecutando: npx prisma $PRISMA_CMD"
echo "   Ambiente: $ENV"
echo "   Database URL: ${DATABASE_URL:0:30}..." # Mostrar solo primeros 30 chars por seguridad

# Ejecutar el comando de Prisma
npx prisma $PRISMA_CMD

