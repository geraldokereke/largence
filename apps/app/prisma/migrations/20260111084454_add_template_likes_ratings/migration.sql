-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "authorAvatar" TEXT,
ADD COLUMN     "authorName" TEXT,
ADD COLUMN     "includedClauses" TEXT[],
ADD COLUMN     "keyFeatures" TEXT[],
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "suitableFor" TEXT[];

-- CreateTable
CREATE TABLE "TemplateLike" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "sessionId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateRating" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "sessionId" TEXT,
    "userId" TEXT,
    "userName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TemplateLike_templateId_idx" ON "TemplateLike"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateLike_templateId_sessionId_key" ON "TemplateLike"("templateId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateLike_templateId_userId_key" ON "TemplateLike"("templateId", "userId");

-- CreateIndex
CREATE INDEX "TemplateRating_templateId_idx" ON "TemplateRating"("templateId");

-- CreateIndex
CREATE INDEX "TemplateRating_rating_idx" ON "TemplateRating"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateRating_templateId_sessionId_key" ON "TemplateRating"("templateId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateRating_templateId_userId_key" ON "TemplateRating"("templateId", "userId");

-- CreateIndex
CREATE INDEX "Template_likeCount_idx" ON "Template"("likeCount");

-- CreateIndex
CREATE INDEX "Template_rating_idx" ON "Template"("rating");

-- CreateIndex
CREATE INDEX "Template_usageCount_idx" ON "Template"("usageCount");

-- AddForeignKey
ALTER TABLE "TemplateLike" ADD CONSTRAINT "TemplateLike_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateRating" ADD CONSTRAINT "TemplateRating_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;
