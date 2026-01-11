-- CreateEnum
CREATE TYPE "VersionChangeType" AS ENUM ('CREATE', 'EDIT', 'STATUS_CHANGE', 'AI_REGENERATE', 'COMPLIANCE_FIX', 'RESTORE');

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL,
    "changeType" "VersionChangeType" NOT NULL DEFAULT 'EDIT',
    "changeSummary" TEXT,
    "changedFields" TEXT[],
    "userId" TEXT NOT NULL,
    "userName" TEXT,
    "userAvatar" TEXT,
    "auditLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_auditLogId_key" ON "DocumentVersion"("auditLogId");

-- CreateIndex
CREATE INDEX "DocumentVersion_documentId_idx" ON "DocumentVersion"("documentId");

-- CreateIndex
CREATE INDEX "DocumentVersion_version_idx" ON "DocumentVersion"("version");

-- CreateIndex
CREATE INDEX "DocumentVersion_userId_idx" ON "DocumentVersion"("userId");

-- CreateIndex
CREATE INDEX "DocumentVersion_createdAt_idx" ON "DocumentVersion"("createdAt");

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
