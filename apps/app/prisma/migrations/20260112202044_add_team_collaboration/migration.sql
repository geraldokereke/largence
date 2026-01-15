-- CreateEnum
CREATE TYPE "DocumentVisibility" AS ENUM ('PRIVATE', 'TEAM', 'SHARED');

-- CreateEnum
CREATE TYPE "CollaboratorPermission" AS ENUM ('VIEW', 'COMMENT', 'EDIT', 'ADMIN');

-- AlterEnum
ALTER TYPE "PlanType" ADD VALUE 'BUSINESS';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "visibility" "DocumentVisibility" NOT NULL DEFAULT 'PRIVATE';

-- CreateTable
CREATE TABLE "DocumentCollaborator" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addedByUserId" TEXT NOT NULL,
    "permission" "CollaboratorPermission" NOT NULL DEFAULT 'VIEW',
    "lastAccessedAt" TIMESTAMP(3),
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentCollaborator_documentId_idx" ON "DocumentCollaborator"("documentId");

-- CreateIndex
CREATE INDEX "DocumentCollaborator_userId_idx" ON "DocumentCollaborator"("userId");

-- CreateIndex
CREATE INDEX "DocumentCollaborator_addedByUserId_idx" ON "DocumentCollaborator"("addedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentCollaborator_documentId_userId_key" ON "DocumentCollaborator"("documentId", "userId");

-- CreateIndex
CREATE INDEX "Document_visibility_idx" ON "Document"("visibility");

-- AddForeignKey
ALTER TABLE "DocumentCollaborator" ADD CONSTRAINT "DocumentCollaborator_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
