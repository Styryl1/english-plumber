# Mirror -> TinaCMS Migration Plan

## Goal
Migrate this mirrored site to TinaCMS-managed content and SEO while preserving styling and animations exactly as-is.

## Success Criteria
- Visual styling and animations are unchanged from the current baseline.
- All editable text, SEO metadata, and owned images are controlled by local content files and TinaCMS.
- `npm run build` passes at every phase.
- Rollout is reversible with one feature flag.

## Current Baseline (Checkpoint)
- Build status: passing (`npm run build`).
- Mirror renderer: `src/mirror/render-mirror-html.js`.
- Runtime mutation script: `src/mirror/injections/runtime.js`.
- Current content source: `content/site/mirror-content.json`.
- Project decisions (confirmed):
  - canonical domain: `https://englishplumber.nl/`
  - Tina mode: local Git-backed
  - media strategy: keep locally owned now, preserve portability for future hosting

## Phase Plan

### Phase 0: Freeze and Guardrails
- Add immutable file policy for mirrored visual engine.
- Define "no-touch" set:
  - `src/mirror/live-index.html`
  - `public/mirror_next/static/*`
  - `public/assets/styles/*`
- Exit criteria:
  - Policy documented in `AGENTS.md`.

### Phase 1: Deterministic Content Patcher (Server-Side)
- Add selector-based content map (`src/mirror/content-map.json`).
- Apply text/attribute replacements in `renderMirrorHtml()` before HTML response.
- Stop relying on broad runtime text rewrites for content.
- Transitional rule:
  - temporary server-side exact/regex fallback is allowed until selector coverage reaches the full homepage.
  - keep server-wide copy rewriting disabled by default (`enableServerCopyRewrite: false`) to avoid mirrored hydration regressions.
- Exit criteria:
  - Page text changes only through explicit selectors.
  - No DOM-wide text walker required for content rewrites.

### Phase 2: Structured Content Model + Validation
- Split current monolithic content into:
  - `content/site/settings.json`
  - `content/site/seo.json`
  - `content/pages/home.json`
- Add schema validation (Zod) in render pipeline.
- Fail fast on invalid/missing fields.
- Exit criteria:
  - Renderer only reads structured validated content.

### Phase 3: TinaCMS Integration
- Add Tina config and collections for the files above.
- Keep local Git-backed editing first.
- Ensure admin route is working and writes to content files.
- Exit criteria:
  - Content updates in Tina are reflected on site without code edits.

### Phase 4: SEO Ownership
- Set title/meta/OG/Twitter/canonical/JSON-LD server-side from `seo.json`.
- Remove inherited external SEO leftovers.
- Replace `public/robots.txt` host/sitemaps with owned domain URLs.
- Exit criteria:
  - SEO tags are fully owned by local content.

### Phase 5: Image Ownership Without Layout Drift
- Keep existing media manifest fallback.
- Add Tina-editable image fields for key visuals.
- Only patch media attributes (`src`, `srcset`, `imagesrcset`, `alt`, preload links).
- Exit criteria:
  - Key images are owned and editable.
  - No class/layout/animation regressions.

### Phase 6: Regression Safety Net
- Add selector contract checks (expected nodes found).
- Add HTML head snapshot checks for SEO.
- Add Playwright visual checks for hero/header/cards/FAQ/testimonials.
- Exit criteria:
  - Regression checks catch structure/visual drift before merge.

### Phase 7: Feature Flag Rollout
- Add `USE_TINA_CONTENT=0|1`.
- Ship with `0` default and validate.
- Flip to `1` once checks are green.
- Keep rollback path to `0`.
- Exit criteria:
  - Tina content path active in production with rollback available.

## Non-Negotiables
- Do not rewrite mirrored animation logic.
- Do not change class names or animation-related DOM structure.
- No large unreviewed regex-based global text replacement.
- No phase completion without build pass.

## Execution Workflow Per PR
1. Implement one scoped phase slice.
2. Run `npm run build`.
3. Perform visual smoke check (hero, nav, testimonial carousel, FAQ, footer).
4. Update progress in `AGENTS.md`.
5. Merge only when exit criteria are met.

## Progress Tracker
- [x] Phase 0 complete
- [ ] Phase 1 complete
- [ ] Phase 2 complete
- [ ] Phase 3 complete
- [ ] Phase 4 complete
- [ ] Phase 5 complete
- [ ] Phase 6 complete
- [ ] Phase 7 complete
