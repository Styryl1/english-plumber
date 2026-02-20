# Next.js Mirror Snapshot

This project serves a pixel-clone snapshot of `englishplumber.nl` through Next.js, while keeping mirrored assets local and editable.

The homepage HTML source is `src/mirror/live-index.html`. At runtime, Next reads that file, injects local overrides, and serves it directly (no React hydration for the mirrored page), which keeps scripts/animations stable.

## Commands

- `npm run dev` - start Next dev server on port `4322`
- `npm run build` - production build
- `npm run start` - run production server on port `4322`
- `npm run tina:dev` - start Tina local CMS + Next app on port `4323` (`/tina-admin/index.html`)
- `npm run tina:build` - build Tina admin and generated client files in local mode (output: `public/tina-admin`)
- `npm run sync:assets` - re-download live mirrored CSS/font assets into `public/assets`
- `npm run sync:media` - download mirror image/video assets used by the page into `public/mirror_media`
- `npm run clone:live` - re-clone live homepage and static bundles into local mirror paths

## Files

- `pages/index.js` - Next route that serves rendered mirror HTML
- `src/mirror/render-mirror-html.js` - HTML renderer/parser/injector
- `src/mirror/live-index.html` - editable mirrored homepage source
- `src/mirror/injections/*` - guard/runtime/style injections (promo removal, copy rewrite, hero swap, lock fixes)
- `content/site/mirror-content.json` - single editable content source for site text/brand/copy replacements
- `content/tina/site.json` - Tina-managed local overrides (safe editable layer merged at render time)
- `tina/config.ts` - Tina schema/config for local CMS
- `public/mirror_next/static/*` - mirrored upstream Next bundles (kept separate from real Next `/_next`)
- `public/mirror_media/*` - locally owned mirrored media assets (images/video) referenced by runtime rewrites
- `public/assets/styles/*` - localized CSS files
- `public/assets/fonts/*` - localized fonts referenced by CSS
- `scripts/sync_assets.py` - asset localization script
- `scripts/sync_media_assets.py` - media downloader + manifest generator (`src/generated/media-manifest.json`)
- `scripts/clone_live_site.sh` - live clone + local asset sync script

## Refresh flow

1. Re-clone current live HTML and static bundles:
   - `npm run clone:live`
2. Refresh owned CSS/font assets (optional but recommended):
   - `npm run sync:assets`
3. Refresh owned media files used by the mirrored page:
   - `npm run sync:media`
4. Build:
   - `npm run build`

Images/video links are intentionally left remote where dynamic processing is required, so the site remains visually accurate and easy to swap later.

## Editing copy

### Fast path (recommended): Tina local admin

1. Run:
   - `npm run tina:dev`
2. Open:
   - `http://localhost:4323/tina-admin/index.html`
3. Edit `Site Overrides` document (`content/tina/site.json`) and save.

### Base fallback source

Edit `content/site/mirror-content.json`:

- `site.businessName`, `site.baseCity`, `site.whatsappNumber`, etc. for brand/contact values.
- `site.exactTextReplacements` for direct text swaps (`[from, to]` pairs).
- `site.regexTextReplacements` for pattern-based replacements.

Render-time merge order:

1. `content/site/mirror-content.json` (base)
2. `content/tina/site.json` (overrides from Tina)

This keeps the mirrored visual layer stable while allowing CMS-driven content and SEO updates.
