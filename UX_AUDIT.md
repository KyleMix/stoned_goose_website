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
| --- | --- | --- |
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

## Phase 2, Audit findings

Severity: **critical** breaks the page or blocks a flow, **high** breaks
a meaningful interaction or fails WCAG 2.2 AA, **medium** is a friction
or inconsistency, **low** is polish.

### A11y

- **[high] Mobile menu overlay is keyboard-reachable when closed.**
  `components/nav.tsx:89-95`. The overlay div hides via three Tailwind
  utilities together (`pointer-events-none`, `opacity-0`, and a
  `clip-path` inset). Mouse is blocked but Tab still lands on the nav
  links inside. Needs `inert` while closed so focus skips the hidden
  tree.
  Resolved in this commit: added `inert` (when closed) and `aria-hidden`
  to the mobile overlay container.
- **[high] Marquee doubled track is read aloud doubled.**
  `components/marquee.tsx:14-15,32-43`. The marquee renders
  `[...items, ...items]` for a seamless loop, then maps the doubled
  list to visible spans. Screen readers announce every item twice. The
  marquee is decorative; the section needs `aria-hidden="true"`.
  Resolved in this commit: `aria-hidden` added on the marquee root.
- **[medium] Mobile hamburger button is 40x40, under the 44x44 WCAG 2.2
  AA tap target minimum (2.5.8).**
  `components/nav.tsx:90`. Bump to 44x44 without changing the icon.
  Resolved in this commit: `h-10 w-10` -> `h-11 w-11` on the hamburger.
- **[medium] No live region announces form success or error.**
  `components/contact-form.tsx:164-173`. The success/error paragraphs
  use `role="status"` and `role="alert"` correctly, but they live
  inside the same flex row as the submit button, so on a small viewport
  the message can land below the fold after submit. Worth a small
  `aria-live="polite"` wrapper higher in the form so the announcement
  is not also a layout-shift surprise.
  Skip-with-reason: revisited the code path. The existing
  `role="status"` (implicit `aria-live="polite"`) and `role="alert"`
  (implicit `aria-live="assertive"`) ARE the live regions, and they
  fire on the visible message that sits next to the submit button the
  user just clicked, so they are also in viewport. React-hook-form's
  `shouldFocusError: true` default also handles validation-failure
  focus. No action this pass; flagged as a follow-up if user-testing
  surfaces a real announcement gap.
- **[medium] Empty `<span aria-hidden>` on the bumper bug uses the
  bracketed `[ stoned goose ]` glyphs as a brand watermark.**
  `components/bumper.tsx:62-65`. This is intentional decoration; not
  a finding to fix, just confirming it's a deliberate skip.

### Visual consistency

- **[medium] Em dash literal as placeholder in sponsor stats.**
  `app/sponsor/page.tsx:40`. House rule (CLAUDE.md) says "no em dashes
  anywhere." Renders as `—` for missing stats. Replace with a glyph
  that fits the editorial register, e.g. ` // ` or `TBD` in mono.
  Resolved in this commit: replaced the em dash with a smaller `TBD`
  in mono, dimmed (bone/35) to read as a placeholder rather than a
  number. Sponsor owner has confirmed the existing values are
  placeholders awaiting refresh (per SPEC.md), so the visual delta
  signals the same thing: "real number going here."

### Forms / microcopy

- **[medium] "Or just email us ↗" links to `/contact`, not a mailto.**
  `components/services-overview.tsx:57-62`. The copy implies a mail
  client will open. Either change href to `mailto:` or rename to
  "Or just contact us ↗". The `/contact` page has the email link as a
  display element, so the existing destination is functional but the
  microcopy is misleading.
  Resolved in this commit: copy updated to "Or just contact us ↗" so
  the destination matches the promise. The `/contact` page itself
  exposes a real `mailto:` link as the first thing in the column, so
  email is still one click further if the user wants it.
- **[low] Phone field on `/submit` could hint a numeric keypad on
  mobile.**
  `app/submit/page.tsx:105-112`. `type="tel"` already triggers the
  phone keypad, so this is moot. Confirmed no fix needed.

### Performance / static

- **[low] `framer-motion` is declared in dependencies but never
  imported.** `package.json:38` ("framer-motion": "^11.11.17"). Search
  across `app/` and `components/` returns zero imports. The motion
  effects ship as Tailwind classes + CSS transitions. Removing it cuts
  one transitive tree from `node_modules`. Won't change ship size
  (already tree-shaken away) but reduces install + lockfile churn.
  Resolved in this commit: `npm uninstall framer-motion`. Build, lint,
  typecheck stay green; no imports anywhere referenced it.

