# Astro Pixel Snapshot

This project is an Astro site built from `layout.builder (1).json`, with localized CSS/font assets for deployable ownership.

## Commands

- `npm run dev` - start local dev server
- `npm run build` - build static output in `dist/`
- `npm run preview` - preview built output
- `npm run sync:assets` - re-download live Geviti CSS/font assets into `public/assets`

## Files

- `src/pages/index.astro` - main page (loads and renders `index.from-json.html` body)
- `src/generated/asset-manifest.json` - local stylesheet list used by `index.astro`
- `public/assets/styles/*` - localized CSS files
- `public/assets/fonts/*` - localized fonts referenced by CSS
- `scripts/sync_assets.py` - asset localization script
- `build_site.py` - JSON-to-HTML snapshot generator (`index.from-json.html`)

## Regenerate flow

1. Regenerate snapshot HTML from JSON:
   - `python build_site.py`
2. Refresh owned CSS/font assets:
   - `npm run sync:assets`
3. Build:
   - `npm run build`

Images/video links are currently external by design so they can be swapped later.
