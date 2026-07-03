# stonedgooseproductions.com, full-site audit

Snapshot: branch `claude/stonedgoose-full-site-pass-lczgk0` @ d1978dc, 2026-07-03.
Baseline build: passes in ~65s (next compile 19.4s). 48 static pages, 34 HTML files, /out = 14 MB.
Shared First Load JS: 102 kB. Heaviest routes: /open-mics 232 kB, /watch 173 kB, / 156 kB, /book 156 kB, /shows 154 kB.
Lint: clean. Typecheck: clean. Tests exist but do not run in CI.

Status legend (updated in Phase 7): [FIXED], [DEFERRED], [WONT-FIX], [OPEN].

## Top 10 highest-impact items

1. **P0 Ticket path dead-ends sitewide.** `upcomingShows` is empty, so the hero "Browse Shows" CTA, nav "Tickets." link, and /shows all land on an empty calendar, while a synced, ticketed calendar of 60+ pro shows sits unpublished behind `app/(site)/_calendar`. (UX-1)
2. **P1 5.5 MB of PNG photography ships unoptimized.** No WebP, no responsive sizes, optimizer script not wired into the build. (PERF-5)
3. **P1 Search palette (cmdk + Radix) ships in the shared bundle on every page.** Lazy-load it. (PERF-3)
4. **P1 Full Framer Motion runtime loads for one hero letter-stagger.** Convert to LazyMotion/m or CSS. (PERF-1)
5. **P1 Leaflet + MarkerCluster CSS is global** but the map only exists on /open-mics. (PERF-2)
6. **P1 Unused font weights load on every page.** Fraunces 300/700/900 (+italics), Inter 300/700. (PERF-6)
7. **P1 Mobile menu is tab-reachable while closed, no Escape-to-close, no focus management.** (A11Y-1, A11Y-3)
8. **P1 Duplicate unlinked Organization + LocalBusiness schema on every page** with conflicting sameAs/areaServed. (SEO-1)
9. **P1 Product schema missing on shop detail pages**; also 15 of 18 products are hidden because they lack images. (SEO-2, UX-10)
10. **P1 Forms rely on a honeypot only** (`_captcha: false`); no Turnstile. Mailing-list error state is silent for screen readers. (UX-3, A11Y-2)

## Performance

- **PERF-1 (P1)** `components/text-effect.tsx:3` imports full `framer-motion` (`motion.*`) for a single hero stagger; no LazyMotion/domAnimation, no `m.*`. Ships in the homepage bundle. Fix: LazyMotion + `m` (or CSS stagger).
- **PERF-2 (P1)** `app/globals.css:7-8` imports Leaflet + MarkerCluster CSS globally; map only renders on /open-mics. Fix: scope CSS to the map component/route.
- **PERF-3 (P1)** `components/search-palette.tsx` (cmdk + @radix-ui/react-dialog) is statically mounted in `app/(site)/layout.tsx`, in the shared bundle for every page. Fix: `next/dynamic` and mount on first open.
- **PERF-4 (P1)** `@calcom/embed-react` statically imported via `book-planner.tsx` → ships in /book bundle even when no calLink renders. Fix: dynamic import.
- **PERF-5 (P1)** Photographic PNGs: halloween.png 446 KB, xavier.png 382 KB, yoshi.png 343 KB, etc. `scripts/optimize-images.ts` is manual-only and never emits WebP. Fix: convert to WebP/JPEG, wire into build.
- **PERF-6 (P1)** `app/layout.tsx:10-30`: Fraunces loads 300/400/500/700/900 in normal+italic; only 400/500 (and 400 italic) are used. Inter loads 300-700; 300 and 700 unused. Fix: trim weights.
- **PERF-7 (P2)** `xlsx` dependency has zero importers. Remove.
- **PERF-8 (P2)** `@fullcalendar/*` only feeds the unpublished `_calendar` route and the dead `comedy-calendar.tsx`. Node_modules/build weight only; resolve with the dead-code decision.
- **PERF-9 (P2)** Raw `<img>` in `shop-product-detail.tsx:251,271` and `cart-drawer.tsx:49` lack width/height and `loading="lazy"`.
- **PERF-10 (P2)** `EditOverlay` ships owner-only tooling JS to all visitors.
- **PERF-11 (P2)** Lenis smooth-scroll runs a persistent rAF on every page. Acceptable; consider dropping.
- **PERF-12 (P2)** `nav.tsx:64` sets `priority` on a 28 px logo, competing marginally with LCP.
- Verified good: Pagefind loads lazily on first search; third-party scripts (Plausible, FB, IG, Cal) are deferred/lazy; Tailwind content globs correct; static generation covers every route.

