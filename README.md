# Astro Pixel Snapshot

This project is an Astro site built from `layout.builder (1).json`, with localized CSS/font assets for deployable ownership.
It now includes TinaCMS visual editing for business copy fields.

## Commands

- `npm run dev` - start local dev server
- `npm run build` - build static output in `dist/`
- `npm run preview` - preview built output
- `npm run sync:assets` - re-download live Geviti CSS/font assets into `public/assets`

## Files

- `src/pages/index.astro` - main page (loads and renders `index.from-json.html` body)
- `tina/config.ts` - TinaCMS schema and build settings
- `tina/pages/SiteContentBridge.jsx` - visual editing bridge (`client:tina`) for inline updates
- `content/site/home.json` - editable business content source
- `public/admin/` - generated Tina admin app
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

## Tina Editing

1. Start dev:
   - `npm run dev`
2. Open admin:
   - `http://localhost:4322/admin/index.html`
3. Use visual editing:
   - open the visual editor from Tina, then click highlighted copy on the page.

Notes:
- Local mode is enabled with `TINA_PUBLIC_IS_LOCAL=true` in scripts.
- Build uses `tinacms build --local --skip-cloud-checks -c "astro build"` so static generation works without TinaCloud credentials.
