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

- Phase 5: Rewrote the contact form success/error strings in the CMS to match the site register ("Message sent. A human reads these. You'll hear back."), reworded the unverifiable "fastest-growing comedy platform" sponsor claim, cleaned the lucky-dime mic note, fixed the "3-4" en dash range, trimmed leading spaces and tracking params from watch video entries, deduplicated shop category assignments.
- Phase 5: Fixed three open-mic source records the normalization layer was papering over: Ballard Mandarin city set to Seattle (from its own address), "8201 launge" -> "8201 Lounge", "Conercopia" -> "Cornercopia". Quality report now 0 errors, 15 warnings (was 1 error, 17 records).
- Phase 5: External link crawl could not run from this sandbox: the environment's network policy denies general egress (CONNECT 403 from the gateway for non-allowlisted hosts; 274 of 280 URLs unreachable including google.com). The repo's lychee GitHub workflow already link-checks in CI with full egress; rely on that run.

- Phase 6: Deleted three components with zero importers (comedy-calendar, the orphaned news-feed renderer, feed-freshness); all recoverable from git history. Kept pro-shows-calendar and the @fullcalendar deps because the dark-launched `_calendar` route uses them.
- Phase 6: Removed the unused `RESERVED_SLUG_ERROR` export, added a reserved-slugs sync test (every app/(site) route folder must be in RESERVED_SLUGS), and wired `npm run test` into CI, which previously never ran the smoke tests.
- Phase 6: Left the husky pre-commit hook as lint-staged only; adding a pre-push typecheck is a workflow-preference call for the owner (CI already enforces typecheck).

## Deferred - needs human review

- **Publishing the /calendar route (pro shows).** A synced, ticketed calendar of 60+ regional pro shows exists behind the underscore-private `app/(site)/_calendar` folder, deliberately unpublished via `lib/navigation.ts`. Publishing it would change site IA and surface scraped third-party content (with known HTML-entity bugs in titles). That is an owner-level product decision, so it stays dark; the entity-decoding bug is noted so titles are clean whenever it ships.
- **Populating `content/shows` with real upcoming shows.** The ticket path is empty because no shows exist in the CMS. Inventing shows would violate the no-invented-content rule; only the owner or the Eventbrite sync (needs `EVENTBRITE_PRIVATE_TOKEN`) can fill it.
- **Fourthwall product images for the 15 hidden products.** Requires pasting real image URLs from Fourthwall; cannot be fabricated.
- **Turnstile / CAPTCHA on forms.** Forms POST client-side to formsubmit.co, which cannot verify Cloudflare Turnstile tokens, and formsubmit's own captcha breaks the AJAX flow. Real spam protection means moving submission to a Worker (or formsubmit's hashed endpoint + reCAPTCHA). Honeypots stay in place; the endpoint swap is an infrastructure decision for the owner.
- **Per-mic "last verified" dates in the Open Mic Explorer.** Requires a freshness field and a verification workflow (tracked in OPEN_MICS_DATA_QUALITY.md); displaying a made-up date would violate the no-invented-content rule.
- **/book/collaboration copy.** The live page has TODO placeholders filtered at render and a one-line FAQ. Needs real copy from the owner; marking it draft would pull a live URL.
- **ComedyEvent `performer` and show time zones.** Adding performers needs a lineup field in the show CMS model (schema change), and asserting correct startDate offsets needs verified Pacific-offset timestamps once real shows exist. Both are data-model decisions for the owner; `lib/schema.ts` documents the mapping to add.

---

# CMS editor pass (Sveltia), 2026-07-03

Judgment calls made during the /admin editor hardening pass. Findings and
statuses live in CMS_AUDIT.md; this is the why.

## Decisions

