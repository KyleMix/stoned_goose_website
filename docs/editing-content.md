# Editing content

> **Start here instead:** [`CMS_GUIDE.md`](../CMS_GUIDE.md) at the repo root is the
> current, maintained editor guide. This page is kept for extra detail but may
> lag behind the config.

Everything copy-shaped on the site is edited through Sveltia CMS at `/admin`.
Sign in with the GitHub account that has push access to this repo; each save
commits to `main` and the host auto-deploys in a minute or two.

## The fast path

Open the live page you want to change. Add `?edit=1` to the URL once. A
small "Edit" dock pins itself to the bottom-right corner and links to the
exact CMS surfaces backing that page. The preference is sticky in
`localStorage`, so it stays on until you load any page with `?edit=0`.

The overlay is rendered for everyone (no server auth on a static site),
but every link inside it lands in the CMS, which only commits for users
with push access to the repo.

## Page → admin map

| Live page | Admin surfaces |
|---|---|
| `/` | Home page (singleton), Site config (singleton) |
| `/shows` | Shows copy (singleton), Shows manual (collection) |
| `/watch` | Watch copy (singleton), News posts (collection), TikTok videos (collection) |
| `/roster` | Roster copy (singleton), Comedians (collection), Crew members (collection) |
| `/open-mics` | Open mics copy (singleton), Open mics (collection) |
| `/shop` | Shop copy (singleton), Shop products (collection) |
| `/contact` | Contact page (singleton), Site config (for email / phone) |
| `/book` | Services (collection), Pricing tiers (collection), Sponsorships (singleton) |
| `/book/<slug>` | The matching Services item |
| Nav / footer / brand | Site config (singleton) |

## What lives where on disk

The CMS writes JSON; thin TypeScript shims in `content/*.ts` re-export
that JSON with the typed shape components import. You almost never edit
the JSON directly. Files to know about:

- `content/site/index.json` ← `Site config`
- `content/home/index.json` ← `Home page`
- `content/shows-copy/index.json`, `content/watch-copy/index.json`,
  `content/roster-copy/index.json`, `content/open-mics-copy/index.json`,
  `content/shop-copy/index.json`, `content/contact-copy/index.json`,
  `content/sponsorships/index.json` ← matching singletons
- `content/comedians/<slug>/index.json`, `content/members/<slug>/index.json`,
  `content/services/<slug>/index.json`, `content/pricing-tiers/<slug>/index.json`,
  `content/shows/<slug>/index.json`, `content/shop-products/<slug>/index.json`,
  `content/open-mics/<slug>/index.json`,
  `content/tiktok/<slug>/index.json` ← collection items
- `content/news/<slug>/index.mdoc` ← news posts (markdown body + frontmatter)

The shims in `content/*.ts` (e.g. `home.ts`, `site.ts`) wrap each file
with the typed shape components have always imported. Don't move data
out of these locations or the shims break.

## House rules the admin enforces

- No em dashes anywhere. Every long-form text field validates against the
  em-dash codepoint and refuses to save.
- Length caps on `summary`, `meta description`, etc. The form turns red
  before commit, not after.
- Booleans default `false` for `draft`, so a new comedian/service/show
  ships live unless you tick the box.

## When the admin can't help

- Generated feeds (Instagram, Facebook, shows-from-Eventbrite,
  Patreon, Fourthwall, Open Mics) live in `content/.generated/` and
  `content/feeds/`. They're rewritten by scripts under `scripts/`. The
  admin doesn't touch them. Run `npm run sync` (or the relevant
  `feeds:*` / `sync:*` script) to refresh.
- Image uploads go through the CMS, then a GitHub Action
  (`.github/workflows/optimize-images.yml`) auto-resizes them. Just pick
  the file; the action handles the rest.
- Truly new shapes (a brand-new collection, a new field type) are a config
  change in `public/admin/config.yml`. Add the field, run a build to confirm
  the shim still types, commit.
