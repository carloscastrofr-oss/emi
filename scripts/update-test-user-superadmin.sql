-- Script SQL para actualizar usuario de prueba con superAdmin y rol en workspace
-- Ejecutar con: docker compose exec -T postgres psql -U emi_user -d emi_dev < scripts/update-test-user-superadmin.sql
-- O con psql directo: psql -U emi_user -d emi_dev -f scripts/update-test-user-superadmin.sql

-- Variables
\set user_email 'carloscastro.fr@multiplica.com'
\set user_id 'HJs6XmOU41egSfCjIZ0P8U1UcXh2'

-- Actualizar usuario: establecer superAdmin = true
UPDATE users
SET "superAdmin" = true,
    "updatedAt" = NOW()
WHERE id = :'user_id' OR email = :'user_email';

-- Verificar que el usuario existe
DO $$
DECLARE
    user_exists BOOLEAN;
    workspace_id_val TEXT;
BEGIN
    -- Verificar si el usuario existe
    SELECT EXISTS(SELECT 1 FROM users WHERE id = :'user_id' OR email = :'user_email') INTO user_exists;
    
    IF NOT user_exists THEN
        RAISE EXCEPTION 'Usuario con ID % o email % no encontrado', :'user_id', :'user_email';
    END IF;

    -- Obtener el primer workspace disponible (si existe)
    SELECT id INTO workspace_id_val
    FROM workspaces
    LIMIT 1;

    -- Si hay un workspace, asignar rol product_designer al usuario en ese workspace
    IF workspace_id_val IS NOT NULL THEN
        -- Insertar o actualizar acceso al workspace con rol product_designer
        INSERT INTO user_workspace_access (id, "userId", "workspaceId", role, "createdAt", "updatedAt")
        VALUES (
            gen_random_uuid()::text,
            :'user_id',
            workspace_id_val,
            'product_designer'::"Role",
            NOW(),
            NOW()
        )
        ON CONFLICT ("userId", "workspaceId")
        DO UPDATE SET
            role = 'product_designer'::"Role",
            "updatedAt" = NOW();
        
        RAISE NOTICE 'Rol product_designer asignado al usuario en workspace %', workspace_id_val;
    ELSE
        RAISE NOTICE 'No hay workspaces disponibles. El usuario tiene superAdmin pero no tiene rol en workspace.';
    END IF;

    RAISE NOTICE 'Usuario % actualizado: superAdmin = true', :'user_email';
END $$;

-- Mostrar resultado
SELECT 
    id,
    email,
    "superAdmin",
    "displayName",
    "emailVerified"
FROM users
WHERE id = :'user_id' OR email = :'user_email';

-- Mostrar accesos a workspaces del usuario
SELECT 
    uwa.id,
    uwa."userId",
    uwa."workspaceId",
    uwa.role,
    w.name as workspace_name,
    w.slug as workspace_slug
FROM user_workspace_access uwa
JOIN workspaces w ON w.id = uwa."workspaceId"
WHERE uwa."userId" = :'user_id';

-- Mostrar accesos a clientes del usuario (deberían estar vacíos o solo admin si existen)
SELECT 
    uca.id,
    uca."userId",
    uca."clientId",
    uca.role,
    c.name as client_name,
    c.slug as client_slug
FROM user_client_access uca
JOIN clients c ON c.id = uca."clientId"
WHERE uca."userId" = :'user_id';

