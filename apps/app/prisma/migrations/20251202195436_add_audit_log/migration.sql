-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('DOCUMENT_CREATED', 'DOCUMENT_UPDATED', 'DOCUMENT_DELETED', 'DOCUMENT_VIEWED', 'DOCUMENT_EXPORTED', 'DOCUMENT_SHARED', 'DOCUMENT_SIGNED', 'DOCUMENT_APPROVED', 'DOCUMENT_REJECTED', 'COMPLIANCE_CHECK_RUN', 'COMPLIANCE_CHECK_COMPLETED', 'USER_INVITED', 'USER_REMOVED', 'USER_ROLE_CHANGED', 'USER_LOGIN', 'USER_LOGOUT', 'SYSTEM_BACKUP', 'SYSTEM_RESTORE', 'SETTINGS_CHANGED');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actionLabel" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "entityName" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "device" TEXT,
    "userName" TEXT,
    "userAvatar" TEXT,
    "userType" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
