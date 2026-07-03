# IMPROVEMENTS.md

Full-site improvement pass, 2026-07-03, on branch `claude/stonedgoose-full-site-pass-lczgk0`.
Companion documents: AUDIT.md (every finding with final status) and DECISIONS.md (rationale for every judgment call and deferral).

## Headline numbers

| Metric | Before | After |
|---|---|---|
| Static export size (/out) | 14 MB | 9.8 MB |
| Optimized image set | 4.10 MB (PNG) | 1.18 MB (WebP) |
| First Load JS, home | 156 kB | 146 kB |
| First Load JS, /watch | 173 kB | 163 kB |
| First Load JS, /open-mics | 232 kB | 222 kB |
| First Load JS, /roster | 152 kB | 142 kB |
| First Load JS, /shows | 154 kB | 144 kB |
| Font files requested | Fraunces 10, Inter 5 | Fraunces 2, Inter 3 |
| Global stylesheet | includes 12 kB Leaflet vendor CSS | Leaflet CSS scoped to the /open-mics chunk |
| Open-mic data quality | 1 error, 17 flagged records | 0 errors, 15 flagged records |
| Tests in CI | none ran | 3 suites on every push/PR |
| Shop products visible | 3 of 18 | 18 of 18 |

Build passes clean: zero errors, zero new warnings, lint and typecheck green, all 48 pages statically generated. Internal link crawl of the export: 49 unique internal hrefs, zero broken, all CTA anchors resolve.

Lighthouse LCP/CLS could not be measured in this sandbox (no headed browser metrics run); the repo's existing Lighthouse CI workflow will produce numbers on the next push. The LCP-relevant changes (font weight cuts, WebP conversion, smaller route JS) all point the right direction, and CLS risk was addressed directly (explicit dimensions on raw imgs, reserved space for the Cal embed).

## Phase 1: Performance

- Framer Motion now loads through LazyMotion + `m` components with the domAnimation feature set, instead of the full runtime, for the single hero animation.
- The search palette (cmdk + Radix Dialog + Pagefind glue) left the shared layout bundle; a small keyboard-shortcut shell lazy-loads it on first open.
- The Cal.com embed on /book is dynamically imported with a height-reserving placeholder.
- Leaflet + MarkerCluster vendor CSS moved out of globals.css into the dynamically imported map component.
- 20 photographic PNG/JPEGs converted to WebP q82 with every reference updated (content JSON, generated indexes, blur placeholders); two unreferenced legacy media images deleted.
- Fonts trimmed to used weights: Fraunces 400 normal+italic, Inter 400/500/600.
- Removed the unused `xlsx` dependency; raw `<img>`s got width/height and lazy loading; the hidden-until-hover nav logo lost its `priority` hint.

## Phase 2: Accessibility (WCAG 2.2 AA)

- Mobile menu: `inert` while closed, Escape closes and restores focus, focus moves in on open, 44 px hamburger.
- Contrast sweep: all body-size text at or above ~5.4:1 (bone/55 on ink, ink/60+ on bone); placeholders raised to /50.
- SectionHeader gained a `tone="light"` prop, eliminating the invisible cream-on-cream eyebrow trap.
- Live regions: mailing-list errors (`role="alert"`), search progress and result counts, open-mic filter counts, share-button copied state, cart busy state.
- Radio groups use `<legend>`; inputs keep a visible hazard focus outline; sr-only note pairs the map with its accessible list equivalent; heading hierarchy fixed on /open-mics.

## Phase 3: SEO

- One merged Organization/LocalBusiness entity (stable `#organization` @id) sourced from the CMS site config, replacing two conflicting unlinked nodes; NAP and service areas now have a single source of truth.
- Product + Offer schema on all shop detail pages.
- Default title down to 52 chars; meta descriptions trimmed at word boundaries to 155 across root, home, roster bios, and products; book services use their crafted metaTitle consistently.
- `_headers` OG content-type rule fixed to match the hashed filenames Next actually exports (the old rule matched nothing); dead /services rule removed; vercel.json mirror updated.
- Sitemap fragment entries removed.

## Phase 4: UX and conversion

- Hero renders a "Next on stage" ticket strip above the fold whenever a show exists in the CMS.
- /shows empty state: Eventbrite promoted to primary CTA, mailing-list anchor added, cross-links to /watch, /roster, /open-mics.
- Shop shows all 18 products; imageless SKUs render typographic placeholder cards, photographed products lead each category.
- Draft services hidden from the /book list, sitemap, and next-service nav; general quote form gained a name field.
- Cart failures show a visible alert; the map renders a text fallback if Leaflet fails to load.
- Contextual cross-links added between /roster, /watch, and /shows.

## Phase 5: Content and copy

- Contact form feedback rewritten in the site register; unverifiable "fastest-growing" sponsor claim reworded.
- Open-mic source data: missing city fixed from its own address, two venue spellings corrected at source, placeholder-ish note cleaned, en dash range normalized.
- Watch video entries cleaned (leading spaces, tracking params); shop category assignments deduplicated.
- Em dash sweep re-verified: zero in user-facing source.
- External link crawl was blocked by the sandbox egress policy (274/280 hosts unreachable, including google.com); the repo's lychee CI workflow covers this with real egress.

## Phase 6: Code quality

- Deleted three zero-importer components (comedy-calendar, orphaned news-feed renderer, feed-freshness) and the unused `RESERVED_SLUG_ERROR` export.
- New reserved-slugs smoke test guards the route/slug collision list against drift.
- `npm run test` now runs all three suites and CI runs it on every push and PR (it previously never ran).

## Recommended future work (out of scope for this pass)

1. **Publish the pro-shows calendar or feed it into /shows.** A synced, ticketed calendar of 60+ regional shows sits dark behind `app/(site)/_calendar`. Decode the HTML entities in `scripts/sync-pro-shows.ts` titles before shipping it.
2. **Enter real shows in the CMS** (or wire `EVENTBRITE_PRIVATE_TOKEN` so the sync fills them). The hero ticket strip, shows list, Event schema, and ICS feeds all light up automatically.
3. **Real spam protection.** Move form submission to a Cloudflare Worker that verifies Turnstile, or use formsubmit's hashed endpoint; the honeypot is the only gate today.
4. **Show model upgrades:** a lineup field (feeds ComedyEvent `performer`), a cancelled/postponed status flag, and verified Pacific-offset timestamps for `startDate`.
5. **Open Mic Explorer freshness system:** per-mic "last verified" dates, plus the remaining 15 warnings in OPEN_MICS_DATA_QUALITY.md (hosts holding emails/URLs, non-URL signups).
6. **Fourthwall images for the 15 placeholder products**, and finished copy for /book/collaboration.
7. **Sitemap lastmod from content mtimes** instead of build time, so the field carries signal.
8. **Confirm the apex to www 301** at the DNS/Cloudflare layer (everything in-repo assumes www).
