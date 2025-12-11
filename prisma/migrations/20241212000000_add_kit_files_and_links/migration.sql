-- CreateTable
CREATE TABLE "kit_files" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kit_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kit_links" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kit_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "kit_files_kitId_idx" ON "kit_files"("kitId");

-- CreateIndex
CREATE INDEX "kit_files_uploadedAt_idx" ON "kit_files"("uploadedAt");

-- CreateIndex
CREATE INDEX "kit_links_kitId_idx" ON "kit_links"("kitId");

-- CreateIndex
CREATE INDEX "kit_links_createdAt_idx" ON "kit_links"("createdAt");

-- AddForeignKey
ALTER TABLE "kit_files" ADD CONSTRAINT "kit_files_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_links" ADD CONSTRAINT "kit_links_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
