-- CreateEnum
CREATE TYPE "MatterStatus" AS ENUM ('ACTIVE', 'PENDING', 'ON_HOLD', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('HOURLY', 'FLAT_FEE', 'CONTINGENCY', 'RETAINER', 'PRO_BONO');

-- CreateEnum
CREATE TYPE "SignatureStatus" AS ENUM ('PENDING', 'VIEWED', 'SIGNED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SignatureType" AS ENUM ('DRAW', 'TYPE', 'UPLOAD');

-- CreateEnum
CREATE TYPE "SharePermission" AS ENUM ('VIEW', 'COMMENT', 'EDIT', 'SIGN');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "matterId" TEXT;

-- CreateTable
CREATE TABLE "Matter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "matterNumber" TEXT,
    "status" "MatterStatus" NOT NULL DEFAULT 'ACTIVE',
    "clientName" TEXT,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "clientCompany" TEXT,
    "matterType" TEXT,
    "practiceArea" TEXT,
    "openDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closeDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "billingType" "BillingType" NOT NULL DEFAULT 'HOURLY',
    "hourlyRate" DOUBLE PRECISION,
    "flatFee" DOUBLE PRECISION,
    "retainerAmount" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Matter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentSignature" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "signerName" TEXT NOT NULL,
    "signerEmail" TEXT NOT NULL,
    "signerRole" TEXT,
    "status" "SignatureStatus" NOT NULL DEFAULT 'PENDING',
    "signatureData" TEXT,
    "signatureType" "SignatureType" NOT NULL DEFAULT 'DRAW',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "signedAt" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "signOrder" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentSignature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentShare" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "sharedByUserId" TEXT NOT NULL,
    "sharedWithEmail" TEXT,
    "sharedWithUserId" TEXT,
    "permission" "SharePermission" NOT NULL DEFAULT 'VIEW',
    "accessToken" TEXT NOT NULL,
    "password" TEXT,
    "expiresAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentComment" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT,
    "content" TEXT NOT NULL,
    "selectionStart" INTEGER,
    "selectionEnd" INTEGER,
    "selectedText" TEXT,
    "parentId" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clause" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "tags" TEXT[],
    "jurisdiction" TEXT,
    "documentTypes" TEXT[],
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clause_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Matter_userId_idx" ON "Matter"("userId");

-- CreateIndex
CREATE INDEX "Matter_organizationId_idx" ON "Matter"("organizationId");

-- CreateIndex
CREATE INDEX "Matter_status_idx" ON "Matter"("status");

-- CreateIndex
CREATE INDEX "Matter_clientName_idx" ON "Matter"("clientName");

-- CreateIndex
CREATE INDEX "Matter_matterNumber_idx" ON "Matter"("matterNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSignature_accessToken_key" ON "DocumentSignature"("accessToken");

-- CreateIndex
CREATE INDEX "DocumentSignature_documentId_idx" ON "DocumentSignature"("documentId");

-- CreateIndex
CREATE INDEX "DocumentSignature_signerEmail_idx" ON "DocumentSignature"("signerEmail");

-- CreateIndex
CREATE INDEX "DocumentSignature_status_idx" ON "DocumentSignature"("status");

-- CreateIndex
CREATE INDEX "DocumentSignature_accessToken_idx" ON "DocumentSignature"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentShare_accessToken_key" ON "DocumentShare"("accessToken");

-- CreateIndex
CREATE INDEX "DocumentShare_documentId_idx" ON "DocumentShare"("documentId");

-- CreateIndex
CREATE INDEX "DocumentShare_sharedWithEmail_idx" ON "DocumentShare"("sharedWithEmail");

-- CreateIndex
CREATE INDEX "DocumentShare_accessToken_idx" ON "DocumentShare"("accessToken");

-- CreateIndex
CREATE INDEX "DocumentComment_documentId_idx" ON "DocumentComment"("documentId");

-- CreateIndex
CREATE INDEX "DocumentComment_parentId_idx" ON "DocumentComment"("parentId");

-- CreateIndex
CREATE INDEX "DocumentComment_userId_idx" ON "DocumentComment"("userId");

-- CreateIndex
CREATE INDEX "Clause_userId_idx" ON "Clause"("userId");

-- CreateIndex
CREATE INDEX "Clause_organizationId_idx" ON "Clause"("organizationId");

-- CreateIndex
CREATE INDEX "Clause_category_idx" ON "Clause"("category");

-- CreateIndex
CREATE INDEX "Clause_usageCount_idx" ON "Clause"("usageCount");

-- CreateIndex
CREATE INDEX "Document_matterId_idx" ON "Document"("matterId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSignature" ADD CONSTRAINT "DocumentSignature_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentShare" ADD CONSTRAINT "DocumentShare_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentComment" ADD CONSTRAINT "DocumentComment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentComment" ADD CONSTRAINT "DocumentComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DocumentComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
