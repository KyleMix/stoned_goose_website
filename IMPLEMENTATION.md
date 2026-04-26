# IMPLEMENTATION — site/audit-fixes

Driven by AUDIT.md issues + SPEC.md decisions. Phases run in order. Each phase ends with `npm run build` + `npm run lint` green and a single descriptive commit.

## Phase A — Quick wins

Low risk, high payoff. None of these need new copy from the owner.

| # | Files | Change | Verify |
|---|---|---|---|
| A1 | `public/covervideo.mp4` | Delete the file. | `git status` shows deletion; `npm run build` passes; export size drops. |
| A2 | `public/images/misc/logo.png`, `stage.png`, `ogImage.png` | Delete all three (none referenced). | `grep -r "misc/" app components content` returns empty; build passes. |
| A3 | `components/contact-form.tsx` | Add a hidden honeypot input named `_honey`. Submit logic stays; formsubmit drops messages where `_honey` is non-empty. | Inspect form HTML for hidden field; manually submit on dev server; bot field reachable only via DOM. |
| A4 | `app/sitemap.ts` (new), `public/robots.txt` (verify) | Export a `MetadataRoute.Sitemap` listing all 18 routes. Confirm robots.txt sitemap URL still resolves. | Build, then `cat out/sitemap.xml` shows all routes. |
| A5 | `app/layout.tsx`, `.env.example` | Add Plausible script gated on `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. No-op if unset. Document the env var in `.env.example`. | Build with var unset: no script tag. With var set: script tag present in `<head>`. |
| A6 | `content/shop.ts`, `app/shop/page.tsx` | Filter to products with non-empty `image` strings. Add a `TODO(owner): paste Fourthwall image URL` note above each empty entry. Imageless products do not render until URLs land. | `/shop` renders 3 products today; reappear when image strings populate. |
| A7 | `vercel.json` (new), `public/_redirects` (new), `public/<old-slug>/index.html` (5 stubs) | Implement the redirect map three ways: `vercel.json` 308s, Cloudflare/Netlify `_redirects` file, static meta-refresh HTML at `/about`, `/media`, `/comic-submissions`, `/sponsorships`, `/book-a-show`. | Build, open `out/about/index.html` in a browser, confirm meta-refresh fires to `/members`. |

Commit message: `Phase A: quick wins (asset cleanup, honeypot, sitemap, analytics, redirects)`

## Phase B — Content holes

Mostly content-file edits. Owner-pending fields are scaffolded as optional and render only when populated.

| # | Files | Change | Verify |
|---|---|---|---|
| B1 | `content/shows.ts`, `app/shows/page.tsx`, `app/watch/page.tsx`, any featured-special component | When `featuredSpecial.videoUrl === null`, replace hazard play overlay with neutral "Coming soon" label; strip click target. When non-null, restore play CTA + open YouTube embed modal. | `/shows` and `/watch`: poster intact, no broken click. Setting `videoUrl` to a real URL re-enables modal. |
| B2 | `content/members.ts`, `app/members/page.tsx` | Add `bio?: string` to `Member` type. Render bio paragraph under role when present. Field empty until owner provides. | Members page unchanged today; bios render when copy lands. |
| B3 | `content/comedians.ts`, `app/comedians/page.tsx` | Add `subhead` field with the SPEC draft line. Render under "Our Friends.". | `/comedians` shows new subhead. |
| B4 | `content/home.ts`, `app/page.tsx` | Add optional `mission` block (`eyebrow`, `heading`, `body`). Render between bumpers only when `mission` is populated. Owner provides copy later. | Home page unchanged today; mission strip appears when copy lands. |
| B5 | `content/home.ts`, `components/bumper.tsx` (or wherever bumpers are rendered), `app/page.tsx` | Convert each bumper slot to an array of alternates (3 each, owner-editable). Pick one per session client-side using a session-stable seed (no flicker on rerender). | First load picks one of three; full reload may pick a different one. SSR + hydration stable (no mismatch). |
| B6 | `components/hero.tsx`, `content/home.ts` | Drop hardcoded `live. local. comedy.` Move tagline reference to content; pick one of the existing marquee phrases for the hero right column, or collapse to single column. | `/` hero shows new italic line; marquee unaffected. |
| B7 | `content/watch.ts`, `app/watch/page.tsx` | Add optional `youtubeVideos: { id, title, poster }[]` array. Render a 3-up grid of YouTube videos when populated. Empty until owner provides URLs. | `/watch` unchanged today; grid appears when array populates. |
| B8 | `content/sponsorships.ts`, `public/sponsorship-one-sheet.txt` | Add comment marking the three stats lines for owner update. No values change yet. | Page renders identically; comments visible only in source. |

Commit message: `Phase B: content scaffolds (bios, mission, bumper rotation, hero dedupe, watch grid)`

## Phase C — UX upgrades

| # | Files | Change | Verify |
|---|---|---|---|
| C1 | `components/og-card.tsx` (new), `app/opengraph-image.tsx` (new) + per-route `app/<route>/opengraph-image.tsx` | Implement an `ImageResponse`-based OG generator using the `[Page].` template (Fraunces display on ink, hazard period, mono eyebrow, wordmark corner). One per route. Compatible with `output: "export"` (Next pre-renders at build time). | Build: each `opengraph-image-*.png` lands in `/out`. Inspect in `<head>` of each route. |
| C2 | `app/<route>/page.tsx` (each route) | Add per-route `metadata.title` + `metadata.description`. Tighten OpenGraph + Twitter cards per route. | `view-source:` on each built HTML shows route-specific tags. |
| C3 | `app/services/[slug]/page.tsx`, `app/shows/page.tsx` | Add `Service` JSON-LD on each service detail page; add `Event` JSON-LD on each upcoming show entry (only renders when `upcomingShows` populates). | Validate via Google's Rich Results test on a built page. |
| C4 | `app/watch/page.tsx`, `content/watch.ts`, possibly `components/reel-card.tsx` (new) | Replace external-link reel cards with click-to-load embeds: poster + hazard play; click swaps in the Instagram iframe. Lazy by design; no third-party JS until interaction. | `/watch` reels open inline in modal/iframe; no external nav. |
| C5 | `next.config.mjs`, shop product cards | Add `images.remotePatterns` for `imgproxy.fourthwall.com`. Replace raw `<img>` with `next/image` in shop cards. | `npm run lint` no longer warns; images render via Next pipeline (`unoptimized: true` global). |

Commit message: `Phase C: per-page OG, structured data, inline reels, next/image migration`

## Phase D — Polish

| # | Files | Change | Verify |
|---|---|---|---|
| D1 | `README.md` | Run Lighthouse on `npm run build && npx serve out` against `/`, `/shows`, `/services`, `/watch`, `/shop`. Log scores in a Lighthouse table. | Five rows committed in README; targets ≥90 across categories. |
| D2 | `package.json`, source tree | Final lint + typecheck pass; remove any incidentally orphaned imports. | `npm run lint`, `npm run typecheck` both clean. |
| D3 | dev server | Manual click-through: nav links on every page, every form submission (success path), every CTA destination, halftone treatment intact, hazard restraint preserved. | Recorded in PR / final summary message. |

Commit message: `Phase D: polish (Lighthouse logged, lint/typecheck clean, click-through)`

## Out of scope (per SPEC.md)

- New `/about` route — superseded by mission strip on home.
- Testimonials / stats band reintroduction on home — owner did not request.
- covervideo.mp4 reuse — file deleted in A1.
- Member bio drafting — owner writes; this branch only ships the field.
- YouTube channel video URLs — owner provides; this branch only ships the array shape.
- Updated sponsor stat numbers — owner provides; this branch flags the lines.

## Decisions deferred to follow-up

- Bumper alternates copy needs owner approval before final commit (B5).
- Hero italic right-column replacement phrase needs owner sign-off (B6).
- `/comedians` subhead final wording (B3) — draft in SPEC.md; owner can edit content file.
- Analytics: defaulting to Plausible env-gated. Swap to Vercel Analytics if/when hosting decision lands on Vercel.
