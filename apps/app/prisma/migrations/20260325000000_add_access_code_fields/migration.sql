-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "accessCode" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "accessCodeRedeemedAt" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN "aiRequestsToday" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Subscription" ADD COLUMN "aiRequestsResetAt" TIMESTAMP(3);
