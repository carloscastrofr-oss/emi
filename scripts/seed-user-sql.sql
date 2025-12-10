-- Script SQL para insertar datos de usuario de ejemplo
-- Ejecutar con: docker compose exec -T postgres psql -U emi_user -d emi_dev < scripts/seed-user-sql.sql

-- Variables (usaremos valores específicos)
\set user_email 'carloscastro.fr@multiplica.com'
\set user_id 'user_carloscastro_2024'
\set user_role 'product_designer'
\set client1_id 'client_multiplica_2024'
\set client2_id 'client_design_studio_2024'
\set workspace1_id 'workspace_proyecto_principal'
\set workspace2_id 'workspace_proyecto_beta'
\set workspace3_id 'workspace_design_system'

-- Insertar o actualizar usuario
INSERT INTO users (
    id, 
    email, 
    "displayName", 
    "photoUrl", 
    role, 
    preferences, 
    "emailVerified", 
    "lastLoginAt", 
    "createdAt", 
    "updatedAt"
) VALUES (
    :'user_id',
    :'user_email',
    'Carlos Castro',
    NULL,
    :'user_role'::"Role",
    '{"theme":"system","language":"es","notifications":{"email":true,"push":true,"inApp":true}}'::jsonb,
    true,
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE 
SET 
    role = :'user_role'::"Role",
    "displayName" = 'Carlos Castro',
    "updatedAt" = NOW();

-- Insertar clientes
INSERT INTO clients (id, name, slug, "logoUrl", plan, settings, "createdAt", "updatedAt")
VALUES 
    (
        :'client1_id',
        'Multiplica',
        'multiplica',
        NULL,
        'enterprise'::"ClientPlan",
        '{"allowedDomains":["multiplica.com","@multiplica.com"],"defaultRole":"product_designer","features":["advanced_analytics","team_collaboration","custom_branding"],"branding":{"primaryColor":"#0066CC"}}'::jsonb,
        NOW(),
        NOW()
    ),
    (
        :'client2_id',
        'Design Studio',
        'design-studio',
        NULL,
        'pro'::"ClientPlan",
        '{"allowedDomains":["designstudio.com"],"defaultRole":"product_designer","features":["team_collaboration"]}'::jsonb,
        NOW(),
        NOW()
    )
ON CONFLICT (slug) DO NOTHING;

-- Insertar workspaces
INSERT INTO workspaces (id, "clientId", name, slug, description, settings, "createdAt", "updatedAt")
VALUES 
    (
        :'workspace1_id',
        :'client1_id',
        'Proyecto Principal',
        'proyecto-principal',
        'Workspace principal para el proyecto de Multiplica',
        '{"features":["component_library","design_tokens"]}'::jsonb,
        NOW(),
        NOW()
    ),
    (
        :'workspace2_id',
        :'client1_id',
        'Proyecto Beta',
        'proyecto-beta',
        'Workspace para funcionalidades en beta',
        '{"features":["experimental_features"]}'::jsonb,
        NOW(),
        NOW()
    ),
    (
        :'workspace3_id',
        :'client2_id',
        'Design System',
        'design-system',
        'Sistema de diseño centralizado',
        '{"features":["component_library"]}'::jsonb,
        NOW(),
        NOW()
    )
ON CONFLICT ("clientId", slug) DO NOTHING;

-- Insertar accesos de usuario a clientes
INSERT INTO user_client_access (id, "userId", "clientId", role, "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid()::text, :'user_id', :'client1_id', :'user_role'::"Role", NOW(), NOW()),
    (gen_random_uuid()::text, :'user_id', :'client2_id', :'user_role'::"Role", NOW(), NOW())
ON CONFLICT ("userId", "clientId") DO NOTHING;

-- Insertar accesos de usuario a workspaces
INSERT INTO user_workspace_access (id, "userId", "workspaceId", role, "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid()::text, :'user_id', :'workspace1_id', :'user_role'::"Role", NOW(), NOW()),
    (gen_random_uuid()::text, :'user_id', :'workspace2_id', :'user_role'::"Role", NOW(), NOW()),
    (gen_random_uuid()::text, :'user_id', :'workspace3_id', :'user_role'::"Role", NOW(), NOW())
ON CONFLICT ("userId", "workspaceId") DO NOTHING;

-- Insertar configuración de sesión
INSERT INTO user_session_config (id, "userId", "defaultClientId", "defaultWorkspaceId", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    :'user_id',
    :'client1_id',
    :'workspace1_id',
    NOW(),
    NOW()
)
ON CONFLICT ("userId") DO UPDATE 
SET 
    "defaultClientId" = :'client1_id',
    "defaultWorkspaceId" = :'workspace1_id',
    "updatedAt" = NOW();

-- Mostrar resumen
SELECT 
    'Usuario creado:' as info,
    u.email,
    u.role,
    COUNT(DISTINCT uca."clientId") as total_clients,
    COUNT(DISTINCT uwa."workspaceId") as total_workspaces
FROM users u
LEFT JOIN user_client_access uca ON u.id = uca."userId"
LEFT JOIN user_workspace_access uwa ON u.id = uwa."userId"
WHERE u.email = :'user_email'
GROUP BY u.id, u.email, u.role;

