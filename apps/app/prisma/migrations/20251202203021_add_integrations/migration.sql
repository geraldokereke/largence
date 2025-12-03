-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('NOTION', 'GOOGLE_DRIVE', 'DROPBOX', 'SLACK', 'MICROSOFT_365', 'DOCUSIGN', 'GOOGLE_SHEETS', 'SALESFORCE', 'TRELLO', 'ASANA', 'ZAPIER', 'AIRTABLE', 'HUBSPOT');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('PENDING', 'CONNECTED', 'DISCONNECTED', 'ERROR', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUCCESS', 'PARTIAL', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'INTEGRATION_CONNECTED';
ALTER TYPE "AuditAction" ADD VALUE 'INTEGRATION_DISCONNECTED';
ALTER TYPE "AuditAction" ADD VALUE 'INTEGRATION_SYNCED';
ALTER TYPE "AuditAction" ADD VALUE 'INTEGRATION_ERROR';

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'PENDING',
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "externalAccountId" TEXT,
    "externalEmail" TEXT,
    "scope" TEXT[],
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "syncFrequency" TEXT NOT NULL DEFAULT 'realtime',
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncStatus" TEXT,
    "lastSyncError" TEXT,
    "syncedItemsCount" INTEGER NOT NULL DEFAULT 0,
    "settings" JSONB,
    "features" TEXT[],
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSync" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "status" "SyncStatus" NOT NULL,
    "itemsSynced" INTEGER NOT NULL DEFAULT 0,
    "itemsFailed" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "details" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "IntegrationSync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Integration_organizationId_idx" ON "Integration"("organizationId");

-- CreateIndex
CREATE INDEX "Integration_provider_idx" ON "Integration"("provider");

-- CreateIndex
CREATE INDEX "Integration_status_idx" ON "Integration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_organizationId_provider_key" ON "Integration"("organizationId", "provider");

-- CreateIndex
CREATE INDEX "IntegrationSync_integrationId_idx" ON "IntegrationSync"("integrationId");

-- CreateIndex
CREATE INDEX "IntegrationSync_startedAt_idx" ON "IntegrationSync"("startedAt");

-- AddForeignKey
ALTER TABLE "IntegrationSync" ADD CONSTRAINT "IntegrationSync_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
