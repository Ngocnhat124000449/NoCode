# ScamShield — Changelog

All notable changes to the ScamShield Android app are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/), versioning is [SemVer](https://semver.org/).

| versionName | versionCode | Status |
|-------------|-------------|--------|
| 1.0.1       | 2           | Current |
| 1.0         | 1           | Superseded (artifact overwritten during permission-fix rebuild) |

---

## [1.0.1] — 2026-05-18 — `versionCode 2`

**APK:** `releases/ScamShield-v1.0.1-b2.apk` (24 MB)
**SHA256:** `312ff0c59bc380ddeb2f2ac93dc7b2e731dc14a4013fcff6f2da1b09bcca868a`

### Fixed
- **Permission flow now actually asks the OS for permission.** Previously both `PermissionScreen` and `PermissionManagementScreen` had fake handlers that only set local React state to `'granted'`, so the UI showed "✓ Đã cấp" while Android still had the permission denied. CallScreening, notifications, and contacts lookup all silently failed. Both screens now call `PermissionsAndroid.check()` on mount and `PermissionsAndroid.request()` on tap, with an `AppState` listener that re-checks when the user returns from Settings.
- Android 13+ `POST_NOTIFICATIONS` is now gated behind `Platform.Version >= 33` (older API auto-grants at install time).
- Blocked permission (`NEVER_ASK_AGAIN`) now renders "Mở Cài đặt" that opens the system Settings via `Linking.openSettings()`.

### Notes
- The `1.0` build artifact (`versionCode 1`) was overwritten on disk when this release was built — only `1.0.1` is preserved going forward.

---

## [1.0] — 2026-05-18 — `versionCode 1`

**APK:** ~~`releases/ScamShield-v1.0-b1.apk`~~ (superseded, file no longer exists)

### Added
- Initial signed release APK.
- 20 React Native screens (onboarding, permissions, auth, home, lookup, report, profile, settings, legal, system overlay).
- Native Android CallScreeningService with heads-up notification on incoming scam calls.
- Backend integration with `https://duan6-lemon.vercel.app` (NestJS + Prisma + Neon Postgres).
- Vietnamese phone classification: 70-entry official whitelist + 1900/1800 impersonation detection.
- Firebase Cloud Messaging token registration after login (subscribes to `community-alerts` topic).
- MMKV-backed offline-first risk cache.
- Linked to GitHub Pages legal documents (Privacy Policy, Terms of Service, Data Deletion).

### Known issues at this version
- Permission UI was decorative — see fix in 1.0.1.