### Trust / polish

- **[low] Marquee does not pause on hover.** `components/marquee.tsx`.
  Editorial choice; some users would expect to pause-to-read. Adding
  `hover:[animation-play-state:paused]` is a one-line nicety. Confirm
  with brand voice before merging — pause-on-hover may be off-brand
  for the cable-bumper energy.

### Skipped (with reason)

- **Bumper `aria-hidden`** removes the editorial cards from the
  accessibility tree. Bumpers are modeled on Adult Swim cable bumpers,
  which are visual gags by design (CLAUDE.md "Adult Swim register"
  rule). AT users get a meaningful pause, sighted users get the joke.
  Leave as-is.
- **`/comedians` and `/members` halftone-only on mobile.** Already
  documented in `app/members/page.tsx:113-115`. Tap-to-toggle would
  compete with reading the bio inline.
- **Selection / focus colors using hazard yellow** are restrained to
  the brand's one accent. Not a contrast issue; the focus ring sits
  on bone or ink with sufficient lightness delta.
- **Footer email + phone already link to `mailto:` and `tel:` on the
  contact page** (`app/contact/page.tsx:33,44`). Footer renders the
  same strings as plain text, but the contact page is one click away
  from every footer column. Adding tel/mailto in the footer would also
  be reasonable; flagging as a follow-up rather than this pass to keep
  the footer changes diff small.

## Pass summary

### Shipped

| Severity | Area | Commit | One-line |
| --- | --- | --- | --- |
| high | nav | `e546ee9` | mobile menu overlay marked `inert` + `aria-hidden` while closed so Tab no longer lands on hidden links |
| high | marquee | `a86a7cd` | decorative doubled-track ticker `aria-hidden` so AT does not announce every word twice |
| medium | nav | `29bfd00` | hamburger button bumped 40x40 -> 44x44 to clear WCAG 2.2 SC 2.5.8 |
| medium | sponsor | `608726c` | em dash literal stat placeholder replaced with mono `TBD` (CLAUDE.md house rule) |
| medium | services-overview | `7f5097b` | "Or just email us" CTA renamed to "Or just contact us" so copy matches the destination |
| low | deps | `2f4ec11` | `framer-motion` uninstalled (unused, ship size unaffected) |

### Skipped this pass

- **Form aria-live region** (medium): existing `role="status"` and
  `role="alert"` are already correct live regions, and react-hook-form's
  `shouldFocusError: true` default handles validation-failure focus.
  Real announcement gap not demonstrated. Keep watching.
- **Bumper `aria-hidden`** stays. The cable-bumper jokes are visual
  gags by design (CLAUDE.md "Adult Swim register"). AT users get a
  meaningful pause; the headlines and CTAs around the bumpers carry
  the load.
- **`/comedians` and `/members` halftone-only on mobile** stays.
  Tap-to-toggle would compete with reading the bio inline; documented
  in `app/members/page.tsx:113-115`.
- **Marquee pause-on-hover**: brand-voice question. The cable-bumper
  energy reads as "always on." Owner call before adding.

### Follow-ups worth a second pass

- **Footer phone + email as real `tel:` / `mailto:` links.** The
  contact page already exposes them as such, but every footer column
  carries the same strings as plain text. Click-to-call from the
  footer is a real mobile usability win; held back this pass to keep
  the footer change small. (low / medium effort)
- **Form success state could be more decisive on long forms** (sponsor
  inquiry, comic submission). Current pattern: form fields clear, a
  small status message appears next to the submit button. Replacing
  the form with a success card would be a stronger "you're done"
  signal, but adds component-level state and risks losing the user's
  retry path on an accidental dismissal. Deferred until real user
  feedback says it is needed.
- **Bundle: split heavy client components into islands.** Hero, nav,
  footer all hydrate as full client components because of small
  `track()` calls in `onClick` handlers. Extracting the click
  trackers into thin client islands would let the visible chrome
  ship as server components. Out of scope for an a11y/UX pass; would
  net real TBT savings on a future perf-focused PR.
- **Lighthouse CI flagged a `color-contrast` violation on `/`** during
  the perf-followup PR (#104) audit. Likely the bone/45 mono micro
  text on grain. Worth a focused contrast pass. Not a UX-pass blocker;
  CI Accessibility category still scored 0.96.