## Accessibility

- **A11Y-1 (P1)** `nav.tsx:157-216` mobile menu hidden only with opacity/clip-path/pointer-events; links remain in tab order when closed. Fix: `inert`/conditional render.
- **A11Y-2 (P1)** `mailing-list-capture.tsx:143-147` error state has no `role="alert"`/live region.
- **A11Y-3 (P1)** Mobile menu: no Escape-to-close, focus not moved on open or restored on close.
- **A11Y-4 (P2)** 33 occurrences of `text-bone/40`, `/45` (~3.3-3.9:1) on ink and `text-ink/45`, `/55` on bone fail 4.5:1 for body-size text (nav, footer, cart, open-mic list, search palette, shows, book, roster, not-found).
- **A11Y-5 (P2)** `section-header.tsx:28` eyebrow defaults to `text-bone/55`, invisible on light sections unless overridden per-caller.
- **A11Y-6 (P2)** Search palette loading/empty/error states and result counts have no `aria-live`.
- **A11Y-7 (P2)** Open-mic explorer "Showing N mics" count not announced on filter change.
- **A11Y-8 (P2)** `open-mic-submit-dialog.tsx:167,198`, `open-mic-update-dialog.tsx:149`: `FieldLabel htmlFor` points at nonexistent ids for radio groups; should be `<legend>`.
- **A11Y-9 (P2)** Inputs suppress the global focus outline (`focus:outline-none`) relying on a 1 px border-color change (`form-field.tsx:9`, `mailing-list-capture.tsx:119`, `open-mic-explorer.tsx:145`, `search-palette.tsx:139`).
- **A11Y-10 (P2)** `placeholder:text-bone/35` (~2.9:1) unreadable.
- **A11Y-11 (P2)** Share button "Link copied" and cart quantity/busy updates not announced.
- **A11Y-12 (P2)** Map pins are click-only (acceptable: list is the keyboard alternative), but nothing tells AT users the list is the equivalent. Add a visually-hidden note.
- Verified good: skip link + RouteFocusManager, one h1 per page, Radix dialogs (trap/Escape/restore), labeled icon buttons, real `<label>`s with aria-invalid/describedby, reduced-motion respected globally and per-component.

## SEO

- **SEO-1 (P1)** Duplicate, unlinked Organization (`app/layout.tsx:90`) + LocalBusiness (`app/(site)/layout.tsx:86-89`) entities on every page, with conflicting `sameAs` (5 vs 7 links) and `areaServed` lists. Fix: single node (or `@id`-linked), one canonical service-area source.
- **SEO-2 (P1)** `shop/[slug]/page.tsx` emits only BreadcrumbList; content has name/image/description/price/variants for `Product` + `Offer`.
- **SEO-3 (P1, latent)** `lib/schema.ts:119` passes `show.start` verbatim to `startDate` while the ICS builder treats it as UTC; verify Pacific offsets when shows are entered.
- **SEO-4 (P2)** Home/root title ~66 chars, description ~174 chars; truncate in SERPs. `roster/[slug]` bio slices at 160 mid-word.
- **SEO-5 (P2)** Sitemap adds `/shows#id` fragment entries (noise) and uses uniform build-time lastmod.
- **SEO-6 (P2)** `public/_headers:11-12` targets removed `/services/*` route; dead rule. vercel.json is inert on Cloudflare (kept as mirror only).
- **SEO-7 (P2)** No home `opengraph-image.tsx` (generic /opengraph.jpg card only).
- **SEO-8 (P2)** `book/[slug]` `<title>` uses `svc.title` while OG title uses `svc.metaTitle`.
- **SEO-9 (P2)** ComedyEvent omits `performer` (no lineup field in the show model).
- **SEO-10 (P2)** Thin contextual cross-links: /shows never links to /roster or /watch; /roster never links to /shows.
- Verified good: per-page canonicals, unique metadata everywhere, robots.txt, redirects mirrored in `_redirects`, trailing-slash consistency, 404 wiring, video sitemap + VideoObject, BreadcrumbList on all detail routes, open-mic schema restraint.

