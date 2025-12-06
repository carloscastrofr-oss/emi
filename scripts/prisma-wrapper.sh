#!/bin/bash
# Wrapper para comandos de Prisma que asegura que DATABASE_URL esté disponible

# Cargar .env.local si existe
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Si no hay DATABASE_URL, cargar desde .env.development
if [ -z "$DATABASE_URL" ] && [ -f .env.development ]; then
  export DATABASE_URL=$(grep "^DATABASE_URL=" .env.development | cut -d '=' -f2- | tr -d '"' | tr -d "'")
fi

# Ejecutar el comando de Prisma con todos los argumentos
npx prisma "$@"

