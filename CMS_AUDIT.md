# CMS Audit: Sveltia editor at /admin

Audit date: 2026-07-03. Scope: the full editing pipeline, from `public/admin/config.yml`
through the JSON files in `content/`, the consolidator (`scripts/build-content-index.ts`),
the typed shims (`content/*.ts`), and the pages that render them.

Priorities: **P0** = a legal editor action can break the build or the live site.
**P1** = editor safety or correctness gap. **P2** = friction, polish, cleanup.

Status legend: each finding ends with a status line, updated as work lands.

---

## 1. How the integration fits together

- **Admin entry point:** `public/admin/index.html`, a static page loading Sveltia CMS
  from unpkg. Ships inside the exported `/out`, so `/admin` exists on every host.
- **Config:** `public/admin/config.yml` (Decap-compatible). Backend `github`,
  repo `KyleMix/stoned_goose_website`, branch `main`.
- **Auth:** GitHub OAuth relayed through a `sveltia-cms-auth` Cloudflare Worker at
  `https://stonedgoosecms.kylewmixon.workers.dev` (`backend.base_url`).
- **Deploy:** Cloudflare (Workers Static Assets via `wrangler.jsonc`, or Pages) builds
  on every push to `main`. A CMS save is a push to `main`, so saving deploys.
- **Consumption path:** CMS writes JSON under `content/<collection>/`. At build,
  `prebuild` runs `scripts/build-content-index.ts`, which flattens each collection to
  `content/.generated/<collection>-index.json`. The typed shims in `content/*.ts` import
  those (or the singleton JSON directly) and every page imports the shims.
- **Sync overrides:** `.generated/shows.json`, `products.json`, `pro-shows.json` come
  from sync scripts and override the manual CMS collections when non-empty.

## 2. Three-way alignment: config vs content vs rendering code

Notation: `config` = field in config.yml, `content` = key in the JSON on disk,
`code` = what the shim/page reads. "ok" means all three agree.

### Singletons (site_content file collection)

| Field | Config | Content | Code | Verdict |
|---|---|---|---|---|
| home.hero (all subfields) | present | present | `home.ts` exports `raw.hero` unguarded | ok, but see P0-2 |
| home.marqueeWords | required: false | present | exported unguarded, `.map`ped by home page | **P0-2** |
| home.bumpers.(clarification/aside/outro) | lists required: false | present | exported unguarded | **P0-2** |
| home.mission | required: false | present (empty strings) | guarded (`resolveMission`) | ok |
| home.topSections/bottomSections | required: false | absent | `normaliseBlocks` guards | ok |
| site.name/shortName/description | required | present | unguarded | ok |
| site.tagline, site.url | required: false | present | read unguarded (undefined tolerated as string) | **P1-6** |
| site.contact.* | object required, subfields optional | present | `raw.contact.email...` unguarded | ok while object required |
| site.social | object, subfields optional | present (no facebookPageId) | assigned wholesale; feeds scripts read optional keys guarded | ok |
| site.podcasts | object required: false | present as `{}` | `raw.podcasts.spotifyShowId` unguarded: **crashes if the key is ever absent/null** | **P0-1** |
| site.serviceAreas | required: false | present | assigned unguarded, `.map`ped downstream | **P0-1** |
| site.press/nav/footer/seo/booking | required: false | present | guarded with defaults | ok |
| shows-copy.* | mixed | present | `featuredSpecial.*` read unguarded but object is required-by-default | ok |
| shows-copy.presale | required: false | present | guarded (`resolvePresale`), plus dead legacy Keystatic branch | P2-4 |
| watch-copy.heading/subhead/emptyClipsLine | heading required | present | read unguarded (strings) | ok |
| watch-copy.youtubeVideos | required: false | present | `?? []` | ok |
| roster-copy.comedians / about | objects (required by default) | present | `copy.comedians.*`, `copy.about` unguarded | ok while required |
| roster-copy.pillars | required: false | present | exported unguarded, `.map`ped on /roster | **P0-3** |
| open-mics-copy.* | mixed | present | guarded | ok |
| shop-copy.* | mixed | present | `categoryAssignments ?? []`, rest tolerated | ok |
| contact-copy.* | all optional | present | fully defaulted (DEFAULT object) | ok, model citizen |
| sponsorships.stats / tiers | both required: false | present | `raw.stats.map(...)`, `raw.tiers` unguarded; tiers render on /book | **P0-3** |
| pro-clubs.* | mixed | present | fully guarded | ok |

### Folder collections

