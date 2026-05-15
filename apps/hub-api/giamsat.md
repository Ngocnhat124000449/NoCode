
## [observability-setup] — 18:18:26 14/5/2026

**Trạng thái:** ✅ Pass

**Mô tả:** Thiết lập Prometheus metrics registry (5 counters + 1 histogram), expose /metrics endpoint, instrument RiskService với latency + cache hit/miss tracking, Prometheus + Grafana (4 panels) trong docker-compose, Sentry init cho cả mobile và backend.

**Files thay đổi:**
- apps/hub-api/src/metrics/metrics.service.ts (đã có — verify)
- apps/hub-api/src/metrics/metrics.controller.ts (đã có — verify)
- apps/hub-api/src/metrics/metrics.module.ts (đã có — verify)
- apps/hub-api/src/metrics/metrics.service.spec.ts (mới — 8 tests)
- apps/hub-api/src/app.module.ts (thêm MetricsModule)
- apps/hub-api/src/risk/risk.service.ts (inject MetricsService, instrument getStoredScore)
- apps/hub-api/src/risk/risk.service.spec.ts (mock MetricsService)
- apps/hub-api/src/main.ts (initSentry — optional, skip nếu DSN rỗng)
- apps/hub-api/.env (thêm SENTRY_DSN, NODE_ENV)
- apps/mobile/src/observability/sentry.ts (mới)
- apps/mobile/src/observability/sentry.spec.ts (mới — 3 tests)
- apps/mobile/src/__stubs__/sentry.ts (mới)
- apps/mobile/package.json (moduleNameMapper @sentry/react-native)
- docker-compose.yml (thêm prometheus + grafana với security hardening)
- docker/prometheus.yml (mới)
- docker/grafana/provisioning/datasources/prometheus.yml (mới)
- docker/grafana/provisioning/dashboards/dashboards.yml (mới)
- docker/grafana/provisioning/dashboards/icproject.json (mới — 4 panels)

**Kết quả xác minh:**
hub-api: 67 tests passed, 0 failed (7 suites)
mobile: 29 tests passed, 0 failed (7 suites)
TypeScript: 0 errors
Docker security: no-new-privileges + read_only + tmpfs cho tất cả services
Grafana dashboard: 4 panels (P95, cache hit rate, timeout rate, false positive rate)
Prometheus target: hub-api scrape config via host.docker.internal:3000

**Bước tiếp theo:** Phase 4 Skill 14 — rate-limit-abuse-detection.

---

## [rate-limit-abuse-detection] — 18:25:03 14/5/2026

**Trạng thái:** ✅ Pass

**Mô tả:** Triển khai rate limiting và abuse detection cho /report (5 req/min) và /risk/lookup (30 req/min). Redis-backed throttler storage, BanCheckGuard, AbuseDetectionService với soft ban 15 phút + hard ban DB, Prisma schema BannedIp + AbuseEvent.

**Files thay đổi:**
- apps/hub-api/src/throttle/redis-throttler.storage.ts (mới)
- apps/hub-api/src/throttle/abuse-detection.service.ts (mới)
- apps/hub-api/src/throttle/ban-check.guard.ts (mới)
- apps/hub-api/src/throttle/throttle.module.ts (mới)
- apps/hub-api/src/throttle/abuse-detection.service.spec.ts (mới — 7 tests)
- apps/hub-api/src/app.module.ts (thêm ThrottlerModule + ThrottleModule)
- apps/hub-api/src/report/report.controller.ts (UseGuards + Throttle)
- apps/hub-api/src/risk/risk.controller.ts (BanCheckGuard + Throttle trên /lookup)
- apps/hub-api/prisma/schema.prisma (thêm BannedIp + AbuseEvent models)
- apps/hub-api/prisma/migrations/20260514111928_add_abuse_tracking/migration.sql (mới)

**Kết quả xác minh:**
Tests: 74 passed, 0 failed (8 suites)
TypeScript: 0 errors
Migration applied: banned_ips + abuse_events tables created
Rate limits: /report 5 req/min, /risk/lookup 30 req/min
Soft ban: 900s TTL in Redis after burst threshold (10 req/60s)
Hard ban: persisted in DB via bannedIp.upsert

**Bước tiếp theo:** Tất cả 14 skills đã hoàn thành. Dự án ICProject 2026 Phase 1–4 DONE.

---
