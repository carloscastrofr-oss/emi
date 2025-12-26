-- CreateEnum
CREATE TYPE "ClientRole" AS ENUM ('admin');

-- Step 1: Add superAdmin column to users table
ALTER TABLE "users" ADD COLUMN "superAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Migrate existing super_admin users to superAdmin = true
UPDATE "users" SET "superAdmin" = true WHERE "role" = 'super_admin';

-- Step 3: Remove any super_admin roles from user_client_access (shouldn't exist, but clean up just in case)
DELETE FROM "user_client_access" WHERE "role" = 'super_admin';

-- Step 4: Drop the index on users.role
DROP INDEX IF EXISTS "users_role_idx";

-- Step 5: Drop the role column from users table
ALTER TABLE "users" DROP COLUMN "role";

-- Step 6: Create index on superAdmin
CREATE INDEX "users_superAdmin_idx" ON "users"("superAdmin");

-- Step 7: Alter user_client_access to use ClientRole instead of Role
-- IMPORTANT: ClientRole only has 'admin', so we need to convert all non-null roles to 'admin'
-- First, update existing data: convert all non-null roles to 'admin'
UPDATE "user_client_access" SET "role" = 'admin' WHERE "role" IS NOT NULL AND "role" != 'admin';

-- Validate: Ensure no invalid roles remain (should not happen, but safe check)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "user_client_access" WHERE "role" IS NOT NULL AND "role"::text NOT IN ('admin')) THEN
    RAISE EXCEPTION 'Cannot migrate: user_client_access contains roles other than admin. All roles must be admin.';
  END IF;
END $$;

-- Change column type from Role to ClientRole
-- This preserves NULL values and converts 'admin' to ClientRole 'admin'
-- We need to cast through text first because we're changing enum types
ALTER TABLE "user_client_access" 
  ALTER COLUMN "role" TYPE "ClientRole" 
  USING CASE 
    WHEN "role"::text = 'admin' THEN 'admin'::"ClientRole"
    ELSE NULL
  END;

-- Step 8: Remove 'super_admin' from Role enum
-- This is tricky in PostgreSQL - we need to create a new enum without super_admin and migrate
-- IMPORTANT: First, ensure no data has 'super_admin' value in user_workspace_access
-- (This should not happen, but we validate to be safe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM user_workspace_access WHERE role::text = 'super_admin') THEN
    RAISE EXCEPTION 'Cannot migrate: user_workspace_access contains super_admin roles. Remove them first.';
  END IF;
END $$;

-- Create new enum without super_admin
CREATE TYPE "Role_new" AS ENUM ('ux_ui_designer', 'product_designer', 'product_design_lead', 'admin');

-- Update user_workspace_access to use the new enum
ALTER TABLE "user_workspace_access" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");

-- Drop the old enum (this will fail if any other table/column references it)
DROP TYPE "Role";

-- Rename the new enum to Role
ALTER TYPE "Role_new" RENAME TO "Role";