| Collection | Config folder | On disk | Code | Verdict |
|---|---|---|---|---|
| pages | content/pages, `{{slug}}/index` | 1 entry (welcome) | guarded, reserved-slug build guard | ok |
| comedians | content/comedians | 32 entries; 23 lack `photoAlt`/`draft` (both optional) | fully defaulted; photo gets `/images/comedians/` prefixed to the bare filename | ok |
| members | content/members | 5 entries, consistent | fully defaulted; `/images/members/` prefix | ok |
| services | content/services | 4 entries, consistent | fully defaulted | ok |
| pricing_tiers | content/pricing-tiers | 3 entries, no `name` key (identity = folder slug) | name derived from slug | ok (config hints this) |
| shows | content/shows | **directory does not exist** (no manual shows yet) | indexer tolerates; synced `.generated/shows.json` overrides | ok; slug template weak, see P1-1 |
| pro_shows | content/pro-shows | directory does not exist | indexer tolerates; manual overrides synced | ok; `club` field is a free string, see P1-3 |
| shop_products | content/shop-products | 18 entries: `price`,`url`,`image` only | name derived from slug | ok |
| open_mics | content/open-mics | 90 entries; **4 lack `frequency`**, 3 lack `notes`, `weeks` in 22 | shim normalizes missing frequency to weekly | P1-4 (normalize files) |
| tiktok | content/tiktok | directory does not exist | indexer tolerates | ok |
| news | content/news | empty (.gitkeep) | indexer defaults every frontmatter field | ok |

Fields present in content but missing from config (would be invisible to editors AND
silently dropped when Sveltia rewrites the file on save): **none found.** Every key on
disk is covered by config. The generated `slug`/`id` keys exist only in `.generated/`.

Config fields nothing renders (dead weight candidates):
- `sponsorships.stats`: not rendered anywhere; the hint already says so. Kept
  deliberately (owner intent: "for when real numbers exist"). Removing it from config
  would drop the data on the next save of that file.
- `site.podcasts`: exported by `site.ts` but no page renders it; labeled "future slot".
  Same preservation logic; kept.

## 3. Findings

### P0: a legal editor action can take down the build

- **P0-1 `site.ts` crash surface.** `raw.podcasts.spotifyShowId` and
  `raw.serviceAreas` are dereferenced unguarded at module load, while config marks
  `podcasts` and `serviceAreas` `required: false`. Sveltia's default output writes
  empty optional fields as `null` (omit_empty_optional_fields defaults to false), so an
  editor clearing "Podcasts" or "Service areas" ships `null` and the next build throws
  at import time. Fix: guard the shim; keep config optionality.
  **Status: OPEN. Fix planned in Phase 1.**
- **P0-2 `home.ts` crash surface.** `raw.marqueeWords` and each `bumpers` slot are
  `required: false` in config but exported unguarded and `.map`ped by the home page.
  Clearing the marquee list = broken home page. Fix: guard the shim with `?? []`.
  **Status: OPEN. Fix planned in Phase 1.**
- **P0-3 `sponsorships.ts` and `roster-copy.pillars` crash surface.** `raw.stats.map`
  and `raw.tiers` (rendered on /book) unguarded with `required: false` config; same for
  `pillars` on /roster via `members.ts`. Fix: guard the shims.
  **Status: OPEN. Fix planned in Phase 1.**

### P1: editor safety and correctness

- **P1-1 Shows slug has no date.** `slug: '{{fields.name}}'` means two runs of the same
  show collide and the filename says nothing about when. Sveltia supports Static-CMS
  style transformations, so `{{fields.name}}-{{fields.start | date('YYYY-MM-DD')}}`
  gives clean stable filenames. Safe: no manual show entries exist yet.
  **Status: OPEN. Fix planned in Phase 1.**
- **P1-2 Sveltia is unpinned.** `index.html` loads `https://unpkg.com/@sveltia/cms/...`
  (floating latest). A breaking Sveltia release changes the editor with no commit in
  this repo. Pin to a known version (latest at audit time: 0.170.0) and document the
  bump procedure. **Status: OPEN. Fix planned in Phase 1.**
- **P1-3 `pro_shows.club` is a free-typed string** that must exactly match a club slug
  in the pro-clubs singleton; a typo silently orphans the show from every club filter.
  Sveltia's relation widget supports file collections with wildcard paths
  (`value_field: clubs.*.slug`). **Status: OPEN. Fix planned in Phase 2, relation widget.**
- **P1-4 Open mic entries drift.** 4 of 90 entries lack `frequency` (the shim papers
  over it with "weekly"). Normalize the files so content matches config defaults
  instead of relying on fallback. **Status: OPEN. Fix planned in Phase 1, migration script.**
- **P1-5 No URL validation anywhere.** `ticketUrl`, `url`, `signupUrl`, `website`,
  `eventsUrl`, social URLs, `videoUrl` are plain strings. A pasted "www.x.com" (no
  scheme) renders as a relative link and 404s. Add https patterns with human messages.
  **Status: OPEN. Fix planned in Phase 3.**
- **P1-6 `site.url` / canonical fields unvalidated.** Site URL feeds metadata and
  schema.org; a malformed value poisons every page's canonical tags.
  **Status: OPEN. Fix planned in Phase 3, pattern + shim tolerance.**