- Phase 1: Guarded the shims (site.ts, home.ts, shows.ts, members.ts, comedians.ts, sponsorships.ts) instead of marking every rendered field required in config. Rationale: a field an editor is allowed to clear must never crash the build; required flags stay reserved for fields that are editorially mandatory (show name and start, open mic venue and city).
- Phase 1: Pinned Sveltia CMS to 0.170.0 in public/admin/index.html (was floating unpkg latest). A CMS that changes under the editor with no commit in this repo is a support hazard. Bump procedure documented inline.
- Phase 1: Shows now slug from name plus start date ({{fields.name}}-{{fields.start | date('YYYY-MM-DD')}}) and store as <slug>/index.json like every other collection. Safe because content/shows had zero entries. start became required: the slug needs it, and a dateless show cannot sort into the upcoming list. Sveltia supports these Static-CMS-style slug transformations.
- Phase 1: Made open_mics venue and city required. All 90 real entries already have both, and the slug template builds filenames from them.
- Phase 1: Normalized the 4 open-mic entries missing "frequency" to "weekly" via migration script, matching the fallback the shim was already applying. Files and config now agree without silent correction.
- Phase 1: Removed the dead Keystatic-era data-shape branches (discriminant/value handling in lib/blocks.ts, content/shows.ts presale, content/home.ts mission) after verifying zero content files contain a "discriminant" key.
- Phase 1: Kept sponsorships.stats and site.podcasts in the config even though nothing renders them. Sveltia rewrites the whole file on save, so deleting the config fields would silently drop that stored data on the next save. Both are owner-marked future slots.
- Phase 1: Kept ADMIN_PLAN.md; it is self-marked as historical and documents why Sveltia replaced the Keystatic plan.
- Phase 2: Rewrote every label and hint in plain language with concrete examples (link formats, image sizes, date behavior). Verified via a config diff script that all 645 field name paths survived unchanged, so no stored data is orphaned.
- Phase 2: pro_shows.club switched from a free-typed string to a relation widget picking from the pro-clubs list (value stays the club slug string, so existing and synced data are unaffected). Sveltia supports relation lookups into file collections with wildcard paths.
- Phase 2: Field order now follows editorial priority (what an editor always fills comes first; technical fields like map coordinates, SEO overrides, and future slots sink to the bottom).
- Phase 2: Added default sort (shows and news by date descending, members by display order), view filters (drafts, ticket status, featured), and view groups (open mics by day and city). An "upcoming vs past" filter is not expressible in Sveltia view_filters (patterns are static regexes, no date math), so ticket-status filters plus date sort stand in. Logged under deferred.
- Phase 2: news.date became a date-only picker (YYYY-MM-DD). News cards never show a time, and the collection is empty, so nothing to migrate.
- Phase 2: pro_shows slug now includes the start date, matching shows. No entries exist on disk, so no renames.
- Phase 2: Kept identifier-from-folder quirks for pricing tiers and shop products (name field stays optional with a "leave blank" hint) rather than backfilling name fields into 21 JSON files that the folder slug already identifies.
- Phase 3: URL fields got https patterns with plain-language error messages; internal link fields accept /page, #anchor, https://, mailto: or tel:. Contact email, dialing number, and WhatsApp fields validate their exact formats. All 163 config patterns compile-checked, and every existing content value passes them.
- Phase 3: open mic signupUrl deliberately accepts either a real link or written instructions ("Host makes the list"). The rendering layer (classifySignup) already supports instruction text and renders it as a note, so the config and the new validator mirror that exactly instead of forcing a data migration that would change on-page presentation.
- Phase 3: Fixed one real data bug the validator caught: the Woodinville "Rooney's" mic had an empty venue field; set venue to the mic name (no invented facts, same fallback the display layer used).
- Phase 3: Added scripts/validate-content.ts (zod) validating every CMS file: singleton shapes, collection entries, news frontmatter, reserved page slugs, and a repo-wide em dash scan over editable content. Wired into prebuild before indexing and into npm test, so a bad commit fails the deploy on Cloudflare and in CI. Proven by negative test: corrupting site.json fails the run with three readable errors.
- Phase 3: Created the five missing media folders (uploads, news, tiktok, shows, clubs) with .gitkeep so per-field upload targets all exist and land where the shims expect. Public path mapping verified per field: bare filenames for shims that prefix (/images/comedians, members, tiktok, shows) and absolute paths for the rest.
- Phase 3: Navigation and footer stay editable rather than excluded: content/site.ts falls back to the built-in menu when the list is emptied, hrefs are pattern-validated, and the hint warns the editor. Excluding them entirely would push routine menu edits back to code changes, which defeats the point of the CMS.
- Phase 4: CMS commits now carry a "content:" prefix via backend.commit_messages (create/update/delete/upload), so editor activity is distinguishable from code commits at a glance. No [skip ci] marker: a CMS commit must trigger a deploy, that is the whole pipeline.
- Phase 4: The OAuth relay Worker (stonedgoosecms.kylewmixon.workers.dev) could not be reached from this sandbox; the environment denies general outbound traffic. Its committed configuration (base_url, documented callback URL, ALLOWED_DOMAINS guidance) was reviewed statically and is consistent. A one-time live login test after merge is listed as deferred. The auth provider was not changed.
- Phase 4: Hardened the setup docs: ALLOWED_DOMAINS should list exact hostnames only. The previous docs suggested adding *.pages.dev, which would allow every Cloudflare Pages site on the internet to bounce logins through the relay; the recommendation now is one explicit preview hostname if needed.
- Phase 4: Documented and verified the local editing path: with npm run dev, the editor lives at /admin/index.html (checked: 200 in dev; bare /admin only resolves on the deployed static host) and Sveltia's built-in Work with Local Repository mode needs no auth. No local_backend config or proxy is required with Sveltia.
- Phase 4: Deploy trigger traced: save -> content: commit on main -> Cloudflare build -> prebuild validate + reindex -> static export. Because every page is statically generated per build, new content appears with no revalidation hooks. The optimize-images workflow adds a second deploy after heavy uploads; acceptable and documented.
