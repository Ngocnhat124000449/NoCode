-- CreateTable
CREATE TABLE "scam_reports" (
    "id" TEXT NOT NULL,
    "phoneHash" TEXT NOT NULL,
    "scenarioType" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scam_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_scores" (
    "id" TEXT NOT NULL,
    "phoneHash" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'low',
    "reasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "action" TEXT NOT NULL DEFAULT 'allow',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scam_reports_phoneHash_idx" ON "scam_reports"("phoneHash");

-- CreateIndex
CREATE UNIQUE INDEX "risk_scores_phoneHash_key" ON "risk_scores"("phoneHash");

-- CreateIndex
CREATE INDEX "risk_scores_phoneHash_idx" ON "risk_scores"("phoneHash");
