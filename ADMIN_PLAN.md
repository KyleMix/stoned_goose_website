# Admin Page Plan

## Discovery Findings

No existing admin or CMS setup in the repo. Confirmed by:

- No `admin`, `cms`, `studio`, `dashboard`, or `editor` directories anywhere outside `node_modules`
- No routes named `/admin` or `/cms` in `app/`
- No CMS or auth dependencies in `package.json`: zero matches for keystatic, decap, sveltia, sanity, contentful, payload, tina, netlify-cms, next-auth, clerk, supabase, @auth
- No CMS config files (`sanity.config.*`, `keystatic.config.*`, `tina.config.*`, etc.)
- No README or `docs/` mentions of an admin surface or content editor

Adjacent infrastructure that informs the design:

- Hosting is multi-target. README documents Vercel, Cloudflare Pages, and Netlify. Each reads the static export. Redirects live in both `vercel.json` and `public/_redirects`.
- `.github/workflows/refresh-feeds.yml` already commits JSON changes back to the branch via `stefanzweifel/git-auto-commit-action`, then relies on the host's auto-deploy hook. This is the exact pattern a git-based CMS uses: edit -> commit -> host rebuild. The repo already trusts this loop.
- Content is split across three patterns:
  - Hand-edited TypeScript modules (`content/site.ts`, `content/home.ts`, `content/services.ts`, etc.). These export typed const arrays and objects. Components import them by name.
  - Generated JSON written by sync scripts (`content/.generated/{shows,products,patreon,placeholders}.json`). The `.ts` files import the JSON when present and fall back to manual arrays.
  - Feed JSON written by scheduled fetchers (`content/feeds/{instagram,youtube,facebook,open-mics}.json`).
- TypeScript is strict. Components rely on the typed shape of every content module.
- No database. No server runtime. `next.config.mjs` sets `output: "export"` and the README treats that as a hard constraint.

## Recommended Approach

**Option A. Keystatic with Keystatic Cloud (free auth tier).**

Reasoning, tied to the stated situation:

1. **You edit yourself, sometimes from a phone.** Keystatic's admin is a responsive React app. Mobile is good for text and lists, weaker for drag-and-drop image cropping. Flagged in detail below.
2. **No monthly bill.** Keystatic Cloud's free tier provides GitHub OAuth and the commit relay for unlimited collaborators. The paid tier is for advanced features you do not need. The repo stays on Vercel/Cloudflare/Netlify, no new host.
3. **Content stays in the repo.** Every save is a git commit. The diff is reviewable. If the admin breaks tomorrow, the content is still in `content/*.json` and your existing typed shims keep importing it. There is no vendor lock-in beyond the auth proxy.
4. **Strongest fit for Next 15 + strict TypeScript.** Keystatic is built by Thinkmill (same shop that built Keystone), explicitly targets Next App Router, has first-class TypeScript, and ships its admin as a React component. Decap and Sveltia work but feel older and want everything in markdown.
5. **Static export compatible.** Keystatic in "GitHub mode" via Keystatic Cloud talks to GitHub from the browser using the user's OAuth token. No server runtime needed. The admin route is a client-side page in the static export. We keep `output: "export"`.
6. **Content stays small.** Your editable surfaces are short arrays (5 to 25 entries) and small text fields. Keystatic handles this without ceremony.

Why not the others:

- **Option B (Sanity, Contentful, Payload).** Content leaves the repo. Monthly bill or self-host. More moving parts than this site needs.
- **Option C (Local-only admin).** Cuts out phone editing entirely. Defeats the main use case.
- **Decap CMS.** Works, but the project is barely maintained, the admin UI is dated, mobile is rougher than Keystatic, and configuring GitHub OAuth without a paid service usually means standing up your own OAuth proxy. Not worth it when Keystatic Cloud's free tier exists.
- **Sveltia CMS.** Decap-compatible config with a modern Svelte admin. Active but younger. If Keystatic ever stops working for you, this is the second pick.

