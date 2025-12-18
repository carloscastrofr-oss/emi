-- Script para otorgar permisos completos al usuario postgres
-- Ejecutar este script desde pgAdmin conectado como usuario postgres o superusuario

-- NOTA: Este script debe ejecutarse desde pgAdmin, ya conectado a la base de datos 'product-designer-dev'
-- Si no estás conectado a la base de datos, conéctate primero antes de ejecutar este script

-- 1. Otorgar permisos en la base de datos (ejecutar desde la base de datos postgres o desde la conexión del servidor)
-- GRANT CONNECT ON DATABASE "product-designer-dev" TO postgres;
-- GRANT ALL PRIVILEGES ON DATABASE "product-designer-dev" TO postgres;

-- 2. Otorgar permisos en el schema public
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
ALTER SCHEMA public OWNER TO postgres;

-- 4. Otorgar permisos en todas las tablas existentes
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- 5. Cambiar el owner de todas las tablas a postgres
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO postgres';
    END LOOP;
END
$$;

-- 6. Cambiar el owner de todas las secuencias a postgres
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public'
    LOOP
        EXECUTE 'ALTER SEQUENCE public.' || quote_ident(r.sequence_name) || ' OWNER TO postgres';
    END LOOP;
END
$$;

-- 7. Otorgar permisos por defecto para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;

-- 8. Verificar permisos (opcional - para verificar que se aplicaron)
SELECT 
    tablename,
    tableowner,
    has_table_privilege('postgres', schemaname||'.'||tablename, 'SELECT') as can_select,
    has_table_privilege('postgres', schemaname||'.'||tablename, 'INSERT') as can_insert,
    has_table_privilege('postgres', schemaname||'.'||tablename, 'UPDATE') as can_update,
    has_table_privilege('postgres', schemaname||'.'||tablename, 'DELETE') as can_delete
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

