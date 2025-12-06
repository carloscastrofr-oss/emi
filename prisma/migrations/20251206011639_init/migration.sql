-- CreateEnum
CREATE TYPE "KitCategory" AS ENUM ('development', 'research', 'design', 'tokens');

-- CreateTable
CREATE TABLE "kits" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" "KitCategory" NOT NULL,
    "downloadUrl" TEXT,
    "docsUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "kits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "kits_category_idx" ON "kits"("category");

-- CreateIndex
CREATE INDEX "kits_isActive_idx" ON "kits"("isActive");

-- CreateIndex
CREATE INDEX "kits_createdAt_idx" ON "kits"("createdAt");
