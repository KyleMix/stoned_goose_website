# Stoned Goose Productions

Source for [stonedgooseproductions.com](https://www.stonedgooseproductions.com).

> Black-and-white editorial. Stoner haze. Late-night cable-bumper energy. Built clean.

## Stack

- **Next.js 15** App Router + React 18 + TypeScript (strict)
- **Tailwind CSS v3**, custom tokens (`ink`, `bone`, `hazard`, `haze`)
- **Framer Motion** for atmospheric motion
- **Static export** (`output: "export"`). Output is `/out`. No server.
- No CMS. Content lives in typed TS files under `/content`.

## Setup

Requires Node 20+.

```bash
npm install
npm run dev
```

Dev server runs at http://localhost:3000.

## Scripts

```bash
npm run dev        # local dev
npm run build      # static export to /out
npm run lint       # next lint
npm run typecheck  # tsc --noEmit
```

`build` and `lint` must pass before any commit.

## Deploy

### Vercel
Push to a connected branch. Vercel reads `next.config.mjs` and ships the static export. `vercel.json` handles old-slug redirects and OG image MIME headers.

### Cloudflare Pages
- Build command: `npm run build`
- Build output directory: `out`
- Node: `20`
- Old-slug redirects via `public/_redirects`. OG image MIME via `public/_headers`.

### Netlify
- Build command: `npm run build`
- Publish directory: `out`
- Same `_redirects` / `_headers` files as Cloudflare.

If the host honors none of those (rare), the meta-refresh stubs in `public/<old-slug>/index.html` still bounce visitors from old URLs to the new ones.

## Repo layout

```
app/                  # App Router routes
  layout.tsx          # Shell: nav, footer, fonts, grain, JSON-LD, optional Plausible
  page.tsx            # Home
  sitemap.ts          # /sitemap.xml at build
  members/, comedians/, shows/, watch/, services/, services/[slug]/,
  shop/, sponsor/, submit/, contact/, not-found.tsx
  <route>/opengraph-image.tsx  # per-route OG card (templated)
components/           # Reusable React components
  hero.tsx, nav.tsx, footer.tsx, marquee.tsx, grain.tsx, page-header.tsx,
  bumper.tsx, rotating-bumper.tsx, reel-card.tsx, contact-form.tsx, form-field.tsx,
  services-overview.tsx, upcoming-shows-block.tsx, section-header.tsx
content/              # Typed content (single source of truth)
  site.ts             # Brand, contact, social, nav
  home.ts             # Hero, marquee, services list, bumper alternates, mission slot
  members.ts          # Crew + pillars (bio field optional)
  comedians.ts        # Roster + clarifying subhead
  shows.ts            # Featured special + upcomingShows
  watch.ts            # Reels + optional youtubeVideos
  services.ts         # 5 service detail pages + tiers
  shop.ts             # Fourthwall product list
  sponsorships.ts     # Tiers + stats
lib/
  og-template.tsx     # Shared ImageResponse for per-route OG cards
public/               # Static assets
  favicon.png, opengraph.jpg
  robots.txt          # Points at /sitemap.xml
  _redirects          # Cloudflare/Netlify redirects
  _headers            # Force image/png on extensionless OG routes
  sponsorship-one-sheet.txt
  <old-slug>/index.html   # Meta-refresh fallback for /about, /media, etc
  images/members/, images/comedians/, images/media/
vercel.json           # Vercel-only redirects + OG headers
docs/
  content-inventory.md       # Old-site copy archive
  interaction-motion-plan.md # Motion brief
AUDIT.md              # Site audit driving site/audit-fixes
SPEC.md               # Interview decisions
IMPLEMENTATION.md     # Phase A-D plan
CLAUDE.md             # House rules
```

## Design system

- **Color**: ink `#0A0A0A`, bone `#EFE9DD`, hazard `#F2EA00`. Hazard is the one accent. Periods, primary CTAs, hover states, and the rare phrase that earns it.
- **Type**: Fraunces (display, italic emphasis), Inter (body), JetBrains Mono (UI/eyebrows). Three families. No others.
- **Texture**: SVG grain overlay site-wide (`<Grain />`), halftone treatment on imagery via CSS, optional CRT scanlines on hero. No PNG masks.
- **Motion**: slow, atmospheric, deliberate. `prefers-reduced-motion` honored globally.

## Editing content

All copy lives in `/content/*.ts`. Edit the file, save, push. No CMS, no template hunting.

### Owner-pending content (flagged in source)

These fields ship empty or with TODO markers. Drop in real content to light them up.

| File | Field | What it does |
|---|---|---|
| `content/shows.ts` | `featuredSpecial.videoUrl` | When set, swaps "Coming soon" on `/shows` and `/watch` for the play CTA. |
| `content/members.ts` | `members[].bio` | Renders a 2-3 sentence bio under the role on `/members`. |
| `content/home.ts` | `mission` | When set, shows a mission strip between bumpers on home. |
| `content/home.ts` | `marqueeWords` | Verify or replace `5,000+ Tickets Sold`. House rule: no invented stats. |
| `content/home.ts` | `bumpers.*` | Three slot pools, three drafts each. Edit copy in place. |
| `content/home.ts` | `hero.italicLine` | Hero right-column italic. Owner-editable. |
| `content/comedians.ts` | `comediansCopy.subhead` | "Our Friends." clarifier. Edit if a different framing fits better. |
| `content/watch.ts` | `youtubeVideos` | When populated, renders a YouTube grid section above the channel block. |
| `content/shop.ts` | `products[].image` | 15 products with `image: ""` are hidden from `/shop`. Paste Fourthwall imgproxy URLs to restore. |
| `content/sponsorships.ts` | `sponsorshipStats[].value` | Three values flagged with TODO(owner). Confirm or replace. |

## Environment variables

```bash
# Optional. Set to your Plausible domain to enable analytics.
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=stonedgooseproductions.com
```

Unset = no analytics ship. See `.env.example` for the rest.

## Forms

All forms route through `components/contact-form.tsx`, which posts to `formsubmit.co/ajax/${site.contact.email}`. A hidden `_honey` field acts as the spam honeypot.

## Lighthouse

Run locally on the static export.

```bash
npm run build
npx serve out -p 4173
# in another shell
npx lighthouse http://localhost:4173/                                --only-categories=performance,accessibility,best-practices,seo --view
npx lighthouse http://localhost:4173/shows --only-categories=performance,accessibility,best-practices,seo --view
npx lighthouse http://localhost:4173/services --only-categories=performance,accessibility,best-practices,seo --view
npx lighthouse http://localhost:4173/watch --only-categories=performance,accessibility,best-practices,seo --view
npx lighthouse http://localhost:4173/shop --only-categories=performance,accessibility,best-practices,seo --view
```

Targets: 90+ across Performance, Accessibility, Best Practices, SEO.

Log results below as scores land.

| Route | Performance | Accessibility | Best Practices | SEO | Run date |
|---|---|---|---|---|---|
| `/` | TBD | TBD | TBD | TBD | TBD |
| `/shows` | TBD | TBD | TBD | TBD | TBD |
| `/services` | TBD | TBD | TBD | TBD | TBD |
| `/watch` | TBD | TBD | TBD | TBD | TBD |
| `/shop` | TBD | TBD | TBD | TBD | TBD |

> Lighthouse runs require a Chromium binary, which the build container does
> not ship. Run locally before sign-off using the commands above, or paste
> scores from a deployed preview (Vercel/Cloudflare). Don't merge without a
> row populated.

### Latest static-export verification (2026-04-27)

Run from the build container against `npm run build` output served by `npx serve out`.

- `npm run build` — green, 33 routes generated (10 pages + 5 service slugs + 10 OG cards + 8 service slug variants).
- `npm run lint` — green, zero warnings.
- `npm run typecheck` — green.
- Smoke checks via `curl`:
  - `/`, `/shows`, `/services`, `/watch`, `/shop`, `/sitemap.xml` all 200.
  - Per-route `/<path>/opengraph-image` 200 with PNG response.
  - `out/about/index.html` ships meta-refresh to `/members/`; `out/_redirects`
    ships 308s for all five legacy slugs.
  - Layout `LocalBusiness` JSON-LD present on every page.
  - `Service` + `BreadcrumbList` JSON-LD present on `/services/<slug>`.
  - `Event` JSON-LD scaffolded on `/shows`, currently empty (no shows on calendar).
- `out/sitemap.xml` enumerates 15 URLs (10 statics + 5 service slugs).

## Project docs

- `AUDIT.md`: snapshot audit driving the `site/audit-fixes` branch.
- `SPEC.md`: interview decisions captured before implementation.
- `IMPLEMENTATION.md`: phased plan (A quick wins, B content, C UX, D polish).
- `CLAUDE.md`: house rules.