The trade-off you are accepting with Keystatic: content moves from `content/*.ts` (typed source) to `content/*.json` (CMS-managed). We preserve the existing component imports by adding a thin TypeScript shim per content type that imports the JSON and re-exports it with the same name and type. Zero call-site changes. Details in Architecture.

## Architecture

```
              admin (you, on phone or laptop)
                          |
                          v
      /keystatic route on the static site (client-side React)
                          |
                          v
              Keystatic Cloud OAuth proxy
                          |
                          v
                 GitHub repo (this repo)
                          |
                          v
      push to branch -> Vercel/Cloudflare/Netlify auto-deploy
                          |
                          v
                www.stonedgooseproductions.com
```

### Pieces

- **`/keystatic/[[...params]]/page.tsx`** mounts the Keystatic Admin UI as a client component. Static export emits a single HTML shell; the admin React app boots in the browser and reads/writes via GitHub APIs proxied by Keystatic Cloud.
- **`keystatic.config.ts`** at the repo root declares the content schema (collections, singletons, fields, validation). This is the canonical source of truth for "what can be edited."
- **`content/<thing>.json`** files hold the editable data. Keystatic reads and writes these.
- **`content/<thing>.ts`** TypeScript shims import the JSON and re-export typed objects, so every existing component import keeps working unchanged. Where the file already had a manual array fallback plus a `.generated/` override (e.g. `shows.ts`), the shim keeps that pattern and the CMS-managed JSON replaces the "manual" slot.
- **Keystatic Cloud project** linked to this GitHub repo. Free tier. One-time setup at `keystatic.cloud`. Provides the GitHub OAuth callback and the commit relay so we do not have to host an OAuth proxy ourselves.
- **`.env.example`** gets two new entries (Keystatic Cloud project ID and the optional storage branch name). No secrets in the repo. The Keystatic GitHub App handles authorization; we do not store GitHub tokens.

### Static-export constraint

Keystatic ships a Next App Router integration that supports `output: "export"` when configured for GitHub mode + Keystatic Cloud. The admin route is rendered as a client component, no server actions, no edge runtime. The reader API at build time is just `JSON.parse` against the committed files. We are not adding SSR or ISR.

### Routing

- `/keystatic` is the admin entry. It is a real route in the static export.
- We add `Disallow: /keystatic` to `public/robots.txt` so search engines do not index it, and `noindex` on the page itself.
- The route stays publicly reachable. Auth happens client-side: anyone hitting `/keystatic` sees a "Sign in with GitHub" screen, and write APIs reject anyone without push access to this GitHub repo. There is no "secret URL" required.

## Auth and access control

Login flow:

1. You open `https://www.stonedgooseproductions.com/keystatic` (or any branch preview URL).
2. The page boots, sees no session token, and shows a single "Sign in with GitHub" button.
3. The button hands off to Keystatic Cloud's OAuth flow at `keystatic.cloud/oauth/authorize`.
4. GitHub shows the normal OAuth consent screen. You approve the Keystatic Cloud GitHub App once, scoped to this repo only.
5. GitHub redirects to Keystatic Cloud, which redirects back to `/keystatic` with a session token in a cookie.
6. Every save in the admin sends a commit request through Keystatic Cloud. Keystatic Cloud uses your GitHub identity to commit to the repo. Commits show up as authored by you in git history.

Who can access:

- Anyone with **push access to the `stoned_goose_website` GitHub repo**. Today that is you. To add a crew member later, add them as a GitHub collaborator. Keystatic does not have its own user list; it delegates to GitHub.
- Read access is open in the sense that the `/keystatic` URL loads, but it cannot do anything without a valid GitHub session that has push access. The repo content is already public on GitHub, so showing the admin shell to a stranger leaks nothing.

What is committed:

