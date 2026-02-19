# AGENTS.md

## Mission
Preserve the mirrored site's styling and animations exactly, while moving content, SEO, and key images to TinaCMS-managed files.

## Source of Truth
- Plan: `MIRROR_TINA_PLAN.md`
- Mirror renderer: `src/mirror/render-mirror-html.js`
- Runtime injections: `src/mirror/injections/*`
- Content folder: `content/`

## Project Decisions
- canonical domain: `https://englishplumber.nl/`
- Tina mode: local Git-backed
- media strategy: locally owned assets now, keep migration path open for external hosting later

## Hard Rules (Do Not Break)
1. Keep visual behavior identical unless explicitly approved.
2. Never edit these files for content changes:
   - `src/mirror/live-index.html`
   - `public/mirror_next/static/*`
   - `public/assets/styles/*`
3. Do not change animation classes, animation timing, or motion-related DOM structure.
4. Content and SEO changes must be data-driven and deterministic (selector mapping + structured content).
5. Every PR must pass `npm run build` before completion.

## Required Execution Order
Follow phases in `MIRROR_TINA_PLAN.md` in sequence:
1. Phase 0 guardrails
2. Phase 1 server-side deterministic patcher
3. Phase 2 structured content + validation
4. Phase 3 Tina integration
5. Phase 4 SEO ownership
6. Phase 5 image ownership
7. Phase 6 regression safety net
8. Phase 7 feature-flag rollout

Do not skip ahead unless the user explicitly approves.

## Change Protocol (Each Task)
1. State which phase and exit criteria are being worked.
2. Make minimal scoped edits.
3. Run:
   - `npm run build`
4. Perform visual smoke check:
   - hero section
   - header/nav
   - testimonial/slider blocks
   - FAQ interactions
   - footer
5. Report:
   - files changed
   - build result
   - any visual or runtime risk
6. Update progress checklist below.

## Allowed vs Disallowed Approaches
- Allowed:
  - selector-based server-side content patching
  - temporary server-side exact/regex replacement fallback while selector map coverage is being built
  - keep global server copy rewriting off by default unless explicitly validating hydration safety
  - structured content schemas and validation
  - Tina collections mapped to local content files
  - feature-flagged rollout
- Disallowed:
  - broad runtime DOM text walker rewrites for core content in normal operation
  - ad-hoc manual edits to mirrored compiled bundles
  - changes that alter animation behavior without explicit approval

## Decision Escalation
Ask the user before proceeding when any of these are unclear:
- Production domain/canonical domain
- Tina auth mode (local-only vs Tina Cloud)
- Media storage policy (local repo vs external storage)
- Final sitemap/robots strategy

## Done Definition
The migration is complete only when:
- Text/SEO/images are editable in Tina-backed content files.
- Styling/animations match baseline behavior.
- Build succeeds.
- Feature flag rollback exists and is documented.

## Progress Checklist
- [x] Phase 0 complete
- [ ] Phase 1 complete
- [ ] Phase 2 complete
- [ ] Phase 3 complete
- [ ] Phase 4 complete
- [ ] Phase 5 complete
- [ ] Phase 6 complete
- [ ] Phase 7 complete
