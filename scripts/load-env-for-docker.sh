#!/bin/bash
# Script para cargar variables de entorno y exportarlas
# para que Docker Compose pueda usarlas en los ARGs del build
#
# Para Docker, usamos SOLO .env.development (tiene todo + DB real de GCloud)
# NO usamos .env.local porque tiene DATABASE_URL=localhost

set -e

# Determinar qué archivo .env usar según APP_ENV
APP_ENV=${APP_ENV:-development}
ENV_FILE=".env.${APP_ENV}"

# Cargar SOLO desde .env.development (tiene la DB real de GCloud y todo lo demás)
if [ -f "$ENV_FILE" ]; then
  echo "📦 Cargando variables desde $ENV_FILE para Docker..."
  # Exportar variables desde .env.development
  # Usar set -a para exportar automáticamente
  set -a
  source "$ENV_FILE"
  set +a
  echo "✅ Variables cargadas desde $ENV_FILE"
  echo "   DATABASE_URL=${DATABASE_URL:0:50}..."
else
  echo "⚠️  Archivo $ENV_FILE no encontrado"
  exit 1
fi

# Ejecutar el comando pasado como argumento
exec "$@"

