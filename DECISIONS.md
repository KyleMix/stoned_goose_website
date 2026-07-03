# DECISIONS.md

Autonomous judgment calls made during the 2026-07-03 full-site pass, with one-line rationales. Items the pass deliberately did not touch are under "Deferred - needs human review".

## Decisions

- Phase 1: Converted 20 photographic PNG/JPEG portraits and posters (>=60 KB, >=25% savings) to WebP q82 and updated every reference (content JSON, shows-copy, generated indexes). Originals deleted from the working tree but preserved in git history. Public images: 4.10 MB -> 1.18 MB.
- Phase 1: Deleted `public/images/media/halloween.png` and `matt-loes.png` (and their WebP conversions): zero references anywhere in the repo; legacy from the pre-redesign /watch page.
- Phase 1: Removed the `xlsx` dependency: zero imports across app/, components/, lib/, scripts/.
- Phase 1: Trimmed font loading to used weights only (Fraunces 400 normal+italic, Inter 400/500/600, JetBrains Mono unchanged). No `font-light/bold/black` utilities exist in the codebase and headings render at 400 via Tailwind preflight's `font-weight: inherit`.
- Phase 1: Kept Lenis smooth scroll and the `@fullcalendar/*` deps: Lenis is a deliberate design choice that already respects reduced motion, and FullCalendar feeds the intentionally dark `_calendar` route (see Deferred).
- Phase 1: Left `EditOverlay` eagerly bundled: it is ~2 kB of plain React with no heavy deps, so a lazy split would cost more in indirection than it saves.

- Replaced the stale AUDIT.md (written against the old /members + /services IA at main@fb950f6) with a fresh audit of the current site; the old version remains in git history.
- The task brief said "Keystatic CMS"; the repo actually uses Sveltia CMS (Decap-compatible) at /admin reading content/*/index.json. All CMS-compatibility rules were applied to the Sveltia config and content JSON instead.

- Phase 3: Merged the duplicate Organization + LocalBusiness schema nodes into one LocalBusiness entity (LocalBusiness subclasses Organization) sourced from the CMS site config, so schema and on-page NAP can never drift. The site layout no longer emits its own LocalBusiness.
- Phase 3: Shortened the default title to "Stoned Goose Productions · Olympia Comedy Production" (52 chars) and trimmed meta descriptions to 155 chars at word boundaries via a shared helper; the full CMS description still feeds schema.org and page copy.
- Phase 3: Fixed the `_headers` OG rule: exported OG images carry a build-hash suffix (opengraph-image-<hash>), which the old `/*/opengraph-image` pattern never matched. Updated vercel.json mirror to match. Removed the rule for the retired /services route.
- Phase 3: Removed `/shows#id` fragment entries from the sitemap: crawlers collapse fragments, so they were noise.
- Phase 3: Added Product + Offer schema to shop detail pages (price only when it parses cleanly, availability only when variant data exists).
- Phase 3: Skipped a generated opengraph-image for the homepage: it intentionally uses the brand photo at /opengraph.jpg, which outperforms a text-only generated card.

- Phase 4: The hero now renders a "Next on stage" ticket strip when `upcomingShows[0]` exists. It renders nothing today (calendar empty) and lights up automatically when a show is entered, putting the ticket CTA above the fold per the brief.
- Phase 4: /shows empty state promoted Eventbrite to the primary (hazard) CTA, added a mailing-list anchor link, and cross-links to /watch, /roster, /open-mics so the ticket path never dead-ends.
- Phase 4: Shop grid no longer hides the 15 imageless products; they render typographic placeholder cards (photographed products sort first per category) so every SKU stays shoppable.
- Phase 4: Draft services are filtered from the /book list, sitemap, and next-service navigation; their URLs stay live with the existing draft banner.
- Phase 4: Cart operations now surface a visible role=alert error in the drawer instead of only console.error; the Leaflet map renders a text fallback if the runtime fails to load.
- Phase 4: Added an optional name field to the general quote form.

## Deferred - needs human review

- **Publishing the /calendar route (pro shows).** A synced, ticketed calendar of 60+ regional pro shows exists behind the underscore-private `app/(site)/_calendar` folder, deliberately unpublished via `lib/navigation.ts`. Publishing it would change site IA and surface scraped third-party content (with known HTML-entity bugs in titles). That is an owner-level product decision, so it stays dark; the entity-decoding bug is noted so titles are clean whenever it ships.
- **Populating `content/shows` with real upcoming shows.** The ticket path is empty because no shows exist in the CMS. Inventing shows would violate the no-invented-content rule; only the owner or the Eventbrite sync (needs `EVENTBRITE_PRIVATE_TOKEN`) can fill it.
- **Fourthwall product images for the 15 hidden products.** Requires pasting real image URLs from Fourthwall; cannot be fabricated.
- **Turnstile / CAPTCHA on forms.** Forms POST client-side to formsubmit.co, which cannot verify Cloudflare Turnstile tokens, and formsubmit's own captcha breaks the AJAX flow. Real spam protection means moving submission to a Worker (or formsubmit's hashed endpoint + reCAPTCHA). Honeypots stay in place; the endpoint swap is an infrastructure decision for the owner.
- **Per-mic "last verified" dates in the Open Mic Explorer.** Requires a freshness field and a verification workflow (tracked in OPEN_MICS_DATA_QUALITY.md); displaying a made-up date would violate the no-invented-content rule.
- **/book/collaboration copy.** The live page has TODO placeholders filtered at render and a one-line FAQ. Needs real copy from the owner; marking it draft would pull a live URL.
- **ComedyEvent `performer` and show time zones.** Adding performers needs a lineup field in the show CMS model (schema change), and asserting correct startDate offsets needs verified Pacific-offset timestamps once real shows exist. Both are data-model decisions for the owner; `lib/schema.ts` documents the mapping to add.
