# 🗄️ Guía de Flujo de Trabajo con Base de Datos

Esta guía explica cómo trabajar con la base de datos en el proyecto, incluyendo migraciones, recreación de la DB, y mejores prácticas.

## 📋 Prerrequisitos

- Docker Desktop instalado y ejecutándose
- PostgreSQL corriendo en Docker (ver [docker-setup.md](./docker-setup.md))
- Variables de entorno configuradas (ver [environment-setup.md](./environment-setup.md))

## 🚀 Comandos Disponibles

### Gestión de Base de Datos

#### `npm run db:recreate`

**Recreación completa - BORRA TODOS LOS DATOS**

Este comando:

1. Baja el contenedor Docker
2. **Elimina todos los volúmenes** (borra todos los datos)
3. Levanta el contenedor limpio
4. Aplica todas las migraciones desde cero

**Cuándo usarlo:**

- Cuando quieres empezar desde cero
- Después de cambios grandes en el esquema
- Para limpiar datos de prueba
- Al configurar el proyecto por primera vez

```bash
npm run db:recreate
```

#### `npm run db:reset`

**Reset sin borrar datos**

Este comando:

1. Reinicia el contenedor Docker (sin eliminar volúmenes)
2. Aplica migraciones pendientes
3. **Preserva todos los datos existentes**

**Cuándo usarlo:**

- Para aplicar nuevas migraciones sin perder datos
- Cuando el contenedor tiene problemas y necesitas reiniciarlo
- Desarrollo diario normal

```bash
npm run db:reset
```

### Migraciones

#### `npm run db:migrate:dev`

**Crear nueva migración (desarrollo)**

Este comando:

1. Detecta cambios en `prisma/schema.prisma`
2. Crea una nueva migración con nombre descriptivo
3. Aplica la migración automáticamente
4. Regenera el cliente de Prisma

**Cuándo usarlo:**

- Cuando modificas el schema de Prisma
- Para crear una nueva migración basada en cambios del schema

```bash
npm run db:migrate:dev
```

**Ejemplo interactivo:**

```bash
# Prisma te preguntará el nombre de la migración
? Enter a name for the new migration: add_user_table
```

#### `npm run db:migrate`

**Aplicar migraciones pendientes**

Este comando aplica todas las migraciones que aún no se han ejecutado.

**Cuándo usarlo:**

- En producción o QA
- Cuando quieres aplicar migraciones sin crear nuevas
- Después de hacer pull y hay nuevas migraciones

```bash
npm run db:migrate
```

#### `npm run db:migrate:status`

**Ver estado de migraciones**

Muestra qué migraciones están aplicadas y cuáles están pendientes.

```bash
npm run db:migrate:status
```

### Desarrollo

#### `npm run db:studio`

**Abrir Prisma Studio**

Abre una interfaz visual para explorar y editar datos en la base de datos.

```bash
npm run db:studio
```

Se abrirá en: http://localhost:5555

#### `npm run db:generate`

**Regenerar cliente de Prisma**

Regenera el cliente de Prisma después de cambios en el schema.

```bash
npm run db:generate
```

**Nota:** Este comando se ejecuta automáticamente con `db:migrate:dev`, pero puedes ejecutarlo manualmente si es necesario.

#### `npm run db:seed`

**Ejecutar seeds**

Ejecuta el archivo de seeds para poblar la base de datos con datos iniciales.

```bash
npm run db:seed
```

**Nota:** Los seeds están en `database/seeds/seed.ts`. Por ahora está vacío, pero puedes agregar datos iniciales cuando lo necesites.

## 📝 Flujo de Trabajo Típico

### 1. Configuración Inicial

```bash
# 1. Levantar PostgreSQL en Docker
docker compose up -d postgres

# 2. Crear y aplicar migración inicial
npm run db:migrate:dev
# Nombre sugerido: init

# 3. (Opcional) Ejecutar seeds
npm run db:seed
```

### 2. Desarrollo Diario

```bash
# Cuando modificas el schema.prisma
npm run db:migrate:dev
# Prisma detecta cambios y crea migración

# Si solo necesitas aplicar migraciones existentes
npm run db:reset
```

### 3. Cambios Grandes en el Esquema

```bash
# Si quieres empezar desde cero
npm run db:recreate

# Luego crear nueva migración
npm run db:migrate:dev
```

### 4. Trabajo en Equipo

```bash
# 1. Hacer pull del código
git pull

# 2. Aplicar nuevas migraciones
npm run db:migrate

# 3. Regenerar cliente si es necesario
npm run db:generate
```

## 🏗️ Estructura de Migraciones

Las migraciones se guardan en `prisma/migrations/` con el siguiente formato:

```
prisma/migrations/
  └── 20250115143022_init/
      └── migration.sql
  └── 20250115150000_add_user_table/
      └── migration.sql
```

Cada migración tiene:

- **Timestamp**: Fecha y hora de creación (formato: YYYYMMDDHHMMSS)
- **Nombre descriptivo**: Nombre que le diste al crear la migración
- **migration.sql**: Archivo SQL con los cambios

## 📐 Esquema de Prisma

El esquema se define en `prisma/schema.prisma`. Actualmente incluye:

### Modelo Kit

```prisma
model Kit {
  id          String      @id @default(uuid())
  title       String
  description String
  icon        String
  category    KitCategory
  downloadUrl String?
  docsUrl     String?
  tags        String[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  createdBy   String?
  isActive    Boolean     @default(true)
}
```

## 🔧 Solución de Problemas

### Error: "Can't reach database server"

**Problema:** El contenedor de PostgreSQL no está corriendo.

**Solución:**

```bash
docker compose up -d postgres
```

### Error: "Migration failed to apply"

**Problema:** Hay un conflicto en las migraciones o el esquema está desincronizado.

**Solución:**

```bash
# Opción 1: Recrear desde cero (BORRA DATOS)
npm run db:recreate

# Opción 2: Ver estado de migraciones
npm run db:migrate:status

# Opción 3: Resetear migraciones (avanzado)
# Editar prisma/migrations/migration_lock.toml si es necesario
```

### Error: "Prisma Client is out of date"

**Problema:** El cliente de Prisma no está sincronizado con el schema.

**Solución:**

```bash
npm run db:generate
```

### El contenedor no inicia

**Problema:** Puerto 5432 ya está en uso o hay un problema con Docker.

**Solución:**

```bash
# Verificar si hay otro PostgreSQL corriendo
lsof -i :5432

# Cambiar puerto en docker-compose.yml si es necesario
# Luego actualizar DATABASE_URL en .env.development
```

## 🎯 Mejores Prácticas

1. **Siempre crea migraciones con nombres descriptivos**

   ```bash
   npm run db:migrate:dev
   # Nombre: add_user_email_index (no: migration_1)
   ```

2. **Revisa el SQL generado antes de aplicar**
   - Las migraciones se guardan en `prisma/migrations/`
   - Revisa el archivo `migration.sql` antes de hacer commit

3. **No edites migraciones ya aplicadas**
   - Si necesitas cambiar algo, crea una nueva migración

4. **Usa `db:reset` para desarrollo diario**
   - Preserva tus datos de prueba
   - Solo aplica nuevas migraciones

5. **Usa `db:recreate` cuando cambies el esquema significativamente**
   - Empieza desde cero
   - Asegura que todo funciona correctamente

6. **Ejecuta `db:generate` después de cambios en el schema**
   - Aunque se ejecuta automáticamente, puedes hacerlo manualmente si es necesario

## 🔗 Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Docker Setup](./docker-setup.md)
- [Environment Setup](./environment-setup.md)
