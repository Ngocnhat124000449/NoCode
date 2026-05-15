-- Rollback for: init_scam_report_risk_score
-- Generated: 2026-05-14
-- Run this to revert the migration

-- Drop indexes first
DROP INDEX IF EXISTS "risk_scores_phoneHash_idx";
DROP INDEX IF EXISTS "risk_scores_phoneHash_key";
DROP INDEX IF EXISTS "scam_reports_phoneHash_idx";

-- Drop tables
DROP TABLE IF EXISTS "risk_scores";
DROP TABLE IF EXISTS "scam_reports";