- Each save is one git commit. Default branch is `main` (your repo's default). Optional alternative: route saves to a `content/draft` branch and require a PR. Flagged in Open Questions; default proposal is "commit straight to `main`" for fewer steps.
- Commits are authored by your GitHub identity, with a Keystatic CMS message prefix like `chore(content): update news`.

## Content Schema

Below is the full inventory of editable surfaces. Read-only items (auto-generated feeds, type definitions) are listed at the end for completeness so you can see what the CMS deliberately does **not** touch.

### Singletons (one record each)

#### `site` (from `content/site.ts`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | text | yes | min length 2 |
| `shortName` | text | yes | min length 2 |
| `tagline` | text | yes | no em dashes |
| `url` | text (URL) | yes | starts with `https://` |
| `description` | longtext | yes | 50-300 chars, no em dashes |
| `contact.email` | text (email) | yes | valid email |
| `contact.phone` | text | yes | display string e.g. "(360) 323-0667" |
| `contact.phoneTel` | text | yes | E.164 e.g. "+13603230667" |
| `contact.whatsapp` | text | no | E.164 without leading + |
| `contact.smsEnabled` | boolean | yes | default true |
| `contact.address` | text | yes | one line |
| `contact.locality` | text | yes | e.g. "Olympia" |
| `contact.region` | text | yes | 2-letter state |
| `social.instagram` | text (URL) | yes | URL |
| `social.facebook` | text (URL) | yes | URL |
| `social.tiktok` | text (URL) | yes | URL |
| `social.youtube` | text (URL) | yes | URL |
| `social.patreon` | text (URL) | yes | URL |
| `social.eventbrite` | text (URL) | yes | URL |
| `social.fourthwall` | text (URL) | yes | URL |
| `social.youtubeChannelId` | text | no | starts with UC |
| `social.facebookPageId` | text | no | numeric string |
| `podcasts.spotifyShowId` | text | no | |
| `podcasts.applePodcastsId` | text | no | |
| `podcasts.rssUrl` | text (URL) | no | URL |
| `serviceAreas` | list of text | yes | min 1 entry |
| `press` | list of object | no | each: quote, outlet, url (optional). No invented quotes. |

#### `home` (from `content/home.ts`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `hero.eyebrow` | text | yes | no em dashes |
| `hero.italicLine` | text | yes | no em dashes |
| `hero.headline` | text | yes | no em dashes |
| `hero.subhead` | longtext | yes | no em dashes |
| `hero.primary.label` | text | yes | |
| `hero.primary.href` | text (URL or path) | yes | |
| `hero.secondary.label` | text | yes | |
| `hero.secondary.href` | text (URL or path) | yes | |
| `hero.tertiary` | list of object | yes | each: label, href |
| `marqueeWords` | list of text | yes | no invented stats. No em dashes. |
| `bumpers.clarification` | list of object | yes | each: eyebrow, body (multiline allowed via `\n`), footnote |
| `bumpers.aside` | list of object | yes | same shape |
| `bumpers.outro` | list of object | yes | same shape |
| `mission` | object or null | no | eyebrow, heading, body. Optional. Renders the home mission strip when populated. |

#### `watchCopy` (from `content/watch.ts`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `heading` | text | yes | |
| `subhead` | text | yes | no em dashes |
| `emptyClipsLine` | text | yes | no em dashes |

#### `showsCopy` (from `content/shows.ts`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `heading` | text | yes | |
| `subhead` | text | yes | no em dashes |
| `emptyState` | longtext | yes | no em dashes |
| `featuredSpecial.title` | text | yes | |
| `featuredSpecial.subtitle` | text | yes | |
| `featuredSpecial.blurb` | longtext | yes | no em dashes |
| `featuredSpecial.videoUrl` | text or null | no | YouTube URL or 11-char id |
| `featuredSpecial.poster` | image | yes | committed to `/public/images/shows/` |
| `featuredSpecial.comedianHandle` | text (URL) | yes | |
| `presale` | object or null | no | code, expiresAt (date), venueName |

#### `comediansCopy` (from `content/comedians.ts`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `subhead` | text | yes | no em dashes |
| `kicker` | text | yes | no em dashes |

#### `aboutCopy` and `pillars` (from `content/members.ts`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `aboutCopy.heading` | text | yes | |
| `aboutCopy.subhead` | longtext | yes | no em dashes |
| `aboutCopy.crewHeading` | text | yes | |
| `aboutCopy.crewSubhead` | text | yes | |
| `pillars` | list of object | yes | each: title, body (longtext) |

#### `shopCopy` (from `content/shop.ts`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `heading` | text | yes | |
| `subhead` | text | yes | no em dashes |
| `collectionUrl` | text (URL) | yes | Fourthwall URL |
| `storeUrl` | text (URL) | yes | Fourthwall URL |

#### `openMicsCopy` (from `content/open-mics.ts`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `subhead` | text | yes | no em dashes |
| `kicker` | text | yes | no em dashes |

#### `sponsorships` (from `content/sponsorships.ts`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `stats` | list of object | yes | each: label, value (text or null, null renders placeholder), detail |
| `tiers` | list of object | yes | each: name, price, deliverables (list of text) |

### Collections (multiple records, one file each)

#### `comedians` (from `content/comedians.ts`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | text | yes | min length 2, used as slug seed |
| `photo` | image | yes | uploads to `public/images/comedians/` |
| `instagram` | text (URL) | no | URL |
| `facebook` | text (URL) | no | URL |

Slug rule: kebab-case from `name`. One file per comedian under `content/comedians/`.

#### `members` (from `content/members.ts`, crew only)

| Field | Type | Required | Validation |
|---|---|---|---|
| `slug` | slug | yes | kebab-case |
| `name` | text | yes | min length 2 |
| `role` | text | yes | |
| `photo` | image | yes | uploads to `public/images/members/` |
| `index` | text | yes | two-digit string e.g. "01" |
| `bio` | longtext | no | 2-3 sentences, no em dashes |

Order preserved by `index` field.

#### `services` (from `content/services.ts`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `slug` | slug | yes | kebab-case, immutable after creation |
| `title` | text | yes | |
| `metaTitle` | text | yes | <= 60 chars |
| `metaDescription` | longtext | yes | <= 160 chars, no em dashes |
| `summary` | longtext | yes | no em dashes |
| `whatYouGet` | list of text | yes | renderer skips entries starting with "TODO" |
| `idealFor` | list of text | yes | same TODO skip |
| `process` | list of text | yes | 3-step structure, same TODO skip |
| `pricing` | longtext | yes | no em dashes |
| `faqs` | list of object | yes | each: q, a. Renderer skips answers starting with "TODO" |
| `draft` | boolean | no | when true, page shows "Draft" banner |

#### `pricingTiers` (also in `content/services.ts`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | text | yes | |
| `bestFor` | text | yes | |
| `price` | text | yes | e.g. "Starting at $750" |
| `items` | list of text | yes | min 1 entry |

#### `news` (from `content/news.ts`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `slug` | slug | yes | auto-generate from title |
| `title` | text | yes | |
| `date` | date | yes | ISO date |
| `summary` | longtext | yes | no em dashes |
| `body` | rich text or longtext | yes | no em dashes |
| `image` | image | no | uploads to `public/images/news/` |
| `tags` | list of text | no | |

#### `shows` manual (from `content/shows.ts` -> `manualShows`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `id` | slug | yes | kebab-case |
| `name` | text | yes | |
| `start` | datetime | yes | ISO with timezone |
| `end` | datetime | no | ISO, optional |
| `url` | text (URL) | no | event page URL |
| `ticketUrl` | text (URL) | no | ticketing URL |
| `summary` | longtext | yes | no em dashes |
| `imageUrl` | image | no | uploads to `public/images/shows/` |
| `venue.name` | text | no | |
| `venue.address` | text | no | |
| `venue.city` | text | no | |
| `venue.region` | text | no | |
| `venue.country` | text | no | default "US" |
| `status` | select | no | "ticketed" / "free" / "tba" |
| `ticketPrice` | text | no | display string |
| `doorTime` | text | no | |
| `source` | hidden | no | always "manual" for CMS entries |

Note: this only edits the manual fallback list. The generated `content/.generated/shows.json` from Eventbrite continues to take precedence when populated. The CMS surface clearly says "manual entries (visible when Eventbrite sync is empty)."

#### `shop` manual (from `content/shop.ts` -> `manualProducts`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | text | yes | |
| `price` | text | yes | e.g. "$20.00" |
| `url` | text (URL) | yes | Fourthwall product URL |
| `image` | text (URL) | no | imgproxy URL. The shop hides products without an image. |

Same fallback semantics as `shows`.

#### `openMics` (from `content/feeds/open-mics.json`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `id` | slug | yes | |
| `name` | text | yes | |
| `venue` | text | yes | |
| `address` | text | yes | |
| `city` | text | yes | |
| `region` | text | yes | WA or OR (map is region-restricted) |
| `lat` | number | yes | |
| `lng` | number | yes | |
| `day` | select | yes | Monday through Sunday |
| `time` | text | yes | e.g. "7:30 PM" |
| `host` | text | no | |
| `signupUrl` | text (URL) | no | |
| `notes` | longtext | no | |

The "report a change" dialog already feeds owner email. The CMS surface is for direct edits.

#### `tiktokVideos` (from `content/social.ts`)

| Field | Type | Required | Validation |
|---|---|---|---|
| `url` | text (URL) | yes | TikTok video URL |
| `title` | text | yes | |
| `poster` | image | yes | uploads to `public/images/tiktok/` |

Currently empty array. Editing here re-activates the TikTok glue in `lib/news-feed.ts`.

### Read-only (CMS does not edit)

- `content/feeds/{instagram,youtube,facebook}.json` and `content/feeds/types.ts` (auto-synced)
- `content/.generated/*.json` (auto-generated)
- `content/feeds/open-mics.json` is read-write by the CMS but also written by `scripts/sync-open-mics.ts`. Last-writer-wins. Document in the CMS surface.

## Deploy Flow

In plain text:

1. You open `https://www.stonedgooseproductions.com/keystatic` on your phone or laptop.
2. You log in via the Keystatic Cloud GitHub OAuth flow. Token persists in cookie for the session.
3. You edit content in the admin UI. Example: open the `news` collection, click "New", fill in title/date/summary/body, attach an image.
4. Click Save. The Keystatic admin sends a commit request through Keystatic Cloud to the GitHub repo, authored as you. The commit adds or updates the relevant `content/<thing>.json` file (and any uploaded images under `public/`).
5. GitHub receives the push. Your host (Vercel/Cloudflare Pages/Netlify) detects the push, runs `npm run build`, exports `/out`, deploys.
6. Live in roughly **60 to 120 seconds** for a normal copy edit, **2 to 4 minutes** for an image-heavy edit (Vercel/Cloudflare cold-start a build container, run prebuild syncs, build, deploy).

Side effect: every save is a separate commit. The `refresh-feeds` workflow uses `[skip ci]` to avoid loops; we do **not** add `[skip ci]` to Keystatic commits because we want them to deploy.

## Mobile

Concerns flagged, in plain order of risk:

1. **Image uploads from phone camera.** Keystatic accepts file uploads via the browser `<input type="file" accept="image/*">` which on iOS/Android offers a "Take photo" or "Photo library" picker. Works. The image gets uploaded to the repo as a commit, so a 6 MB photo from a modern phone camera commits 6 MB to git. Mitigation: `scripts/optimize-images.ts` exists; we can add a Keystatic post-save hook that runs the optimizer before the commit lands. Phase 3 work.
2. **Drag-and-drop reordering.** Keystatic's list reordering is drag-based. On phones it falls back to up/down arrow buttons but it is slower. Mitigation: not a daily action. Phase 3 polish.
3. **Long-form copy editing.** The admin uses standard `<textarea>` for longtext, which iOS and Android handle fine. The rich text editor for `news.body` will be slower on mobile.
4. **GitHub OAuth on mobile Safari.** Confirmed working. Auth uses standard browser cookies, no popup.
5. **Concurrent edits.** No locking. If you and a future collaborator edit the same record at the same time, the second save fails the merge. Tiny risk for a one-person operation; flagged for awareness.
6. **Slow connection on the road.** Saves are blocked on a successful GitHub commit, so a flaky LTE save can hang. Keystatic surfaces the error and you can retry. No data loss because edits stay in the form.

## Implementation Phases

### Phase 1. Install, config, auth, edit one content type end to end

Goal: prove the loop works. Pick `content/news.ts` since it is currently empty (`news: NewsPost[] = []`), so there is no migration risk.

Tasks:
- Install `@keystatic/core` and `@keystatic/next` (no other new deps).
- Add `keystatic.config.ts` at the repo root with the `news` collection only.
- Add `app/keystatic/[[...params]]/page.tsx` (client component) and `app/api/keystatic/[...params]/route.ts` (if Keystatic requires it; for static export + Keystatic Cloud the route is client-only and we skip the api route).
- Create the Keystatic Cloud project at `keystatic.cloud`, link to this GitHub repo. Add the project ID to `.env.example` (no secret), document in README.
- Migrate `content/news.ts`:
  - Move the (empty) data to `content/news.json` (Keystatic-managed).
  - Rewrite `content/news.ts` as a thin TypeScript shim that imports the JSON and casts to `NewsPost[]`. Components on `/watch` keep their existing `import { news } from "@/content/news"` line unchanged.
- Add `Disallow: /keystatic` to `public/robots.txt` and `noindex` metadata on the admin page.
- Add `.env.example` entries with comments.
- Update README "Deploy" section with one paragraph about the admin.
- Verify locally:
  - `npm run dev` -> open `/keystatic` -> sign in -> create a news entry -> save -> commit lands in branch -> reload `/watch` -> the new entry renders.
  - `npm run build` succeeds (the admin route exports as a client-side shell, no runtime).
  - `npm run lint` and `npm run typecheck` pass.

End-of-phase verification: build, lint, typecheck pass. You test the auth + edit + commit + deploy loop on a non-main branch first to avoid touching production.

### Phase 2. Full schema coverage

Goal: cover every editable surface listed under Content Schema. Each surface gets:
- A Keystatic config entry (singleton or collection).
- A `content/<thing>.json` file (or directory of JSON files for collections).
- A `content/<thing>.ts` shim that preserves the existing import API.

Order of migration, picked to minimize cross-component churn:

1. Singletons first: `watchCopy`, `comediansCopy`, `openMicsCopy`, `shopCopy`, `aboutCopy` + `pillars`, `sponsorships`. Each is short, low-risk.
2. `home` singleton (hero, marquee, bumpers, mission). More complex because of the rotating bumper structure.
3. `site` singleton. Biggest singleton because of nested contact + social.
4. `services` + `pricingTiers` collections.
5. `comedians` collection. Migrate the 23-entry list, preserve image paths.
6. `members` collection (crew). Five entries.
7. `shows` manual collection.
8. `shop` manual collection.
9. `openMics` collection (large: 291 entries, currently in `content/feeds/open-mics.json`).
10. `tiktokVideos` collection (empty, but schema is ready).

Cross-cutting:
- Validation rules from the schema table get implemented as Keystatic field options (`validation.length.min/max`) plus a custom "no em dashes" validator that rejects any string containing `—`.
- Keystatic config gets organized into per-collection files imported into `keystatic.config.ts` for review-ability.

End-of-phase verification: every page renders identically to before (visual smoke test on /, /shows, /open-mics, /watch, /roster, /book, /book/<each-slug>, /shop, /contact). Build, lint, typecheck pass.

### Phase 3. Polish

- **Image uploads.** Wire `scripts/optimize-images.ts` (or a smaller per-file version) into a Keystatic post-save flow so newly uploaded portraits or posters are resized before they land in `public/`. The cheapest way is a GitHub Action that runs on push to any `public/images/**` change and rewrites the file in a follow-up commit. Adds 30 seconds to the deploy but keeps mobile-uploaded photos under control.
- **Previews.** Keystatic supports a "Preview" button per record that opens the production URL with a draft query param. We can add a per-collection preview function that maps records to their public route (`/news/<slug>` -> open in new tab). Since this is static export, the preview shows the last deployed version, not the unsaved one. Document the limitation.
- **Mobile polish.** Verify all forms on iOS Safari and Android Chrome. Pay attention to image upload, date pickers, drag handles. Replace any broken drag UI with up/down arrows.
- **Branded admin styling.** Apply the design tokens (Fraunces for the admin heading, Inter for the rest, hazard yellow for primary buttons). Keystatic exposes a theme override; the brand layer is light.
- **No-em-dash validator surfaced in the UI.** Make sure the inline validation error reads in the house voice: "No em dashes. Use a period or split the sentence." not generic browser error text.
- **Audit.** Confirm every committed file path is `Disallow`ed in `robots.txt` and that `/keystatic` ships with `noindex`.

End-of-phase verification: build, lint, typecheck pass. Manual phone test. PR summary lists every editable surface and what changed.

## Costs and Trade-offs

| Item | Cost |
|---|---|
| Keystatic core library | Free, MIT |
| Keystatic Cloud (auth + commit relay) | Free tier sufficient for this use case. No credit card. |
| GitHub commits | Free for public repos. Repo is currently `KyleMix/stoned_goose_website`. |
| Image storage | Lives in `/public`. No new service. |
| Build minutes | Each save triggers a fresh deploy. Vercel free tier: 6000 build-minutes/month. Cloudflare Pages: 500/month. Netlify: 300/month. A typical Stoned Goose build takes ~2 minutes. So 150 edits/month on Cloudflare's free tier is still under the cap. Heavy editing on Cloudflare could hit the cap; Vercel will not. Flagged but not blocking. |

Trade-offs:

- Each edit is a commit. Git history grows. Mitigation: Keystatic groups field-level edits into one commit per save.
- Content moves from typed `.ts` to JSON. We lose `as const` literal narrowing at the source, but the shim re-casts back to the original types. No call-site breakage.
- Admin auth depends on Keystatic Cloud. If Keystatic Cloud disappears, you can self-host the OAuth proxy (small Node script). The repo content is unaffected. Acceptable single point of failure for an indie site.
- Phone editing is good for text, mediocre for image cropping and reordering. Documented.

## Open Questions

1. **Edit directly to `main`, or via a `content/draft` branch with PR?** Default proposal: commit straight to `main`. Faster, fewer steps. The trade-off is that a typo goes live in ~2 minutes. If you want a "draft and review" loop, the alternative is straightforward.
2. **Where do uploaded images go?** Default proposal: same paths the components already use (`public/images/comedians/`, `public/images/members/`, `public/images/news/`, `public/images/shows/`). Confirm.
3. **Should `content/feeds/open-mics.json` be CMS-editable?** Today the file is owner-supplied via the bulk import (now deleted) and is occasionally hand-edited. The "report a change" dialog already emails edits to you. CMS-editing is convenient but doubles up. Pick one canonical edit path or accept both.
4. **Phase 2 includes `services` migration. Two services currently have literal `TODO: copy needed.` strings.** Do you want the Keystatic editor to surface those entries as "Draft, missing copy" with a warning, or leave the schema agnostic?
5. **Should non-owner collaborators be able to edit later?** Right now access is gated by GitHub push access. Adding a collaborator gives them edit rights. If you ever want read-only previews for a third party, we would need to gate `/keystatic` separately.
6. **Add `Disallow: /keystatic` to `robots.txt` now?** Default yes. The page is `noindex` anyway but defense in depth.
7. **Keystatic admin URL: `/keystatic` or `/admin`?** Default proposal: `/keystatic`. Easy to remember, signals what it is. `/admin` is more conventional but less informative.
8. **Build-time validation: run a `no em dashes` check on commit?** Optional: a small CI step that greps committed content for `—` and fails the build. Belt-and-suspenders on top of the Keystatic field validation.
9. **Manual vs synced data.** The `shows.ts`, `shop.ts`, and `patreonPosts` modules already fall back to `manualShows` etc. when `.generated/*.json` is empty. The CMS-managed JSON should sit in the same fallback slot. Confirm that is the intended semantics.
10. **Phone editing target.** Is the dominant phone use case "fix a typo while standing in line" (text-only edits, no images), or also "post a new show with a flyer"? Affects how much time we sink into Phase 3 image polish.
