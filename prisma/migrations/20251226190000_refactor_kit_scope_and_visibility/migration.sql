-- Step 1: Add 'personal' to KitItemScope enum
-- Note: ALTER TYPE ADD VALUE cannot be executed inside a transaction block in some Postgres versions
-- But we'll try it here.
ALTER TYPE "KitItemScope" ADD VALUE IF NOT EXISTS 'personal';

-- Step 2: Add columns to kits table
ALTER TABLE "kits" ADD COLUMN IF NOT EXISTS "scope" "KitItemScope" NOT NULL DEFAULT 'workspace';
ALTER TABLE "kits" ADD COLUMN IF NOT EXISTS "ownerId" TEXT;
ALTER TABLE "kits" ADD COLUMN IF NOT EXISTS "clientId" TEXT;
ALTER TABLE "kits" ADD COLUMN IF NOT EXISTS "workspaceId" TEXT;

-- Step 3: Create indexes for new columns
CREATE INDEX IF NOT EXISTS "kits_scope_idx" ON "kits"("scope");
CREATE INDEX IF NOT EXISTS "kits_ownerId_idx" ON "kits"("ownerId");
CREATE INDEX IF NOT EXISTS "kits_clientId_idx" ON "kits"("clientId");
CREATE INDEX IF NOT EXISTS "kits_workspaceId_idx" ON "kits"("workspaceId");

-- Step 4: Drop columns from kit_files and kit_links
-- We'll do this safely by checking if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kit_files' AND column_name='scope') THEN
        ALTER TABLE "kit_files" DROP COLUMN "scope";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kit_files' AND column_name='workspaceId') THEN
        ALTER TABLE "kit_files" DROP COLUMN "workspaceId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kit_files' AND column_name='clientId') THEN
        ALTER TABLE "kit_files" DROP COLUMN "clientId";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kit_links' AND column_name='scope') THEN
        ALTER TABLE "kit_links" DROP COLUMN "scope";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kit_links' AND column_name='workspaceId') THEN
        ALTER TABLE "kit_links" DROP COLUMN "workspaceId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kit_links' AND column_name='clientId') THEN
        ALTER TABLE "kit_links" DROP COLUMN "clientId";
    END IF;
END $$;