- **P1-7 Open mic slug built from optional fields.**
  `slug: '{{fields.venue}}-{{fields.city}}-{{fields.day}}'` with venue and city
  `required: false` can produce `--monday` style filenames. Make venue and city
  required (every one of the 90 real entries has both).
  **Status: OPEN. Fix planned in Phase 1.**
- **P1-8 No build-side content validation.** A hand-edit or bad merge to `content/`
  ships whatever it ships; nothing between "JSON parses" and "page renders wrong".
  Add a zod schema check to prebuild so a bad commit fails the deploy.
  **Status: OPEN. Fix planned in Phase 3, `scripts/validate-content.ts`.**
- **P1-9 No default sort, filters, or groups on collections.** Shows and news should
  default-sort by date descending; upcoming vs past filters help once real shows land.
  Sveltia supports `sortable_fields` with a `default`, plus `view_filters` /
  `view_groups`. **Status: OPEN. Fix planned in Phase 2.**
- **P1-10 Commit messages are Sveltia defaults**, indistinguishable from code commits
  at a glance. Add `backend.commit_messages` with a `content:` prefix.
  **Status: OPEN. Fix planned in Phase 4.**

### P2: friction and cleanup

- **P2-1 Jargon labels.** "Href", "Eyebrow", "E.164", "kicker", "slug" appear as
  labels/hints without translation for a non-developer. Many fields have no hint at
  all (every shows field, most site config, most home hero).
  **Status: OPEN. Fix planned in Phase 2, full label/hint pass.**
- **P2-2 Editor previews are useful but partial.** Summaries exist for most folder
  collections but shows shows `name · status` (no date), and datetime fields have no
  explicit format so the stored value depends on widget defaults.
  **Status: OPEN. Fix planned in Phase 2, summaries + explicit datetime formats.**
- **P2-3 Keystatic-era leftovers.** `ADMIN_PLAN.md` (self-marked historical, harmless),
  `"keystatic"` in `lib/reserved-slugs.ts` (harmless, protects an old URL), and dead
  legacy-shape branches: `blocks.ts` `discriminant` handling, `shows.ts` legacy presale
  shape, `home.ts` legacy mission shape. No content on disk uses the legacy shapes
  (verified: zero `discriminant` keys under content/). Remove the dead branches.
  **Status: OPEN. Fix planned in Phase 1. ADMIN_PLAN.md kept as marked history.**
- **P2-4 Three overlapping editor docs** (`docs/EDITING.md`, `docs/editor.md`,
  `docs/editing-content.md`) predate this pass and partially duplicate each other.
  **Status: OPEN. Fix planned in Phase 5: make CMS_GUIDE.md canonical, cross-link docs.**
- **P2-5 `shows` collection stores flat `<slug>.json`** while every other collection
  uses `<slug>/index.json`. The indexer accepts both; cosmetic inconsistency only.
  **Status: OPEN. Fix planned in Phase 1, path added while the collection is still empty.**
- **P2-6 Media library default folder** (`public/images/uploads`) exists in config but
  not on disk; per-field overrides cover every image field in practice.
  **Status: OPEN. Fix planned in Phase 3, folder tracked + mapping verified.**

## 4. Auth and pipeline notes (Phase 4 scope)

- The OAuth worker URL (`stonedgoosecms.kylewmixon.workers.dev`) and unpkg cannot be
  reached from this sandbox (egress policy denies general outbound), so live checks of
  the worker and its ALLOWED_DOMAINS were not possible. Static review of the documented
  setup in SERVER_DEPLOYMENT.md found it correct for the current Cloudflare deployment.
  Flagged for a one-time manual login test after merge.
- Local editing: Sveltia's "Work with Local Repository" mode works out of the box on
  `npm run dev` + a Chromium browser; no `local_backend` config needed. Documented in
  CMS_GUIDE.md.
- Deploy trigger: CMS commit -> push to `main` -> Cloudflare build hook -> `npm run
  build` (prebuild reindexes content) -> static export. New content appears with no
  manual step. The `optimize-images` GitHub workflow additionally recompresses heavy
  CMS uploads and pushes the lighter file, which triggers one more deploy.

## 5. Editor flow friction log (traced statically)

1. Sign-in requires the Worker to be up; there is no fallback message in config if it
   is not. (Sveltia shows its own error; acceptable.)
2. An editor creating a Show today sees 15 fields with no hints, date pickers with no
   format guidance, and a status select that defaults to TBA. Ticket URL accepts
   anything.
3. "Site copy" contains eight files including structural nav/footer; a stray edit to
   Primary nav can hide pages. Nav stays editable because `site.ts` falls back to
   DEFAULT_NAV when the list is emptied; stricter validation planned in Phase 3.
4. Nothing tells the editor that synced shows override manual ones. Collection
   descriptions get this in Phase 2.
