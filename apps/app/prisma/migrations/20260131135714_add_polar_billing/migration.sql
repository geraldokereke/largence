/*
  Warnings:

  - A unique constraint covering the columns `[polarCustomerId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[polarSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/

-- Add new enum values (PostgreSQL requires these to be committed before use)
ALTER TYPE "PaymentProvider" ADD VALUE IF NOT EXISTS 'POLAR';
ALTER TYPE "PlanType" ADD VALUE IF NOT EXISTS 'STUDENT';
ALTER TYPE "PlanType" ADD VALUE IF NOT EXISTS 'PRO';
ALTER TYPE "PlanType" ADD VALUE IF NOT EXISTS 'MAX';
ALTER TYPE "UsageType" ADD VALUE IF NOT EXISTS 'AI_TOKEN_USAGE';

-- AlterTable - add new columns first
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "isStudentVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "polarCheckoutId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "polarCustomerId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "polarProductId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "polarSubscriptionId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "studentEmail" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "studentVerifiedAt" TIMESTAMP(3);

-- Make stripeCustomerId nullable
ALTER TABLE "Subscription" ALTER COLUMN "stripeCustomerId" DROP NOT NULL;

-- AlterTable UsageRecord
ALTER TABLE "UsageRecord" ADD COLUMN IF NOT EXISTS "amount" INTEGER;

-- CreateIndex (ignore if exists)
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_polarCustomerId_key" ON "Subscription"("polarCustomerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_polarSubscriptionId_key" ON "Subscription"("polarSubscriptionId");
