-- AlterTable: Agregar columna createdBy a kit_links
ALTER TABLE "kit_links" ADD COLUMN "createdBy" TEXT;

-- Actualizar valores existentes (usar un valor por defecto si es necesario)
-- Para enlaces existentes sin createdBy, usar un valor vacío temporalmente
UPDATE "kit_links" SET "createdBy" = '' WHERE "createdBy" IS NULL;

-- Hacer la columna NOT NULL con default
ALTER TABLE "kit_links" ALTER COLUMN "createdBy" SET NOT NULL;
ALTER TABLE "kit_links" ALTER COLUMN "createdBy" SET DEFAULT '';
