#!/usr/bin/env bash
# Build a versioned release APK and archive it.
#
# Usage:
#   bash scripts/release-apk.sh                    # auto: bump versionCode, keep versionName
#   bash scripts/release-apk.sh 1.1.0              # bump versionCode AND set versionName=1.1.0
#   bash scripts/release-apk.sh 1.0.2 --no-bump    # set versionName, don't bump versionCode
#
# Output:
#   - releases/ScamShield-v<versionName>-b<versionCode>.apk
#   - Updates apps/rn-app/android/app/build.gradle in-place
#   - Updates CHANGELOG.md with a stub entry you should fill in

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GRADLE_FILE="$REPO_ROOT/apps/rn-app/android/app/build.gradle"
RELEASES_DIR="$REPO_ROOT/releases"
CHANGELOG="$REPO_ROOT/CHANGELOG.md"

if [[ ! -f "$GRADLE_FILE" ]]; then
  echo "Error: $GRADLE_FILE not found" >&2
  exit 1
fi

# Parse current versions from gradle.
current_code=$(grep -E '^\s*versionCode\s+[0-9]+' "$GRADLE_FILE" | head -1 | grep -oE '[0-9]+')
current_name=$(grep -E '^\s*versionName\s+"[^"]+"' "$GRADLE_FILE" | head -1 | grep -oE '"[^"]+"' | tr -d '"')

if [[ -z "${current_code:-}" || -z "${current_name:-}" ]]; then
  echo "Error: could not parse versionCode/versionName from build.gradle" >&2
  exit 1
fi

new_name="${1:-$current_name}"
bump_code=true
for arg in "$@"; do
  [[ "$arg" == "--no-bump" ]] && bump_code=false
done

new_code=$current_code
if $bump_code; then
  new_code=$((current_code + 1))
fi

echo "Current: $current_name (code $current_code)"
echo "New:     $new_name (code $new_code)"
echo ""

# Update gradle file.
sed -i.bak -E "s/^(\s*versionCode\s+)[0-9]+/\1$new_code/" "$GRADLE_FILE"
sed -i.bak -E "s/^(\s*versionName\s+)\"[^\"]+\"/\1\"$new_name\"/" "$GRADLE_FILE"
rm -f "$GRADLE_FILE.bak"

# Build.
echo "Building release APK..."
cd "$REPO_ROOT/apps/rn-app/android"
./gradlew assembleRelease

# Archive.
mkdir -p "$RELEASES_DIR"
apk_src="$REPO_ROOT/apps/rn-app/android/app/build/outputs/apk/release/app-release.apk"
apk_dst="$RELEASES_DIR/ScamShield-v${new_name}-b${new_code}.apk"
cp "$apk_src" "$apk_dst"
sha256=$(sha256sum "$apk_dst" | cut -d' ' -f1)
size_mb=$(du -m "$apk_dst" | cut -f1)

echo ""
echo "✅ Release built"
echo "   Path:   $apk_dst"
echo "   Size:   ${size_mb} MB"
echo "   SHA256: $sha256"
echo ""

# Append stub to CHANGELOG so the dev fills it in.
today=$(date +%Y-%m-%d)
cat <<EOF >> "$CHANGELOG"

---

## [$new_name] — $today — \`versionCode $new_code\`

**APK:** \`releases/ScamShield-v${new_name}-b${new_code}.apk\`
**SHA256:** \`$sha256\`

### Added / Changed / Fixed
- TODO: describe what changed in this version.

EOF

echo "📝 CHANGELOG.md updated with stub entry — fill in 'Added / Changed / Fixed'."
echo "🚀 Don't forget: git add CHANGELOG.md apps/rn-app/android/app/build.gradle && git commit"
