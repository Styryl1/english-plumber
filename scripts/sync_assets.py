#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Dict, List
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

LIVE_SITE_URL = "https://englishplumber.nl/"
OUT_STYLES = Path("public/assets/styles")
OUT_FONTS = Path("public/assets/fonts")
MANIFEST = Path("src/generated/asset-manifest.json")

STYLESHEET_PATTERN = re.compile(
    r'<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"',
    re.IGNORECASE,
)
CSS_URL_PATTERN = re.compile(r"url\(([^)]+)\)")
HIDDEN_HTML_PATTERN = re.compile(r"html\{opacity:0\}")


def fetch_text(url: str) -> str:
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=30) as response:
        return response.read().decode("utf-8", errors="replace")


def fetch_bytes(url: str) -> bytes:
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=30) as response:
        return response.read()


def normalize_quoted_url(raw: str) -> str:
    value = raw.strip().strip("\"'")
    return value


def relink_css_assets(css_text: str) -> tuple[str, int]:
    downloaded_count = 0

    def replace_url(match: re.Match[str]) -> str:
        nonlocal downloaded_count
        raw = match.group(1)
        original = normalize_quoted_url(raw)

        if not original:
            return match.group(0)

        lower = original.lower()
        if lower.startswith("data:") or lower.startswith("http://") or lower.startswith("https://"):
            return match.group(0)
        if original.startswith("#"):
            return match.group(0)

        abs_url = urljoin(LIVE_SITE_URL, original)
        parsed = urlparse(abs_url)
        filename = Path(parsed.path).name
        if not filename:
            return match.group(0)

        # Keep only local media files as owned assets (fonts/videojs glyphs).
        if "/_next/static/media/" not in parsed.path:
            return match.group(0)

        OUT_FONTS.mkdir(parents=True, exist_ok=True)
        target = OUT_FONTS / filename
        if not target.exists():
            target.write_bytes(fetch_bytes(abs_url))
            downloaded_count += 1

        rel = f"../fonts/{filename}"
        return f"url({rel})"

    rewritten = CSS_URL_PATTERN.sub(replace_url, css_text)
    return rewritten, downloaded_count


def normalize_css_for_static(css_text: str) -> str:
    # Ensure mirrored HTML is visible immediately, even outside the original app runtime.
    css_text = HIDDEN_HTML_PATTERN.sub("html{opacity:1}", css_text)
    return css_text


def unique_keep_order(values: List[str]) -> List[str]:
    seen = set()
    out: List[str] = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        out.append(value)
    return out


def main() -> None:
    OUT_STYLES.mkdir(parents=True, exist_ok=True)
    OUT_FONTS.mkdir(parents=True, exist_ok=True)
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)

    homepage = fetch_text(LIVE_SITE_URL)
    hrefs = STYLESHEET_PATTERN.findall(homepage)
    stylesheet_urls = unique_keep_order([urljoin(LIVE_SITE_URL, href) for href in hrefs])

    local_stylesheets: List[str] = []
    total_font_downloads = 0

    for stylesheet_url in stylesheet_urls:
        parsed = urlparse(stylesheet_url)
        filename = Path(parsed.path).name
        if not filename:
            continue

        css_text = fetch_text(stylesheet_url)
        css_rewritten, downloads = relink_css_assets(css_text)
        css_rewritten = normalize_css_for_static(css_rewritten)
        total_font_downloads += downloads

        out_path = OUT_STYLES / filename
        out_path.write_text(css_rewritten, encoding="utf-8")
        local_stylesheets.append(f"assets/styles/{filename}")

    manifest: Dict[str, List[str]] = {
        "stylesheets": local_stylesheets,
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print(f"Synced {len(local_stylesheets)} stylesheets")
    print(f"Downloaded {total_font_downloads} font/media files")
    print(f"Manifest: {MANIFEST}")


if __name__ == "__main__":
    main()