## UX / Conversion

- **UX-1 (P0)** Ticket path dead-ends: `content/.generated/shows.json` is `[]`; hero CTA, nav "Tickets.", /shows all land empty while `content/.generated/pro-shows.json` holds 60+ upcoming ticketed shows rendered only by the unpublished `_calendar` route.
- **UX-2 (P2)** Next show never above the fold on the homepage even when shows exist; hero is wordmark + subhead only.
- **UX-3 (P2)** Spam protection is honeypot-only; `_captcha:"false"` on all forms. Add Turnstile or formsubmit captcha.
- **UX-4 (P2)** `/book/collaboration` live but near-empty (TODO fields filtered); `film-your-comedy-set` draft appears in the /book list with a stub page.
- **UX-5 (P2)** General quote form collects no name field.
- **UX-6 (P2)** No per-mic "last verified" date in the Open Mic Explorer; data-quality punch list (17/92 records) in OPEN_MICS_DATA_QUALITY.md.
- **UX-7 (P2)** Hamburger button under 44 px tap target (`nav.tsx:119-147`).
- **UX-8 (P2)** Map has no error UI if the Leaflet dynamic import fails.
- **UX-9 (P2)** Cart runtime fetch failure UX unverified; `request()` throws on !ok.
- **UX-10 (P2)** Shop silently filters to 3 of 18 products (missing image URLs); 83% of merch invisible.
- **UX-11 (P2)** Contact form success/error copy is generic and off-brand ("Message sent! ...").
- **UX-12 (P2)** Pro-show titles contain raw HTML entities (`&#8211;`, `&#038;`) that would render literally if surfaced.
- Verified good: /shows rows (when populated) have hazard "Get tickets" CTAs, price, add-to-calendar, share; /book funnel is strong (anchored subnav, estimator prefills call notes, Cal embed); forms have RHF+zod inline validation, loading/success/error states, 48 px inputs; explorer filters/empty states solid.

## Content / Copy

- **CONTENT-1 (clean)** Em dash sweep: zero em dashes in user-facing source (content/, app/, components/, lib/, public/). Internal docs only.
- **CONTENT-2 (P2)** "South Sound's fastest-growing comedy platform" (`app/(site)/book/page.tsx:138-142`) is an unverifiable superlative; against the no-invented-stats rule.
- **CONTENT-3 (P3)** lucky-dime open mic note reads "anything is allowed. Free. Set tbd/". Clean up.
- **CONTENT-4 (P3)** rickshaw-seattle-friday note uses an en dash range "3–4 Minutes".
- **CONTENT-5** No lorem/coming-soon text; no invented stats rendered (sponsorship stat values are null and unrendered; press array empty); no past dates shown as upcoming.
- **CONTENT-6** External links enumerated (socials, Eventbrite, Fourthwall x18, Cal.com, pro clubs, ~90 open-mic signup URLs, OSM tiles, formsubmit); crawl scheduled for Phase 5.

## Code Quality

- **CODE-1 (clean)** Zero `: any`, `as any`, `@ts-ignore`, `@ts-expect-error`. All `eslint-disable`s scoped and justified. No console noise in components. Consistent kebab-case + named exports + "use client" placement.
- **CODE-2 (P1)** Dead components: `comedy-calendar.tsx` (self-labeled unmounted), `news-feed.tsx`, `feed-freshness.tsx` have no importers.
- **CODE-3 (P1)** `xlsx` dependency unused; removable.
- **CODE-4 (P1)** `npm run test` (open-mics-normalize, schema smoke tests) never runs in CI (`.github/workflows/ci.yml` runs lint/typecheck/build only).
- **CODE-5 (P2)** `_calendar` + `pro-shows-calendar.tsx` + sync pipeline are staged but unreachable (deliberate dark launch). Decision needed: publish or keep dark.
- **CODE-6 (P2)** `RESERVED_SLUG_ERROR` and calendar "verification" exports unused; reserved-slug list has no test asserting sync with actual route folders.
- **CODE-7 (P2)** prebuild `|| true` swallows all sync-script failures, not just missing-env; acceptable but note.
- Verified good: env-var hygiene (no server secrets in client), sync scripts degrade gracefully to committed JSON, healthy CI automation (lighthouse, lychee, indexnow, image-optimize, feed-refresh workflows).
