# Migración: Refactorizar Sistema de Roles

**Nombre:** `20251226180000_refactor_roles_superadmin_boolean`  
**Fecha:** 2025-12-26  
**Descripción:** Refactoriza el sistema de roles para que `superAdmin` sea un atributo booleano en lugar de un rol.

## Cambios Principales

1. **Tabla `users`**:
   - ✅ Agrega columna `superAdmin` (boolean, NOT NULL, default false)
   - ✅ Migra usuarios con `role = 'super_admin'` a `superAdmin = true`
   - ✅ Elimina columna `role`
   - ✅ Crea índice en `superAdmin`

2. **Enum `Role`**:
   - ✅ Elimina `super_admin` del enum
   - ✅ Mantiene: `ux_ui_designer`, `product_designer`, `product_design_lead`, `admin`

3. **Nuevo enum `ClientRole`**:
   - ✅ Crea enum `ClientRole` con solo `admin`

4. **Tabla `user_client_access`**:
   - ✅ Cambia tipo de `role` de `Role` a `ClientRole`
   - ✅ Convierte todos los roles existentes a `admin` (único valor válido)

5. **Tabla `user_workspace_access`**:
   - ✅ Usa enum `Role` actualizado (sin `super_admin`)

## Validaciones Incluidas

La migración incluye validaciones para evitar errores:

- ✅ Valida que no haya roles `super_admin` en `user_workspace_access` antes de eliminar del enum
- ✅ Valida que todos los roles en `user_client_access` sean `admin` antes de cambiar el tipo

## Instrucciones para Producción

### Antes de Aplicar

1. **Hacer backup de la base de datos**:

   ```bash
   pg_dump -h <host> -U <user> -d <database> > backup_before_role_refactor.sql
   ```

2. **Verificar usuarios con `super_admin`**:

   ```sql
   SELECT id, email, role FROM users WHERE role = 'super_admin';
   ```

   Anota estos usuarios para verificar después de la migración.

3. **Verificar roles inválidos**:

   ```sql
   -- Verificar que no haya super_admin en user_workspace_access
   SELECT COUNT(*) FROM user_workspace_access WHERE role = 'super_admin';
   -- Debe ser 0

   -- Verificar que no haya roles diferentes de admin en user_client_access
   SELECT COUNT(*) FROM user_client_access WHERE role IS NOT NULL AND role != 'admin';
   -- Debe ser 0
   ```

### Aplicar Migración

```bash
# Opción 1: Usar Prisma migrate deploy (recomendado para producción)
npm run db:migrate:prod

# Opción 2: Aplicar SQL directamente (si Prisma falla con shadow database)
psql -h <host> -U <user> -d <database> < prisma/migrations/20251226180000_refactor_roles_superadmin_boolean/migration.sql
```

### Después de Aplicar

1. **Verificar migración**:

   ```sql
   -- Verificar que superAdmin existe
   SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'superAdmin';

   -- Verificar que role ya no existe en users
   SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role';
   -- Debe estar vacío

   -- Verificar usuarios superAdmin
   SELECT id, email, "superAdmin" FROM users WHERE "superAdmin" = true;
   ```

2. **Regenerar Prisma Client**:

   ```bash
   npm run db:generate
   ```

3. **Reiniciar aplicación** para que use el nuevo schema

## Rollback (Si es Necesario)

Si necesitas hacer rollback, deberás:

1. Recrear el enum `Role` con `super_admin`
2. Agregar columna `role` a `users`
3. Migrar usuarios con `superAdmin = true` a `role = 'super_admin'`
4. Eliminar columna `superAdmin`
5. Revertir cambios en `user_client_access`

**⚠️ ADVERTENCIA:** El rollback es complejo y puede causar pérdida de datos. Asegúrate de tener un backup antes de aplicar la migración.

## Notas

- Esta migración es **irreversible sin intervención manual**
- No hay pérdida de datos: todos los usuarios con `super_admin` se migran a `superAdmin = true`
- Los roles en `user_client_access` se convierten automáticamente a `admin`
- El enum `Role` se recrea sin `super_admin`, pero los datos existentes se preservan
