# Guía de Migraciones de Prisma

## Comandos Disponibles

### Desarrollo Local

#### Crear una nueva migración (recomendado)
```bash
npm run db:migrate:dev -- --name nombre_de_la_migracion
```
Crea una nueva migración sin validar contra shadow database. Úsalo cuando:
- Quieres crear una nueva migración basada en cambios en el schema
- No necesitas validación completa (más rápido)

#### Aplicar migraciones existentes
```bash
npm run db:migrate:dev:apply
# o simplemente
npm run db:migrate
```
Aplica todas las migraciones pendientes a la base de datos.

#### Crear y aplicar migración (validación completa)
```bash
npm run db:migrate:dev:full -- --name nombre_de_la_migracion
```
Crea y aplica la migración con validación completa contra shadow database.
**Nota:** Puede fallar si hay problemas con el shadow database.

#### Verificar estado de migraciones
```bash
npm run db:migrate:status
```
Muestra qué migraciones están aplicadas y cuáles están pendientes.

### Flujo Recomendado

1. **Hacer cambios en `prisma/schema.prisma`**

2. **Crear la migración:**
   ```bash
   npm run db:migrate:dev -- --name descripcion_cambios
   ```

3. **Aplicar la migración:**
   ```bash
   npm run db:migrate:dev:apply
   ```

4. **Verificar el estado:**
   ```bash
   npm run db:migrate:status
   ```

## Solución de Problemas

### Error: "The underlying table for model X does not exist"

Este error ocurre cuando Prisma intenta validar migraciones contra el shadow database y no encuentra las tablas necesarias.

**Solución:**
- Usa `npm run db:migrate:dev` (con `--create-only`) en lugar de `db:migrate:dev:full`
- O aplica las migraciones existentes primero: `npm run db:migrate:dev:apply`

### Error: "Migration failed to apply cleanly to shadow database"

Similar al anterior. Usa el flujo recomendado con `--create-only`.

## Notas Técnicas

- El proyecto usa Prisma 7.1.0 con adaptador de PostgreSQL
- Las migraciones se almacenan en `prisma/migrations/`
- La configuración de Prisma está en `prisma.config.ts`
- El schema está en `prisma/schema.prisma`
