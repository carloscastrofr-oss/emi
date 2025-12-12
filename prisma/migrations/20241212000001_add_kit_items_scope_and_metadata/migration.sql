-- CreateEnum
CREATE TYPE "KitItemScope" AS ENUM ('workspace', 'client');

-- AlterTable: Agregar columnas con valores por defecto primero
ALTER TABLE "kit_files" ADD COLUMN "title" TEXT;
ALTER TABLE "kit_files" ADD COLUMN "scope" "KitItemScope";
ALTER TABLE "kit_files" ADD COLUMN "uploadedBy" TEXT;
ALTER TABLE "kit_files" ADD COLUMN "workspaceId" TEXT;
ALTER TABLE "kit_files" ADD COLUMN "clientId" TEXT;

-- Actualizar valores existentes antes de hacer NOT NULL
UPDATE "kit_files" SET "title" = "name" WHERE "title" IS NULL;
UPDATE "kit_files" SET "scope" = 'workspace' WHERE "scope" IS NULL;
UPDATE "kit_files" SET "uploadedBy" = '' WHERE "uploadedBy" IS NULL;

-- Ahora hacer las columnas NOT NULL con defaults
ALTER TABLE "kit_files" ALTER COLUMN "title" SET NOT NULL;
ALTER TABLE "kit_files" ALTER COLUMN "title" SET DEFAULT '';
ALTER TABLE "kit_files" ALTER COLUMN "scope" SET NOT NULL;
ALTER TABLE "kit_files" ALTER COLUMN "scope" SET DEFAULT 'workspace';
ALTER TABLE "kit_files" ALTER COLUMN "uploadedBy" SET NOT NULL;
ALTER TABLE "kit_files" ALTER COLUMN "uploadedBy" SET DEFAULT '';

-- AlterTable para links
ALTER TABLE "kit_links" ADD COLUMN "scope" "KitItemScope";
ALTER TABLE "kit_links" ADD COLUMN "workspaceId" TEXT;
ALTER TABLE "kit_links" ADD COLUMN "clientId" TEXT;

-- Actualizar valores existentes
UPDATE "kit_links" SET "scope" = 'workspace' WHERE "scope" IS NULL;

-- Hacer NOT NULL con default
ALTER TABLE "kit_links" ALTER COLUMN "scope" SET NOT NULL;
ALTER TABLE "kit_links" ALTER COLUMN "scope" SET DEFAULT 'workspace';

-- CreateIndex
CREATE INDEX "kit_files_workspaceId_idx" ON "kit_files"("workspaceId");

-- CreateIndex
CREATE INDEX "kit_files_clientId_idx" ON "kit_files"("clientId");

-- CreateIndex
CREATE INDEX "kit_files_scope_idx" ON "kit_files"("scope");

-- CreateIndex
CREATE INDEX "kit_links_workspaceId_idx" ON "kit_links"("workspaceId");

-- CreateIndex
CREATE INDEX "kit_links_clientId_idx" ON "kit_links"("clientId");

-- CreateIndex
CREATE INDEX "kit_links_scope_idx" ON "kit_links"("scope");
