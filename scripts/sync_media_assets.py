#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import html
import json
import re
from pathlib import Path
from typing import Dict, Iterable, Optional, Set, Tuple
from urllib.parse import parse_qs, quote, unquote, urlparse
from urllib.request import Request, urlopen

LIVE_ORIGIN = "https://englishplumber.nl"
SOURCE_HTML = Path("src/mirror/live-index.html")
OUT_MEDIA = Path("public/mirror_media")
MANIFEST = Path("src/generated/media-manifest.json")

ALLOWED_PREFIXES = (
    "/api/media/file/",
    "/banner/",
    "/reviews/",
    "/footer/",
    "/faq.webp",
)

NEXT_IMAGE_PATTERN = re.compile(r"(?:https?://[^/]+)?/_next/image\?[^\"'<>\\s]+")
DIRECT_PATH_PATTERN = re.compile(r"/(?:api/media/file|banner|reviews|footer)/[^\"'<>\\s]+|/faq\.webp(?:\?[^\"'<>\\s]+)?")

CONTENT_TYPE_EXT = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "application/json": ".json",
    "application/ld+json": ".json",
}


def fetch_bytes(url: str) -> Tuple[bytes, str]:
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=60) as response:
        content_type = response.headers.get("Content-Type", "").split(";")[0].strip().lower()
        return response.read(), content_type


def js_unescape(value: str) -> str:
    return (
        value.replace("\\/", "/")
        .replace("\\u0026", "&")
        .replace("\\u003d", "=")
        .replace("\\u002f", "/")
        .replace("\\u002F", "/")
    )


def sanitize_filename(value: str) -> str:
    safe = re.sub(r"[^A-Za-z0-9._-]+", "-", value).strip("._-")
    return safe or "asset"


def canonicalize_path(raw_value: str) -> Optional[str]:
    candidate = html.unescape(js_unescape(raw_value.strip())).rstrip("\\")
    if not candidate:
        return None

    if "/_next/image?" in candidate:
        parsed = urlparse(candidate if candidate.startswith("http") else f"{LIVE_ORIGIN}{candidate}")
        source_values = parse_qs(parsed.query).get("url")
        if not source_values:
            return None
        candidate = unquote(source_values[0])

    if candidate.startswith("http://") or candidate.startswith("https://"):
        parsed = urlparse(candidate)
        candidate = parsed.path

    if not candidate.startswith("/"):
        return None

    parsed = urlparse(candidate)
    path_only = parsed.path
    if not any(path_only.startswith(prefix) for prefix in ALLOWED_PREFIXES):
        return None

    return quote(unquote(path_only), safe="/:@!$&()*+,;=.-_~[]")


def iter_raw_candidates(source: str) -> Iterable[str]:
    for match in DIRECT_PATH_PATTERN.finditer(source):
        yield match.group(0)
    for match in NEXT_IMAGE_PATTERN.finditer(source):
        yield match.group(0)


def choose_extension(path_only: str, content_type: str) -> str:
    known_ext = {".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".mp4", ".json"}
    suffix = Path(path_only).suffix.lower()
    if suffix in known_ext:
        return suffix
    if content_type in CONTENT_TYPE_EXT:
        return CONTENT_TYPE_EXT[content_type]
    if suffix:
        return suffix
    return ".bin"


def build_fetch_url(path_only: str) -> str:
    # Keep path separators while encoding only non-safe characters.
    encoded_path = quote(unquote(path_only), safe="/:@!$&()*+,;=.-_~[]")
    return f"{LIVE_ORIGIN}{encoded_path}"


def media_key_variants(path_only: str) -> Set[str]:
    decoded = unquote(path_only)
    reencoded = quote(decoded, safe="/:@!$&()*+,;=.-_~[]")
    return {path_only, decoded, reencoded}


def main() -> None:
    if not SOURCE_HTML.exists():
        raise SystemExit(f"Missing source mirror HTML: {SOURCE_HTML}")

    OUT_MEDIA.mkdir(parents=True, exist_ok=True)
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)

    source = SOURCE_HTML.read_text(encoding="utf-8", errors="ignore")
    canonical_paths: Set[str] = set()

    for raw in iter_raw_candidates(source):
        canonical = canonicalize_path(raw)
        if canonical:
            canonical_paths.add(canonical)

    manifest_map: Dict[str, str] = {}
    downloaded = 0
    skipped = 0

    for path_only in sorted(canonical_paths):
        fetch_url = build_fetch_url(path_only)
        try:
            data, content_type = fetch_bytes(fetch_url)
        except Exception:
            skipped += 1
            continue

        ext = choose_extension(path_only, content_type)
        base_name_raw = unquote(Path(path_only).name) or "asset"
        base_stem = Path(base_name_raw).stem if Path(base_name_raw).suffix else base_name_raw
        safe_stem = sanitize_filename(base_stem)
        digest = hashlib.sha1(path_only.encode("utf-8")).hexdigest()[:10]
        filename = f"{safe_stem}-{digest}{ext}"

        out_path = OUT_MEDIA / filename
        out_path.write_bytes(data)
        downloaded += 1

        local_url = f"/mirror_media/{filename}"
        for key in media_key_variants(path_only):
            manifest_map[key] = local_url

    payload = {
        "origin": LIVE_ORIGIN,
        "count": len(manifest_map),
        "media": manifest_map,
    }
    MANIFEST.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    print(f"Parsed media paths: {len(canonical_paths)}")
    print(f"Downloaded assets: {downloaded}")
    print(f"Skipped assets: {skipped}")
    print(f"Manifest: {MANIFEST}")


if __name__ == "__main__":
    main()
