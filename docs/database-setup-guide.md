# 🗄️ Guía Completa de Setup y Uso de Base de Datos

Esta guía explica cómo configurar y usar el ecosistema completo de base de datos desde cero, incluyendo todos los comandos disponibles y escenarios de uso.

## 📋 Tabla de Contenidos

- [Setup Inicial desde Cero](#setup-inicial-desde-cero)
- [Comandos Disponibles](#comandos-disponibles)
- [Escenarios de Uso](#escenarios-de-uso)
- [Flujo de Trabajo Típico](#flujo-de-trabajo-típico)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Setup Inicial desde Cero

### Prerrequisitos

Antes de empezar, asegúrate de tener instalado:

- **Node.js 18+** - [Descargar](https://nodejs.org/)
- **Docker Desktop** - [Descargar](https://www.docker.com/products/docker-desktop/)
- **Git** - Para clonar el repositorio

### Paso 1: Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd emi
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias, incluyendo:

- `@prisma/client` - Cliente de Prisma
- `prisma` - CLI de Prisma
- `tsx` - Para ejecutar scripts TypeScript
- Y todas las demás dependencias del proyecto

### Paso 3: Configurar Variables de Entorno

Crea el archivo `.env.development` en la raíz del proyecto:

```bash
# Si no existe, créalo
touch .env.development
```

Agrega la siguiente línea (o verifica que esté presente):

```env
DATABASE_URL=postgresql://emi_user:emi_dev_password@localhost:5432/emi_dev
```

**Nota:** Este archivo está en `.gitignore` y no se sube al repositorio. Cada desarrollador debe crearlo localmente.

### Paso 4: Setup Automático de Base de Datos

Ejecuta el comando de setup que automatiza todo:

```bash
npm run db:setup
```

Este comando hace automáticamente:

1. ✅ Verifica/crea `.env.development` con `DATABASE_URL`
2. ✅ Levanta PostgreSQL en Docker
3. ✅ Espera a que PostgreSQL esté listo
4. ✅ Genera el cliente de Prisma
5. ✅ Crea la migración inicial (si no existe)

**Salida esperada:**

```
[db:setup] 🚀 Iniciando setup de base de datos...
[db:setup] Configurando .env.development...
[db:setup] ✓ .env.development configurado
[db:setup] Iniciando PostgreSQL en Docker...
[db:setup] ✓ PostgreSQL iniciado
[db:setup] Esperando a que PostgreSQL esté listo...
[db:setup] PostgreSQL está listo ✓
[db:setup] Creando migración inicial...
[db:setup] ✓ Migración inicial creada y aplicada

✅ Setup completado exitosamente!
```

### Paso 5: Verificar que Todo Funciona

```bash
# Verificar estado de migraciones
npm run db:migrate:status

# Debería mostrar:
# Database schema is up to date!
```

### Paso 6: (Opcional) Abrir Prisma Studio

Para ver y editar datos visualmente:

```bash
npm run db:studio
```

Se abrirá en: http://localhost:5555

---

## 📜 Comandos Disponibles

### Setup y Configuración

#### `npm run db:setup`

**Setup inicial completo de la base de datos**

Este es el comando principal para configurar todo desde cero. Solo necesitas ejecutarlo una vez.

**Qué hace:**

- Configura `.env.development` con `DATABASE_URL`
- Levanta PostgreSQL en Docker
- Genera cliente de Prisma
- Crea migración inicial

**Cuándo usarlo:**

- Primera vez que clonas el repo
- Después de hacer `git pull` y hay cambios en el esquema
- Cuando quieres resetear todo desde cero

---

### Gestión de Base de Datos

#### `npm run db:recreate`

**Recreación completa - ⚠️ BORRA TODOS LOS DATOS**

Este comando elimina completamente la base de datos y la recrea desde cero.

**Qué hace:**

1. Baja el contenedor Docker
2. **Elimina todos los volúmenes** (borra todos los datos)
3. Levanta el contenedor limpio
4. Aplica todas las migraciones desde cero

**Cuándo usarlo:**

- Cuando quieres empezar desde cero
- Después de cambios grandes en el esquema
- Para limpiar datos de prueba
- Cuando la base de datos está corrupta

**Ejemplo:**

```bash
npm run db:recreate
# ⚠️ Todos los datos serán eliminados
```

#### `npm run db:reset`

**Reset sin borrar datos - ✅ Preserva datos**

Este comando reinicia el contenedor y aplica migraciones sin borrar datos.

**Qué hace:**

1. Reinicia el contenedor Docker (sin eliminar volúmenes)
2. Aplica migraciones pendientes
3. **Preserva todos los datos existentes**

**Cuándo usarlo:**

- Para aplicar nuevas migraciones sin perder datos
- Cuando el contenedor tiene problemas y necesitas reiniciarlo
- Desarrollo diario normal
- Después de hacer `git pull` y hay nuevas migraciones

**Ejemplo:**

```bash
npm run db:reset
# ✅ Tus datos se preservan
```

---

### Migraciones

#### `npm run db:migrate:dev`

**Crear nueva migración (desarrollo)**

Crea una nueva migración basada en cambios en `prisma/schema.prisma`.

**Qué hace:**

1. Detecta cambios en `prisma/schema.prisma`
2. Te pide un nombre descriptivo para la migración
3. Crea el archivo de migración
4. Aplica la migración automáticamente
5. Regenera el cliente de Prisma

**Cuándo usarlo:**

- Cuando modificas el schema de Prisma
- Para crear una nueva migración basada en cambios del schema

**Ejemplo:**

```bash
# 1. Edita prisma/schema.prisma (agrega un campo, tabla, etc.)
# 2. Ejecuta:
npm run db:migrate:dev

# Prisma te preguntará:
# ? Enter a name for the new migration: add_user_email_field
```

**Resultado:**

- Se crea: `prisma/migrations/YYYYMMDDHHMMSS_add_user_email_field/migration.sql`
- La migración se aplica automáticamente

#### `npm run db:migrate`

**Aplicar migraciones pendientes**

Aplica todas las migraciones que aún no se han ejecutado.

**Cuándo usarlo:**

- En producción o QA
- Cuando quieres aplicar migraciones sin crear nuevas
- Después de hacer `git pull` y hay nuevas migraciones
- En CI/CD pipelines

**Ejemplo:**

```bash
npm run db:migrate
# Aplica todas las migraciones pendientes
```

#### `npm run db:migrate:status`

**Ver estado de migraciones**

Muestra qué migraciones están aplicadas y cuáles están pendientes.

**Cuándo usarlo:**

- Para verificar el estado de la base de datos
- Para debuggear problemas de migraciones
- Antes de aplicar migraciones

**Ejemplo:**

```bash
npm run db:migrate:status

# Salida esperada:
# 1 migration found in prisma/migrations
# Database schema is up to date!
```

---

### Desarrollo

#### `npm run db:studio`

**Abrir Prisma Studio (interfaz visual)**

Abre una interfaz web para explorar y editar datos en la base de datos.

**Qué hace:**

- Inicia un servidor web en `http://localhost:5555`
- Permite ver todas las tablas
- Permite editar datos directamente
- Útil para desarrollo y debugging

**Cuándo usarlo:**

- Para ver datos de prueba
- Para insertar datos manualmente
- Para debuggear problemas de datos
- Para explorar la estructura de la base de datos

**Ejemplo:**

```bash
npm run db:studio
# Abre http://localhost:5555 en tu navegador
```

**Nota:** Presiona `Ctrl+C` para detener el servidor.

#### `npm run db:generate`

**Regenerar cliente de Prisma**

Regenera el cliente de Prisma después de cambios en el schema.

**Cuándo usarlo:**

- Después de modificar `prisma/schema.prisma` manualmente
- Cuando el cliente está desincronizado
- En CI/CD para asegurar que el cliente esté actualizado

**Nota:** Este comando se ejecuta automáticamente con `db:migrate:dev`, pero puedes ejecutarlo manualmente si es necesario.

#### `npm run db:seed`

**Ejecutar seeds (datos iniciales)**

Ejecuta el archivo de seeds para poblar la base de datos con datos iniciales.

**Cuándo usarlo:**

- Para poblar la base de datos con datos de prueba
- Después de recrear la base de datos
- Para resetear datos de prueba

**Nota:** Por ahora el archivo `database/seeds/seed.ts` está vacío. Puedes agregar datos iniciales cuando lo necesites.

---

## 🎯 Escenarios de Uso

### Escenario 1: Clonar el Repo por Primera Vez

```bash
# 1. Clonar
git clone <repo-url>
cd emi

# 2. Instalar dependencias
npm install

# 3. Setup automático
npm run db:setup

# 4. Verificar
npm run db:migrate:status

# ✅ Listo para desarrollar
```

### Escenario 2: Hacer Pull y Hay Nuevas Migraciones

```bash
# 1. Hacer pull
git pull

# 2. Aplicar nuevas migraciones
npm run db:reset

# O si quieres ver el estado primero:
npm run db:migrate:status
npm run db:migrate

# ✅ Base de datos actualizada
```

### Escenario 3: Modificar el Schema (Agregar Campo/Tabla)

```bash
# 1. Editar prisma/schema.prisma
# Ejemplo: Agregar campo "email" a la tabla Kit

# 2. Crear migración
npm run db:migrate:dev
# Nombre: add_email_to_kit

# 3. La migración se aplica automáticamente
# ✅ Cambios aplicados
```

### Escenario 4: Empezar desde Cero (Borrar Todo)

```bash
# ⚠️ Esto borra TODOS los datos
npm run db:recreate

# Luego aplicar migraciones (ya se hace automáticamente)
# ✅ Base de datos limpia
```

### Escenario 5: Aplicar Migraciones sin Perder Datos

```bash
# ✅ Esto preserva tus datos
npm run db:reset

# O solo aplicar migraciones:
npm run db:migrate

# ✅ Datos preservados, migraciones aplicadas
```

### Escenario 6: Ver/Editar Datos Visualmente

```bash
# Abrir Prisma Studio
npm run db:studio

# Se abre en: http://localhost:5555
# Puedes ver y editar todas las tablas
```

### Escenario 7: El Contenedor de Docker Tiene Problemas

```bash
# Opción 1: Resetear (preserva datos)
npm run db:reset

# Opción 2: Recrear desde cero (borra datos)
npm run db:recreate

# Opción 3: Reiniciar manualmente
docker compose restart postgres
```

### Escenario 8: Trabajo en Equipo (Múltiples Desarrolladores)

```bash
# Desarrollador A: Crea migración
# 1. Edita schema.prisma
npm run db:migrate:dev -- --name add_new_feature
git add .
git commit -m "feat: add new feature"
git push

# Desarrollador B: Aplica migración
git pull
npm run db:reset  # O npm run db:migrate
# ✅ Base de datos sincronizada
```

---

## 🔄 Flujo de Trabajo Típico

### Desarrollo Diario

```bash
# 1. Iniciar día de trabajo
git pull
npm run db:reset  # Aplicar migraciones nuevas si las hay

# 2. Desarrollar...
# Editar código, hacer cambios, etc.

# 3. Si modificas el schema:
# Editar prisma/schema.prisma
npm run db:migrate:dev -- --name descriptive_name

# 4. Ver datos si es necesario
npm run db:studio
```

### Crear Nueva Feature con Cambios en DB

```bash
# 1. Crear branch
git checkout -b feature/new-model

# 2. Editar prisma/schema.prisma
# Agregar nuevo modelo, campos, etc.

# 3. Crear migración
npm run db:migrate:dev -- --name add_new_model

# 4. Desarrollar feature usando el nuevo modelo
# Usar: import { prisma } from "@/lib/prisma"

# 5. Commit y push
git add .
git commit -m "feat: add new model"
git push
```

### Antes de Hacer Commit

```bash
# 1. Verificar que las migraciones estén aplicadas
npm run db:migrate:status

# 2. Verificar que el código compile
npm run typecheck

# 3. Verificar formato y lint
npm run test:commit

# 4. Commit
git add .
git commit -m "feat: ..."
```

---

## 🔧 Troubleshooting

### Error: "Can't reach database server"

**Síntoma:**

```
Error: P1001
Can't reach database server at `localhost:5432`
```

**Solución:**

```bash
# 1. Verificar que Docker esté corriendo
docker ps

# 2. Verificar que el contenedor esté corriendo
docker compose ps

# 3. Si no está corriendo, iniciarlo
docker compose up -d postgres

# 4. Esperar unos segundos y verificar
npm run db:migrate:status
```

### Error: "Migration failed to apply"

**Síntoma:**

```
Error: Migration `20250115143022_init` failed to apply
```

**Solución:**

```bash
# Opción 1: Ver estado de migraciones
npm run db:migrate:status

# Opción 2: Recrear desde cero (BORRA DATOS)
npm run db:recreate

# Opción 3: Resetear (preserva datos)
npm run db:reset
```

### Error: "Prisma Client is out of date"

**Síntoma:**

```
Error: Prisma Client has not been generated yet
```

**Solución:**

```bash
npm run db:generate
```

### Error: "Port 5432 already in use"

**Síntoma:**

```
Error: bind: address already in use
```

**Solución:**

```bash
# Opción 1: Detener otro PostgreSQL local
# En macOS:
brew services stop postgresql

# Opción 2: Cambiar puerto en docker-compose.yml
# Cambiar "5432:5432" a "5433:5432"
# Y actualizar DATABASE_URL en .env.development
```

### Error: "DATABASE_URL not found"

**Síntoma:**

```
Error: Environment variable not found: DATABASE_URL
```

**Solución:**

```bash
# 1. Verificar que .env.development existe
ls -la .env.development

# 2. Verificar que tiene DATABASE_URL
cat .env.development | grep DATABASE_URL

# 3. Si no existe, agregarlo
echo "DATABASE_URL=postgresql://emi_user:emi_dev_password@localhost:5432/emi_dev" >> .env.development

# 4. Ejecutar load-env
node scripts/load-env.js
```

### El Contenedor No Inicia

**Síntoma:**

```
Container emi-postgres-dev exited with code 1
```

**Solución:**

```bash
# 1. Ver logs del contenedor
docker compose logs postgres

# 2. Eliminar contenedor y volúmenes
docker compose down -v

# 3. Recrear
npm run db:recreate
```

### Prisma Studio No Se Conecta

**Síntoma:**

```
Error: connect ECONNREFUSED ::1:51213
```

**Solución:**

```bash
# 1. Verificar que PostgreSQL esté corriendo
docker compose ps

# 2. Verificar DATABASE_URL
cat .env.development | grep DATABASE_URL

# 3. Cargar entorno y ejecutar
node scripts/load-env.js
npm run db:studio
```

---

## 📚 Estructura de Archivos

```
emi/
├── prisma/
│   ├── schema.prisma          # Esquema de la base de datos
│   ├── migrations/            # Migraciones versionadas
│   │   └── YYYYMMDDHHMMSS_nombre/
│   │       └── migration.sql
│   └── migration_lock.toml    # Lock de migraciones
├── database/
│   └── seeds/
│       └── seed.ts            # Seeds (datos iniciales)
├── scripts/
│   ├── db-setup.ts           # Setup inicial
│   ├── db-recreate.ts        # Recrear DB
│   ├── db-reset.ts           # Resetear DB
│   ├── prisma-wrapper.sh     # Wrapper para Prisma
│   └── load-env.js           # Cargar variables de entorno
├── src/
│   └── lib/
│       └── prisma.ts         # Cliente de Prisma singleton
├── docker-compose.yml        # Configuración de PostgreSQL
└── .env.development          # Variables de entorno (no en git)
```

---

## 🎓 Conceptos Importantes

### Migraciones

Las migraciones son archivos SQL que describen cambios en el esquema de la base de datos. Se guardan en `prisma/migrations/` con formato:

- `YYYYMMDDHHMMSS_nombre_descriptivo/`
- `migration.sql` - El SQL que se ejecuta

### Prisma Schema

El archivo `prisma/schema.prisma` define:

- Modelos (tablas)
- Relaciones entre modelos
- Tipos de datos
- Índices
- Constraints

### Cliente de Prisma

El cliente se genera automáticamente y permite interactuar con la base de datos de forma type-safe:

```typescript
import { prisma } from "@/lib/prisma";

// Ejemplo: Obtener todos los kits
const kits = await prisma.kit.findMany();
```

---

## 🔗 Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Database Workflow Guide](./database-workflow.md) - Guía detallada de flujo de trabajo
- [Docker Setup Guide](./docker-setup.md) - Configuración de Docker
- [Environment Setup](./environment-setup.md) - Configuración de variables de entorno

---

## ✅ Checklist de Setup Inicial

Cuando clonas el repo por primera vez:

- [ ] Instalar dependencias: `npm install`
- [ ] Crear `.env.development` con `DATABASE_URL`
- [ ] Ejecutar `npm run db:setup`
- [ ] Verificar con `npm run db:migrate:status`
- [ ] (Opcional) Abrir Prisma Studio: `npm run db:studio`

¡Listo para desarrollar! 🚀
