# Releases archive

Folder này chứa các bản APK đã build, mỗi bản tag theo `versionName` + `versionCode`.

## Naming convention

```
ScamShield-v<versionName>-b<versionCode>.apk
```

Ví dụ: `ScamShield-v1.0.1-b2.apk` là APK của `versionName "1.0.1"` và `versionCode 2`.

## Quy tắc bump version (SemVer)

| Thay đổi | Bump |
|---|---|
| Sửa bug nhỏ, không đổi logic / API | PATCH: 1.0.1 → 1.0.2 |
| Thêm tính năng mới, không phá vỡ tính năng cũ | MINOR: 1.0.x → 1.1.0 |
| Thay đổi lớn, ảnh hưởng tính năng cũ / breaking change | MAJOR: 1.x.x → 2.0.0 |
| Mỗi lần build release | `versionCode` LUÔN tăng (1 → 2 → 3 → ...). Google Play yêu cầu monotonically increasing. |

## Cách build version mới

```bash
# Tự động bump versionCode +1, giữ versionName
bash scripts/release-apk.sh

# Bump versionCode +1 và đổi versionName
bash scripts/release-apk.sh 1.1.0

# Đổi versionName, KHÔNG bump versionCode (hiếm dùng)
bash scripts/release-apk.sh 1.0.2 --no-bump
```

Script sẽ:
1. Update `apps/rn-app/android/app/build.gradle`
2. Run `./gradlew assembleRelease`
3. Copy APK vào `releases/ScamShield-v<name>-b<code>.apk`
4. Append stub entry vào `CHANGELOG.md` (bạn sửa lại để mô tả thay đổi)

## Gitignore

APK file (`.apk` / `.aab`) được gitignore vì quá lớn (~24MB) — Git không phù hợp lưu binary. Lưu trên Google Drive, GitHub Releases page, hoặc external storage.

Lịch sử chi tiết ở `../CHANGELOG.md` (commit vào git, dễ tra cứu).

## Verify APK integrity

Mỗi entry trong CHANGELOG có SHA256 fingerprint:

```bash
sha256sum releases/ScamShield-v1.0.1-b2.apk
# So sánh với CHANGELOG.md
```

Trùng = APK chưa bị sửa đổi.

## Install lên device

### Qua USB cable
```bash
adb install -r releases/ScamShield-v1.0.1-b2.apk
```

### Qua Google Drive
1. Upload APK lên Drive
2. Mở Drive trên điện thoại → tải về
3. Tap APK trong Files app → cài

## Distribution

| Phương thức | Khi nào dùng |
|---|---|
| Google Drive link | Test nội bộ |
| GitHub Release | Public download có version history |
| Play Store Internal Testing | Pre-launch, ~100 testers |
| Play Store Production | Public users |
