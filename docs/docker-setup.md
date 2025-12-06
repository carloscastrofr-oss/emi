# 🐳 Configuración de Docker para Desarrollo Local

Esta guía explica cómo configurar y usar **PostgreSQL en Docker** para desarrollo local y tests de integración.

> **Nota importante:** Este Docker Compose es **SOLO para PostgreSQL**. Tu aplicación Next.js corre fuera de Docker y se conecta a esta base de datos. Aún no hay esquema definido; cuando lo definas, podrás usar migraciones o scripts SQL.

## 📋 Prerrequisitos

- Docker Desktop instalado y ejecutándose
- Docker Compose v2 (incluido en Docker Desktop)

## 🚀 Inicio Rápido

### 1. Iniciar PostgreSQL

```bash
# Iniciar solo PostgreSQL
docker compose up -d postgres

# O iniciar PostgreSQL + pgAdmin (herramienta de gestión visual)
docker compose --profile tools up -d
```

### 2. Verificar que está corriendo

```bash
# Ver logs
docker compose logs postgres

# Verificar estado
docker compose ps
```

### 3. Configurar variables de entorno

Agrega a tu `.env.development`:

```env
# PostgreSQL Local
DATABASE_URL=postgresql://emi_user:emi_dev_password@localhost:5432/emi_dev
```

## 📊 Conexión a la Base de Datos

### Desde tu aplicación con Prisma

Una vez configurado Prisma, puedes usar el cliente:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Ejemplo: Obtener todos los kits
const kits = await prisma.kit.findMany();
```

### Desde pgAdmin (opcional)

Si iniciaste con el perfil `tools`:

1. Abre http://localhost:5050
2. Login:
   - Email: `admin@emi.local`
   - Password: `admin`
3. Agrega un nuevo servidor:
   - Host: `postgres` (nombre del servicio en Docker)
   - Port: `5432`
   - Database: `emi_dev`
   - Username: `emi_user`
   - Password: `emi_dev_password`

### Desde línea de comandos

```bash
# Conectarte usando psql
docker compose exec postgres psql -U emi_user -d emi_dev

# O desde tu máquina local (si tienes psql instalado)
psql postgresql://emi_user:emi_dev_password@localhost:5432/emi_dev
```

## 🔄 Migraciones con Prisma

### Primera vez - Crear esquema inicial

```bash
# 1. Asegúrate de que el contenedor esté corriendo
docker compose up -d postgres

# 2. Crea y aplica la migración inicial
npm run db:migrate:dev
# Nombre sugerido: init
```

### Aplicar migraciones existentes

```bash
# Aplicar todas las migraciones pendientes
npm run db:migrate
```

### Crear nueva migración

```bash
# 1. Modifica prisma/schema.prisma
# 2. Crea la migración
npm run db:migrate:dev
# Prisma te pedirá un nombre descriptivo
```

Para más detalles sobre migraciones, consulta [database-workflow.md](./database-workflow.md).

## 🧪 Para Tests de Integración

Para tests, puedes usar la misma instancia o crear una base de datos separada:

```bash
# Crear una base de datos de test
docker compose exec postgres psql -U emi_user -d emi_dev -c "CREATE DATABASE emi_test;"
```

Y en tu configuración de tests:

```env
# .env.test
DATABASE_URL=postgresql://emi_user:emi_dev_password@localhost:5432/emi_test
```

## 🛠 Comandos Útiles

```bash
# Detener los contenedores
docker compose down

# Detener y eliminar volúmenes (⚠️ borra todos los datos)
docker compose down -v

# Ver logs en tiempo real
docker compose logs -f postgres

# Reiniciar el servicio
docker compose restart postgres

# Ejecutar comandos SQL
docker compose exec postgres psql -U emi_user -d emi_dev -c "SELECT version();"
```

## 📝 Notas Importantes

1. **Solo PostgreSQL**: Este Docker Compose es **exclusivamente para PostgreSQL**. Tu aplicación Next.js corre en tu máquina local y se conecta a esta base de datos.

2. **Sin esquema aún**: Actualmente no hay esquema definido. Cuando lo definas, usa migraciones o scripts SQL según tu preferencia.

3. **Persistencia de datos**: Los datos se guardan en un volumen de Docker llamado `postgres_data`. Si ejecutas `docker compose down -v`, se perderán todos los datos.

4. **Puerto**: El puerto 5432 está mapeado a tu máquina local. Si ya tienes PostgreSQL corriendo localmente, cambia el puerto en `docker-compose.yml`:

   ```yaml
   ports:
     - "5433:5432" # Usa 5433 en tu máquina
   ```

5. **Seguridad**: Las credenciales en `docker-compose.yml` son solo para desarrollo. **NUNCA** uses estas credenciales en producción.

6. **Compatibilidad con AlloyDB**: Como AlloyDB es compatible con PostgreSQL, el código que escribas funcionará tanto en local (PostgreSQL) como en producción (AlloyDB).

## 🔄 Migraciones y Esquema

**Actualmente no hay esquema definido.** Cuando definas el esquema de tu base de datos, puedes usar:

### Opción 1: Prisma Migrate (Recomendado)

Prisma Migrate es la forma recomendada de manejar migraciones:

```bash
# Crear nueva migración
npm run db:migrate:dev

# Aplicar migraciones
npm run db:migrate
```

Las migraciones se guardan en `prisma/migrations/` con formato timestamp_nombre.

### Opción 2: Scripts SQL Manuales

Puedes crear scripts SQL y montarlos en el contenedor:

1. Crea `database/scripts/init.sql` con tu esquema
2. Descomenta la línea en `docker-compose.yml`:
   ```yaml
   volumes:
     - postgres_data:/var/lib/postgresql/data
     - ./database/scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
   ```
3. Reinicia el contenedor (solo se ejecuta en la primera inicialización)

### Opción 3: Ejecutar SQL Manualmente

```bash
# Conectarte y ejecutar SQL
docker compose exec postgres psql -U emi_user -d emi_dev -f /path/to/your/schema.sql

# O desde tu máquina local
psql postgresql://emi_user:emi_dev_password@localhost:5432/emi_dev -f schema.sql
```

## 🆚 PostgreSQL vs AlloyDB Omni

**Recomendación: Usar PostgreSQL estándar**

- ✅ Más simple de configurar y mantener
- ✅ Ampliamente usado y documentado
- ✅ Suficiente para desarrollo y tests
- ✅ Compatible con AlloyDB (tu código funcionará igual)

**Usar AlloyDB Omni solo si:**

- Necesitas probar características específicas de AlloyDB
- Quieres replicar exactamente el entorno de producción
- Estás evaluando migraciones específicas de AlloyDB

## 🔧 Personalización

Puedes personalizar la configuración editando `docker-compose.yml`:

- Cambiar versión de PostgreSQL: `image: postgres:15-alpine`
- Cambiar puerto: `ports: - "5433:5432"`
- Cambiar credenciales: variables `POSTGRES_*`
- Agregar extensiones: crear un script de inicialización

## 📚 Recursos

- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [AlloyDB Documentation](https://cloud.google.com/alloydb/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Database Workflow Guide](./database-workflow.md)
