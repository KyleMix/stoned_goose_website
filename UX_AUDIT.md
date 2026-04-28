# UX Audit, Stoned Goose Productions site

Branch: `claude/ux-audit-001`. Audit + implementation pass against the
running codebase as of 2026-04-28.

## Phase 1, Stack + surfaces

### Stack

- **Framework**: Next.js 15 App Router + React 18 + TypeScript strict.
- **Package manager**: npm (lockfile pinned, husky + lint-staged in place).
- **Build**: `next build` with `output: "export"` to `/out`. Static-only,
  no server runtime. Three host targets: Vercel, Cloudflare Pages,
  Netlify (`vercel.json`, `_redirects`, `_headers` all present).
- **Routing**: file-based App Router under `app/`. Per-route
  `opengraph-image.tsx` files render share cards via `next/og` at build.
- **State**: no global store. Content is the source of truth in typed
  TS modules under `content/*.ts`. Per-component local state via
  `useState`/`useEffect` only (sessionStorage-seeded bumper rotation,
  scroll listener on nav, form state in react-hook-form).
- **Styling**: Tailwind CSS v3 with custom tokens in `tailwind.config.ts`
  (`ink #0A0A0A`, `bone #EFE9DD`, `hazard #F2EA00`, `haze.50` through
  `haze.500`). Global CSS in `app/globals.css` (halftone, scanlines,
  baseline focus, smooth scroll, scroll-margin-top var, selection).
- **Component library**: hand-rolled. `@radix-ui/react-dialog` for
  the featured-special-player and the add-to-calendar dialog. No other
  primitives library.
- **Forms**: `react-hook-form` + `zod` via `@hookform/resolvers`,
  schemas in `lib/form-schemas.ts`. Posts go to `formsubmit.co/ajax/`
  (no server). Honeypot field on every form.
- **Motion**: `framer-motion` is in `package.json` dependencies but is
  not actually imported anywhere in `app/` or `components/`. Motion
  effects ship as CSS transitions + Tailwind `motion-reduce:` utilities.
- **Analytics**: Plausible only when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is
  set, defer-loaded. No third-party trackers. No tag manager.
- **Build-time data feeds**: `scripts/sync-*` (Eventbrite, Fourthwall,
  Patreon, Facebook events) and `scripts/feeds/fetch-*` (Instagram,
  YouTube, Facebook). Runtime is offline once built.

### User-facing surfaces

| Path | Type | Notes |
|---|---|---|
| `/` | home | hero, marquee, 3x rotating bumpers, upcoming shows block, services overview, instagram strip, press strip (empty), mission slot (empty), mailing list capture |
| `/shows` | static | featured special player, upcoming shows from Eventbrite feed, mailing list capture |
| `/watch` | static | featured special, reels grid, YouTube grid, IG/FB feeds, TikTok cards, mailing list capture |
| `/comedians` | static | 22-portrait roster grid, "work with us" CTA |
| `/members` | static | 4 pillars, 5-portrait crew list, recruiting CTA |
| `/services` | static | 5 service cards, sticky quote rail, mailing list capture |
| `/services/[slug]` | SSG x5 | per-service detail with Process, FAQ, Tiers, quote form |
| `/shop` | static | Fourthwall product cards (filtered by image present) |
| `/sponsor` | static | tiers, stats, sponsor inquiry form |
| `/submit` | static | comic submission form |
| `/contact` | static | contact form, click-to-call, click-to-SMS, optional WhatsApp |
| `/not-found` | catch-all | "Lost." 404 with halftoned mark + 3 path-aware suggestions |
| `/sitemap.xml` | static | enumerates all routes |
| `/<slug>/opengraph-image` | static x10 | per-route OG card with corner mark |
| `/about`, `/media`, `/comic-submissions`, `/sponsorships`, `/book-a-show` | redirect stubs | meta-refresh fallback + `_redirects` + `vercel.json` for legacy slugs |

### Key flows

1. **Booking**: home hero CTA -> `/services` -> `[slug]` detail ->
   inline quote form (or sticky rail "Get a quote") -> formsubmit ->
   success message in-form, owner gets email.
2. **Sponsorship**: nav -> `/sponsor` -> tiers + stats -> sponsor form
   -> formsubmit.
3. **Comic submission**: `/comedians` "Submit to the roster" CTA ->
   `/submit` -> form -> formsubmit.
4. **Contact**: any nav/footer "Contact" -> `/contact` -> form +
   tel/sms/email links -> formsubmit (form path).
5. **Mailing list**: on `/`, `/shows`, `/watch` -> bottom-of-page
   single-input form -> formsubmit (`Mailing list / <page>` subject).
6. **Tickets / show discovery**: home -> "Browse Shows" -> `/shows` ->
   Eventbrite outbound or per-show .ics download.

### Out-of-scope for this audit

- The three host config files (`vercel.json`, `_redirects`, `_headers`):
  recently audited and verified intact in PR #103.
- Build-time content sync scripts (`scripts/sync-*`, `scripts/feeds/*`):
  not user-facing.
- Brand asset generation (`scripts/brand/generate-brand-assets.ts`):
  recently added in PR #103.
- Image optimization script (`scripts/images/optimize-content-images.ts`):
  recently added in PR #104.
