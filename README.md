# Stoned Goose Productions

A full rebuild of [stonedgooseproductions.com](https://www.stonedgooseproductions.com), redesigned from scratch.

> Black-and-white editorial. Stoner haze. Late-night cable-bumper energy. Built clean.

## Stack

- **Next.js 15** (App Router) + React 18 + TypeScript
- **Tailwind CSS v3** for styling
- **Framer Motion** for atmospheric motion
- **Static export** (`output: "export"`) — deployable to Vercel, Cloudflare Pages, Netlify, or any static host
- No CMS. Content lives in typed TS files under `/content`.

## Setup

Requires Node 20+.

```bash
npm install
npm run dev
```

Dev server runs on http://localhost:3000.

## Build

```bash
npm run build
```

The static export lands in `/out`. Drop it on any static host.

## Deploy

### Vercel
Push to a connected branch. Vercel reads `next.config.mjs` and ships the static export automatically.

### Cloudflare Pages
- Build command: `npm run build`
- Build output directory: `out`
- Node version: `20`

### Netlify
- Build command: `npm run build`
- Publish directory: `out`

## Repo layout

```
app/                  # App Router routes
  layout.tsx          # Shell: nav, footer, fonts, grain, JSON-LD
  page.tsx            # Home
  members/page.tsx    # Crew + pillars
  shows/, watch/, comedians/, services/, shop/, contact/, sponsor/, submit/
  globals.css         # Tailwind base + utilities (halftone, blob, scanlines)
  not-found.tsx
components/           # Reusable React components
  nav.tsx
  footer.tsx
  hero.tsx
  marquee.tsx
  grain.tsx
  testimonials.tsx
  ...
content/              # Typed content files (single source of truth)
  site.ts             # Brand info, contact, social, navigation
  home.ts             # Home-page copy + structured blocks
  members.ts          # 5-person crew + 4 pillars + about copy
public/               # Static assets
  covervideo.mp4
  favicon.png
  opengraph.jpg
  images/members/     # 5 portraits
  images/comedians/   # 22 headshots
  images/media/       # Reel thumbnails
docs/
  content-inventory.md       # Source of truth: every piece of copy from old site
  interaction-motion-plan.md # Motion brief
```

## Design system

- **Color**: ink `#0A0A0A`, bone `#EFE9DD`, hazard `#F2EA00` (single accent, used sparingly)
- **Type**: Fraunces (display, italic emphasis), Inter (body), JetBrains Mono (UI/eyebrows)
- **Texture**: SVG grain overlay site-wide (`<Grain />`); halftone treatment on imagery; optional CRT scanlines on hero elements
- **Motion**: slow, atmospheric, deliberate. Marquee on home. `prefers-reduced-motion` respected globally via `app/globals.css`.

## Editing content

Copy lives in `/content/*.ts`. To change a headline or member, edit the file. No CMS.

To swap the hero video, replace `public/covervideo.mp4` with a new MP4 of the same name.

## Lighthouse

Run locally after `npm run build && npx serve out`:

```bash
npx lighthouse http://localhost:3000 --view
```

Targets: 90+ across Performance, Accessibility, Best Practices, SEO.

## Status

This branch (`claude/redesign-sgp-website-M6txS`) is the **direction-review milestone**:

- Home page — full fidelity
- Members page — full fidelity (bios flagged for content review)
- Shows / Comedians / Watch / Services / Shop / Contact / Sponsor / Submit — placeholder routes pending direction approval

See `docs/content-inventory.md` for the full content audit of the live site.
