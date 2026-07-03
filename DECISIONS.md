# DECISIONS.md

Autonomous judgment calls made during the 2026-07-03 full-site pass, with one-line rationales. Items the pass deliberately did not touch are under "Deferred - needs human review".

## Decisions

- Replaced the stale AUDIT.md (written against the old /members + /services IA at main@fb950f6) with a fresh audit of the current site; the old version remains in git history.
- The task brief said "Keystatic CMS"; the repo actually uses Sveltia CMS (Decap-compatible) at /admin reading content/*/index.json. All CMS-compatibility rules were applied to the Sveltia config and content JSON instead.

## Deferred - needs human review

- **Publishing the /calendar route (pro shows).** A synced, ticketed calendar of 60+ regional pro shows exists behind the underscore-private `app/(site)/_calendar` folder, deliberately unpublished via `lib/navigation.ts`. Publishing it would change site IA and surface scraped third-party content (with known HTML-entity bugs in titles). That is an owner-level product decision, so it stays dark; the entity-decoding bug is noted so titles are clean whenever it ships.
- **Populating `content/shows` with real upcoming shows.** The ticket path is empty because no shows exist in the CMS. Inventing shows would violate the no-invented-content rule; only the owner or the Eventbrite sync (needs `EVENTBRITE_PRIVATE_TOKEN`) can fill it.
- **Fourthwall product images for the 15 hidden products.** Requires pasting real image URLs from Fourthwall; cannot be fabricated.
