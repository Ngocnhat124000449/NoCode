-- AlterTable
ALTER TABLE "scam_reports" ADD COLUMN     "reporterId" TEXT;

-- CreateIndex
CREATE INDEX "scam_reports_reporterId_idx" ON "scam_reports"("reporterId");

-- AddForeignKey
ALTER TABLE "scam_reports" ADD CONSTRAINT "scam_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
