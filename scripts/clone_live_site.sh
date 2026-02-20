#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$ROOT_DIR/.cache/live-clone"
SOURCE_HTML="$ROOT_DIR/src/mirror/live-index.html"
PUBLIC_DIR="$ROOT_DIR/public"
ORIGIN="https://englishplumber.nl"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"

echo "[clone:live] preparing temp workspace..."
rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"

echo "[clone:live] downloading live homepage and page requisites..."
wget \
  --page-requisites \
  --no-host-directories \
  --reject-regex="/_next/image\\?" \
  --user-agent="$UA" \
  --directory-prefix "$TMP_DIR" \
  "$ORIGIN/" || {
    status=$?
    if [[ ! -f "$TMP_DIR/index.html" ]]; then
      echo "[clone:live] wget failed before index.html was captured (exit $status)."
      exit "$status"
    fi
    echo "[clone:live] wget exited with code $status (usually due optional 404s); continuing."
  }

mkdir -p "$(dirname "$SOURCE_HTML")"
cp "$TMP_DIR/index.html" "$SOURCE_HTML"

echo "[clone:live] rewriting dynamic image/API endpoints to live origin..."
perl -0pi -e 's@(?<!https://englishplumber\.nl)/_next/image\?@https://englishplumber.nl/_next/image?@g; s@(?<!https://englishplumber\.nl)/api/globals/@https://englishplumber.nl/api/globals/@g; s@(?<!https://englishplumber\.nl)/api/search/@https://englishplumber.nl/api/search/@g;' "$SOURCE_HTML"

echo "[clone:live] syncing static files into public/..."
rm -rf "$PUBLIC_DIR/mirror_next"
cd "$TMP_DIR"
while IFS= read -r -d '' file; do
  relative_path="${file#./}"
  if [[ "$relative_path" == "index.html" ]]; then
    continue
  fi

  # Skip mirrored Next image endpoint files. They are dynamic and should stay
  # pointed at live origin in src/mirror/live-index.html.
  if [[ "$relative_path" == _next/image\?* ]]; then
    continue
  fi

  # Convert wget filenames with query fragments (e.g. app.js?dpl=...) into
  # deploy-safe static paths (app.js). Browser cache-busters remain in HTML.
  safe_relative_path="${relative_path%%\?*}"
  if [[ -z "$safe_relative_path" ]]; then
    continue
  fi

  # Keep mirrored upstream Next bundles separate from this app's own /_next.
  if [[ "$safe_relative_path" == _next/static/* ]]; then
    safe_relative_path="mirror_next/static/${safe_relative_path#_next/static/}"
  fi

  destination="$PUBLIC_DIR/$safe_relative_path"
  mkdir -p "$(dirname "$destination")"
  cp "$file" "$destination"
done < <(find . -type f -print0)

echo "[clone:live] syncing local media mirror..."
cd "$ROOT_DIR"
python3 "$ROOT_DIR/scripts/sync_media_assets.py"

echo "[clone:live] done."
echo "[clone:live] editable source: $SOURCE_HTML"
