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

## Deferred - needs human review

- **Publishing the /calendar route (pro shows).** A synced, ticketed calendar of 60+ regional pro shows exists behind the underscore-private `app/(site)/_calendar` folder, deliberately unpublished via `lib/navigation.ts`. Publishing it would change site IA and surface scraped third-party content (with known HTML-entity bugs in titles). That is an owner-level product decision, so it stays dark; the entity-decoding bug is noted so titles are clean whenever it ships.
- **Populating `content/shows` with real upcoming shows.** The ticket path is empty because no shows exist in the CMS. Inventing shows would violate the no-invented-content rule; only the owner or the Eventbrite sync (needs `EVENTBRITE_PRIVATE_TOKEN`) can fill it.
- **Fourthwall product images for the 15 hidden products.** Requires pasting real image URLs from Fourthwall; cannot be fabricated.
