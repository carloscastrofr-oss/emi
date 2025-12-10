-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ux_ui_designer', 'product_designer', 'product_design_lead', 'admin', 'super_admin');

-- CreateEnum
CREATE TYPE "ClientPlan" AS ENUM ('free', 'pro', 'enterprise');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "photoUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ux_ui_designer',
    "preferences" JSONB,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "plan" "ClientPlan" NOT NULL DEFAULT 'free',
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_client_access" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "role" "Role",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_client_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_workspace_access" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" "Role",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_workspace_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_session_config" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultClientId" TEXT,
    "defaultWorkspaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_session_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "clients_slug_key" ON "clients"("slug");

-- CreateIndex
CREATE INDEX "clients_slug_idx" ON "clients"("slug");

-- CreateIndex
CREATE INDEX "clients_createdAt_idx" ON "clients"("createdAt");

-- CreateIndex
CREATE INDEX "workspaces_clientId_idx" ON "workspaces"("clientId");

-- CreateIndex
CREATE INDEX "workspaces_slug_idx" ON "workspaces"("slug");

-- CreateIndex
CREATE INDEX "workspaces_createdAt_idx" ON "workspaces"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_clientId_slug_key" ON "workspaces"("clientId", "slug");

-- CreateIndex
CREATE INDEX "user_client_access_userId_idx" ON "user_client_access"("userId");

-- CreateIndex
CREATE INDEX "user_client_access_clientId_idx" ON "user_client_access"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "user_client_access_userId_clientId_key" ON "user_client_access"("userId", "clientId");

-- CreateIndex
CREATE INDEX "user_workspace_access_userId_idx" ON "user_workspace_access"("userId");

-- CreateIndex
CREATE INDEX "user_workspace_access_workspaceId_idx" ON "user_workspace_access"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "user_workspace_access_userId_workspaceId_key" ON "user_workspace_access"("userId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "user_session_config_userId_key" ON "user_session_config"("userId");

-- CreateIndex
CREATE INDEX "user_session_config_userId_idx" ON "user_session_config"("userId");

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_client_access" ADD CONSTRAINT "user_client_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_client_access" ADD CONSTRAINT "user_client_access_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_workspace_access" ADD CONSTRAINT "user_workspace_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_workspace_access" ADD CONSTRAINT "user_workspace_access_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_session_config" ADD CONSTRAINT "user_session_config_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_session_config" ADD CONSTRAINT "user_session_config_defaultClientId_fkey" FOREIGN KEY ("defaultClientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_session_config" ADD CONSTRAINT "user_session_config_defaultWorkspaceId_fkey" FOREIGN KEY ("defaultWorkspaceId") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
