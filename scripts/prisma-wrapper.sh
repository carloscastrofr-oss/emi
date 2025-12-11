#!/bin/bash
# Wrapper para comandos de Prisma que asegura que DATABASE_URL esté disponible

# Cargar .env.local si existe
if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
fi

# Si no hay DATABASE_URL, intentar cargar desde .env.development
if [ -z "$DATABASE_URL" ] && [ -f .env.development ]; then
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

