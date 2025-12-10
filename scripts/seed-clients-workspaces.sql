-- Script para insertar clientes y workspaces adicionales para pruebas
-- Este script agrega más datos de prueba a la base de datos

DO $$
DECLARE
    user_id_val TEXT := 'HJs6XmOU41egSfCjIZ0P8U1UcXh2';
    client_acme_id TEXT := 'client_acme_corp';
    client_tech_startup_id TEXT := 'client_tech_startup';
    client_design_agency_id TEXT := 'client_design_agency';
    workspace_acme_main_id TEXT := 'workspace_acme_main';
    workspace_acme_mobile_id TEXT := 'workspace_acme_mobile';
    workspace_tech_web_id TEXT := 'workspace_tech_web';
    workspace_tech_api_id TEXT := 'workspace_tech_api';
    workspace_agency_brand_id TEXT := 'workspace_agency_brand';
    workspace_agency_ui_id TEXT := 'workspace_agency_ui';
BEGIN
    -- Insertar nuevos clientes
    INSERT INTO "clients" (id, name, slug, plan, settings, "createdAt", "updatedAt")
    VALUES
        (
            client_acme_id,
            'ACME Corporation',
            'acme-corp',
            'enterprise',
            '{"allowedDomains": ["acme.com", "acme-corp.com"], "advancedAnalytics": true, "teamCollaboration": true, "customIntegrations": true}'::jsonb,
            NOW(),
            NOW()
        ),
        (
            client_tech_startup_id,
            'Tech Startup',
            'tech-startup',
            'pro',
            '{"allowedDomains": ["techstartup.io"], "teamCollaboration": true, "versionControl": true}'::jsonb,
            NOW(),
            NOW()
        ),
        (
            client_design_agency_id,
            'Creative Design Agency',
            'creative-design-agency',
            'pro',
            '{"allowedDomains": ["creativedesign.com"], "teamCollaboration": true, "clientPortal": true}'::jsonb,
            NOW(),
            NOW()
        )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        plan = EXCLUDED.plan,
        settings = EXCLUDED.settings,
        "updatedAt" = EXCLUDED."updatedAt";

    -- Insertar workspaces para ACME Corporation
    INSERT INTO "workspaces" (id, "clientId", name, slug, description, settings, "createdAt", "updatedAt")
    VALUES
        (
            workspace_acme_main_id,
            client_acme_id,
            'Main Platform',
            'main-platform',
            'Workspace principal para la plataforma web de ACME',
            '{"features": ["componentLibrary", "designTokens", "advancedAnalytics", "a11y"]}'::jsonb,
            NOW(),
            NOW()
        ),
        (
            workspace_acme_mobile_id,
            client_acme_id,
            'Mobile App',
            'mobile-app',
            'Workspace dedicado a la aplicación móvil de ACME',
            '{"features": ["mobileComponents", "designTokens", "platformSpecific"]}'::jsonb,
            NOW(),
            NOW()
        )
    ON CONFLICT (id) DO NOTHING;

    -- Insertar workspaces para Tech Startup
    INSERT INTO "workspaces" (id, "clientId", name, slug, description, settings, "createdAt", "updatedAt")
    VALUES
        (
            workspace_tech_web_id,
            client_tech_startup_id,
            'Web Application',
            'web-application',
            'Workspace para la aplicación web principal',
            '{"features": ["componentLibrary", "designSystem", "responsiveDesign"]}'::jsonb,
            NOW(),
            NOW()
        ),
        (
            workspace_tech_api_id,
            client_tech_startup_id,
            'API Dashboard',
            'api-dashboard',
            'Workspace para el dashboard de administración de APIs',
            '{"features": ["dataVisualization", "realTimeUpdates", "monitoring"]}'::jsonb,
            NOW(),
            NOW()
        )
    ON CONFLICT (id) DO NOTHING;

    -- Insertar workspaces para Creative Design Agency
    INSERT INTO "workspaces" (id, "clientId", name, slug, description, settings, "createdAt", "updatedAt")
    VALUES
        (
            workspace_agency_brand_id,
            client_design_agency_id,
            'Brand Identity',
            'brand-identity',
            'Workspace para proyectos de identidad de marca',
            '{"features": ["brandGuidelines", "logoLibrary", "typography"]}'::jsonb,
            NOW(),
            NOW()
        ),
        (
            workspace_agency_ui_id,
            client_design_agency_id,
            'UI Projects',
            'ui-projects',
            'Workspace para proyectos de diseño UI',
            '{"features": ["componentLibrary", "prototyping", "userFlows"]}'::jsonb,
            NOW(),
            NOW()
        )
    ON CONFLICT (id) DO NOTHING;

    -- Asignar acceso del usuario a los nuevos clientes
    INSERT INTO "user_client_access" (id, "userId", "clientId", role, "createdAt", "updatedAt")
    VALUES
        (gen_random_uuid(), user_id_val, client_acme_id, 'product_designer', NOW(), NOW()),
        (gen_random_uuid(), user_id_val, client_tech_startup_id, 'product_designer', NOW(), NOW()),
        (gen_random_uuid(), user_id_val, client_design_agency_id, 'product_designer', NOW(), NOW())
    ON CONFLICT ("userId", "clientId") DO NOTHING;

    -- Asignar acceso del usuario a los nuevos workspaces
    INSERT INTO "user_workspace_access" (id, "userId", "workspaceId", role, "createdAt", "updatedAt")
    VALUES
        (gen_random_uuid(), user_id_val, workspace_acme_main_id, 'product_designer', NOW(), NOW()),
        (gen_random_uuid(), user_id_val, workspace_acme_mobile_id, 'product_designer', NOW(), NOW()),
        (gen_random_uuid(), user_id_val, workspace_tech_web_id, 'product_designer', NOW(), NOW()),
        (gen_random_uuid(), user_id_val, workspace_tech_api_id, 'product_designer', NOW(), NOW()),
        (gen_random_uuid(), user_id_val, workspace_agency_brand_id, 'product_designer', NOW(), NOW()),
        (gen_random_uuid(), user_id_val, workspace_agency_ui_id, 'product_designer', NOW(), NOW())
    ON CONFLICT ("userId", "workspaceId") DO NOTHING;

    RAISE NOTICE 'Clientes y workspaces de prueba insertados exitosamente';
END $$;

-- Verificación de datos insertados
SELECT
    c.name AS cliente,
    c.plan,
    COUNT(DISTINCT w.id) AS total_workspaces,
    COUNT(DISTINCT uca.id) AS usuarios_con_acceso
FROM "clients" c
LEFT JOIN "workspaces" w ON w."clientId" = c.id
LEFT JOIN "user_client_access" uca ON uca."clientId" = c.id
WHERE c.id IN ('client_acme_corp', 'client_tech_startup', 'client_design_agency')
GROUP BY c.id, c.name, c.plan
ORDER BY c.name;

