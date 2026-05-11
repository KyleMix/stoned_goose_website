# Repo Audit Plan

Audit window: claude/reorganize-website-structure-eICHh @ 97efbe8. Scope is the live repo at /workspaces/stoned_goose_website. Build was not run for this pass. Findings that need a build or browser to confirm are flagged inline.

## Summary

The site is in good structural shape. Next 15 App Router, strict TS, content-driven, sitemap and OG cards wired, JSON-LD per page type, click-to-load social embeds, click-to-load YT special player, and the open mic map is real. The biggest risk is a small pile of broken legacy redirects: `public/about/index.html`, `public/book-a-show/index.html`, `public/comic-submissions/index.html`, `public/sponsorships/index.html` ship as static meta-refresh pages that point to routes that do not exist in the current information architecture, and the `public/_redirects` file disagrees with `vercel.json` on the same paths. The biggest win is image weight: several hero and roster portraits ship at 1.5 to 11 MB unoptimized, including the LCP image on `/watch`. Everything else is polish, dead code, and a few SEO niceties.

## Critical and High Findings

### 1. Stale static pages in `/public` intercept new redirects and 404 the visitor
- Paths: `public/about/index.html`, `public/book-a-show/index.html`, `public/comic-submissions/index.html`, `public/sponsorships/index.html`, `public/media/index.html`
- Severity: Critical
- Problem: Each file is a `<meta http-equiv="refresh">` that targets a route that no longer exists. `/about` refreshes to `/members/`, `/book-a-show` refreshes to `/services/`, `/comic-submissions` refreshes to `/submit/`, `/sponsorships` refreshes to `/sponsor/`. The current IA uses `/roster`, `/book`, `/book`, `/book#sponsors`. Because these files ship to `/out/<path>/index.html`, they take priority over `vercel.json` redirects, so visitors with old URLs land on a self-referencing 404.
- Fix: Delete all five directories. Let `vercel.json` `redirects` and `public/_redirects` handle the rerouting, and bring those two files into agreement (see next finding).

### 2. `public/_redirects` and `vercel.json` redirects disagree and target wrong slugs
- Paths: `public/_redirects`, `vercel.json` lines 4-5
- Severity: Critical
- Problem: `_redirects` sends `/about → /members`, `/comic-submissions → /submit`, `/book-a-show → /services`, `/sponsorships → /sponsor`. None of `/members`, `/submit`, `/services`, `/sponsor` exist as routes. `vercel.json` only covers `/about → /roster` and `/media → /watch` and is correct, but the project ships to both Vercel and Cloudflare Pages style hosts.
- Fix: Rewrite `_redirects` to match the current IA: `/about → /roster`, `/media → /watch`, `/members → /roster`, `/comedians → /roster`, `/comic-submissions → /book`, `/book-a-show → /book`, `/services → /book`, `/sponsor → /book#sponsors`, `/sponsorships → /book#sponsors`, `/submit → /book`. Mirror the same set into `vercel.json` `redirects` so both hosts behave identically.

### 3. `.lighthouserc.json` runs against URLs that do not exist
- Path: `.lighthouserc.json` lines 6-11
- Severity: High
- Problem: Audited URLs include `/services.html` which is not a route in the current IA. The check will fail or be misleading.
- Fix: Replace `/services.html` with `/book.html` and add `/open-mics.html` and `/roster.html`. Consider keeping the list at 5 URLs to stay within free Lighthouse CI minutes.

### 4. Root metadata canonical leaks to pages without their own canonical
- Path: `app/layout.tsx` line 71, plus `app/contact/page.tsx`, `app/shop/page.tsx`, `app/watch/page.tsx`
- Severity: High
- Problem: `metadata.alternates.canonical = site.url` in the root layout sets the canonical URL for every page that does not override `alternates.canonical`. `/contact`, `/shop`, and `/watch` do not override it, so each of those three pages publishes `https://www.stonedgooseproductions.com` as its canonical. This signals to search engines that those pages are duplicates of the home.
- Fix: Add `alternates: { canonical: "/contact" }` to `app/contact/page.tsx`, `alternates: { canonical: "/shop" }` to `app/shop/page.tsx`, and `alternates: { canonical: "/watch" }` to `app/watch/page.tsx`. Confirm `/book/[slug]` also resolves correctly (it inherits from `app/book/page.tsx` which has `/book`, which is wrong for service detail pages, so set per-slug canonicals in `generateMetadata`).

### 5. Multi-MB images ship unoptimized
- Paths: `public/images/comedians/xavier.png` 6.8 MB, `public/images/members/sam.png` 11 MB, `public/images/members/kyle.png` 3.7 MB, `public/images/comedians/cloe-nomic.jpg` 2.5 MB, `public/images/members/garrett-iverson.jpg` 2.5 MB, `public/images/comedians/kayleen-dunn.jpg` 2.4 MB, `public/images/media/halloween.png` 2.1 MB, `public/images/members/brendan.png` 1.2 MB, `public/images/comedians/yoshi.png` 1.7 MB, `public/images/comedians/brandon-white.jpg` 1.6 MB, `public/images/comedians/david-weed.png` 1.3 MB, `public/brand/stoned-goose-logo-full.png` 1.5 MB, `public/brand/stoned-goose-mark-illustration.png` 759 KB, `public/brand/stoned-goose-mark.png` 1.5 MB
- Severity: High
- Problem: `next.config.mjs` sets `images.unoptimized: true` because static export disables next/image runtime processing. Browsers download the full source file. `xavier.png` is the featured-special poster on `/watch` and is loaded with `priority`, so it is the LCP image; an 11 MB source file in any code path is severe. The 1.5 MB logo loads in the footer on every page and with `priority` on the 404 page.
- Fix: Preprocess source images to web-friendly sizes before they enter `/public`. Two paths: (a) replace files in `/public` with resized exports (target widths: portraits 800w, logo 480w, hero mark 96w, poster 1600w) using `sharp` invoked from a new `scripts/optimize-images.ts` run on demand; (b) commit the resized files and keep originals in `attached_assets/`. Either is small work. The hard part is the catalog of source files; the resize script can crawl `public/images` and `public/brand` and target a max width per directory.

### 6. Featured special LCP path has no `placeholder="blur"` value
- Path: `scripts/build-placeholders.ts` line 54, `components/featured-special-player.tsx` line 44
- Severity: High
- Problem: The placeholder generator hard-codes the path `/images/shows/xavier-rake-special-poster.jpg`, which does not exist. The actual special poster is `/images/comedians/xavier.png`. So the featured-special player never gets a blur placeholder and the LCP image flashes from `bg-haze-500` to the full 6.8 MB png.
- Fix: Update `scripts/build-placeholders.ts` to use `featuredSpecial.poster` from `content/shows.ts` (or move that import path into a constant the generator can pull from), then wire `placeholder="blur"` + `blurDataURL` into `FeaturedSpecialPlayer` the same way `roster-teaser.tsx` does. Confirm by re-running `npm run build:placeholders` and checking `content/.generated/placeholders.json` includes the poster path.

### 7. Open mic list row mixes an outer button role with inner interactive children
- Path: `components/open-mic-list.tsx` lines 28-79
- Severity: High
- Problem: The outer wrapper is `<div role="button" tabIndex={0}>` with onClick and onKeyDown handlers, and inside it are nested `<a>` (Signup) and `<button>` (Report change). HTML and ARIA disallow nesting interactive controls inside another interactive control. Screen readers will announce a button that contains a button. Clicks on the inner controls already call `stopPropagation`, which is the smell that the outer pattern is wrong.
- Fix: Restructure so the outer element is plain (no role, no tabindex, no key handler), and add an explicit "Show on map" button per row that calls `onSelect(m.id)`. Move the existing visual hover and focus treatment to that button. Drop `onClick` and `onKeyDown` from the row container.

### 8. Two services ship with literal "TODO: copy needed." strings
- Path: `content/services.ts` lines 70-89 (`film-your-comedy-set`), lines 145-159 (`collaboration`)
- Severity: High
- Problem: Both services have `draft: true`, which renders a "Draft. Final copy lands soon." banner, but the page body still renders the literal "TODO: copy needed." strings in What you get, Ideal for, Process, and FAQ. That is shipping copy that breaks the bumper voice and signals abandoned scaffolding.
- Fix: Either write the real copy, or change `Block` and the Process/FAQ renderers to skip entries equal to the literal `"TODO: copy needed."`. If you remove the items, the page collapses cleanly because the lists are unordered. Decision should be owner-side, since both services are real services on the site.

## Medium and Low Findings

### 9. "5,000+ Tickets Sold" marquee item violates the no-invented-stats house rule
- Path: `content/home.ts` line 46 (with TODO at line 36)
- Severity: Medium
- Problem: Marquee renders a numeric claim. House rule in CLAUDE.md says no invented stats.
- Fix: Replace with a non-numeric phrase ("Cinematic Specials" or similar) or drop the line. Owner decision.

### 10. `app/watch/page.tsx` renders a section gated by an always-empty array
- Path: `app/watch/page.tsx` lines 153-189, `content/news.ts`
- Severity: Medium
- Problem: `news` is `[]`. The "From the Goose" section is gated by `news.length > 0`, so it never renders. Useful as a slot, but currently a dead conditional path that imports an empty module.
- Fix: Keep as is if the owner intends to publish news posts. If not, delete the section block and `content/news.ts` and remove the news branch in `lib/news-feed.ts`.

### 11. `app/book/page.tsx` "Venues" section lists every service, not venue-specific ones
- Path: `app/book/page.tsx` lines 75-103
- Severity: Medium
- Problem: The `#venues` section heading reads "Bring consistent comedy to your room" but the list maps `services` (all four services including media-and-podcasts and collaboration). Visitor scanning the venues anchor expects a venues-only list.
- Fix: Either label the section "All services" and drop the venues framing, or filter to a venue-relevant subset by adding a `category: "venue" | "media" | "collab"` field to each service entry and filtering. Smaller fix: change the section title.

### 12. Honeypot field also gets a Zod-required schema
- Path: `lib/form-schemas.ts` line 13, 22, 32, 44, 52, 61, 74; `components/contact-form.tsx` lines 144-149
- Severity: Low
- Problem: Every schema declares `_honey: z.string().optional()`. The `<input>` for `_honey` is registered as `methods.register("_honey")` without a Zod-mapped name from the field definition. The implementation works because the field is optional, but it is brittle: if Zod tightens default behavior or a future schema misses the field, the honeypot will get stripped before the bot-detect branch runs at submit-time.
- Fix: Centralize honeypot handling outside the schema. Either omit `_honey` from schemas entirely and inject it server-side as a non-validated field on the FormData read, or move the `if (payload._honey)` check before `methods.handleSubmit` even runs.

### 13. Two services lists, two sources of truth
- Paths: `content/home.ts` lines 28-33, `content/services.ts` lines 16-163
- Severity: Low
- Problem: `content/home.ts` exports a separate, smaller `services` array used only by `components/services-overview.tsx`. The canonical list is in `content/services.ts`. They happen to agree right now but can drift.
- Fix: Import `services` from `@/content/services` in `services-overview.tsx`, map to title and slug, and delete the duplicate from `content/home.ts`.

### 14. Duplicate favicon shipped at site root
- Path: `public/favicon.png`
- Severity: Low
- Problem: `app/layout.tsx` declares the icon set from `/brand/favicon-*.png`. `public/favicon.png` is referenced only by `scripts/build-shows-feeds.ts:73` for the RSS feed favicon URL.
- Fix: Either keep it and adjust nothing, or replace the RSS favicon reference with `/brand/favicon-256.png` and delete `public/favicon.png`.

### 15. `app/not-found.tsx` is fully client-rendered
- Path: `app/not-found.tsx` lines 1, 51-127
- Severity: Low
- Problem: The whole page is `"use client"` so that it can read `window.location.pathname` and tailor link suggestions. SEO-wise this is fine for a 404, but it means the page does no SSR rendering and the first frame is a flash of unstyled content if hydration is delayed.
- Fix: Move the static layout (logo, headline, fallback links) into a server component, keep only the path-aware list of suggestions in a small client subcomponent. Use `<Suspense>` so the static frame is rendered server-side.

### 16. `metadata.icons.shortcut` is a deprecated link relation
- Path: `app/layout.tsx` line 67
- Severity: Low
- Problem: `rel="shortcut icon"` is non-standard. Modern browsers infer from `rel="icon"` already declared.
- Fix: Remove the `shortcut` key from `metadata.icons`.

### 17. Plausible script is in `<head>` but lacks SRI
- Path: `app/layout.tsx` line 131-137
- Severity: Low
- Problem: External script is loaded without `integrity` or `crossOrigin`. Plausible publishes pinned versioned URLs but the default `script.js` floats.
- Fix: Acceptable as is. If you want defense in depth, switch to a pinned hash url and add `integrity`.

### 18. `framer-motion` is used for a single one-shot animation
- Path: `components/text-effect.tsx` (only consumer)
- Severity: Low
- Problem: Framer Motion ships ~70 KB gz of client JS to power one per-letter rise on mount. Everything else uses CSS keyframes already.
- Fix: Replace `TextEffect` with a CSS-only keyframed stagger (custom property `--i` for index, calculated delay). Keep `prefers-reduced-motion` opt-out. Then drop `framer-motion` from `dependencies`. Confirm visually that the cadence still feels right.

### 19. `app/book/[slug]/opengraph-image.tsx` always renders title "Brief"
- Path: `app/book/[slug]/opengraph-image.tsx` lines 14-25
- Severity: Low
- Problem: Every service OG card reads `[service title] / Brief.` The service name only appears in the small eyebrow. When a service link is shared, the OG title is the same word for every service.
- Fix: Swap eyebrow and title in the template: eyebrow = `"Service brief"`, title = `svc?.title`. Per service the card now leads with the service name.

### 20. Heavy brand mark loaded with `priority` on every page
- Path: `components/nav.tsx` lines 43-55, `components/hero.tsx` lines 27-34
- Severity: Low
- Problem: `stoned-goose-mark-illustration.png` (759 KB raw) is loaded with `priority` at 28x24 in the nav and 32x28 in the hero. The displayed size is tiny but the source bytes are not.
- Fix: Replace with a properly sized PNG (or inline SVG) at the actual rendered dimensions. See finding 5 for the bulk-resize approach.

### 21. `scripts/build-placeholders.ts` warns on a missing file every build
- Path: `scripts/build-placeholders.ts` line 54
- Severity: Low
- Problem: `/images/shows/xavier-rake-special-poster.jpg` does not exist in `public/`. Every prebuild logs `[placeholders] missing file:`.
- Fix: Covered by finding 6.

### 22. `OpenMicMap` injects `<style jsx global>` from a client component
- Path: `components/open-mic-map.tsx` lines 168-206
- Severity: Low
- Problem: The styled-jsx tag works under Next, but lands global CSS only when the component mounts. On first paint of `/open-mics` the map skeleton renders, then the marker styles arrive at hydration. Not visually broken but inconsistent with the rest of the codebase (all other styles are Tailwind or `app/globals.css`).
- Fix: Move the Leaflet pin and cluster styles to `app/globals.css`. Drop `styled-jsx` usage. Confirm in the browser that markers still get the hazard-yellow treatment.

### 23. `lib/feeds.ts` casts JSON modules without runtime guards
- Path: `lib/feeds.ts` lines 14-16
- Severity: Low
- Problem: `as InstagramFeed` etc. trust the JSON layout. Build-time validation in `scripts/feeds/validate-feeds.ts` covers normal flows, but a hand-edited or partial JSON can ship and the type cast lies.
- Fix: Either keep the prebuild validator as the gate (current setup) and add a comment to that effect, or do a minimal runtime guard in `lib/feeds.ts` that checks `Array.isArray(posts)` and falls back to an empty manifest on shape mismatch. Lighter touch is the comment; defensive touch is the guard.

### 24. `RouteFocusManager` mutates DOM tabindex without cleanup
- Path: `components/route-focus-manager.tsx` lines 25-28
- Severity: Low
- Problem: Sets `tabindex="-1"` on the H1 to make it focusable, but does not remove it on unmount. Cumulative tabindex pollution across navigations is harmless in practice but technically a leak.
- Fix: Acceptable. If you want it clean, store whether the attribute was set and remove it in the effect cleanup.

### 25. Service detail page double-renders `whatYouGet[0]` above the form
- Path: `app/book/[slug]/page.tsx` lines 178-180
- Severity: Low
- Problem: The block above the quote form prints `svc.whatYouGet[0]` as a label, then the "What you get" section above already shows the same string. Reads as duplication.
- Fix: Replace with a single sentence ("Tell us about your show and we will scope it.") or drop the label entirely.

### 26. `AddToCalendar` dropdown does not close on outside click
- Path: `components/add-to-calendar.tsx` lines 73-117
- Severity: Low
- Problem: Native `<details>` is used, which is good for keyboard and screen readers, but does not close when clicked outside. Visitors on touch devices end up with stuck open menus.
- Fix: Add a small outside-click listener that toggles the `open` state. Keep `<details>` semantics; just augment with the listener.

### 27. `next.config.mjs` `remotePatterns` is unreachable
- Path: `next.config.mjs` lines 12-17
- Severity: Low
- Problem: `images.unoptimized: true` makes the remote pattern allowlist a no-op because the loader is bypassed. The config implies we care; we do not, because every external image has to be allowed regardless.
- Fix: Either delete `remotePatterns`, or keep it as a future-state hint with a comment. Cosmetic.

## Removal Candidates

### Components

- `components/tiktok-card.tsx`. **Certain.** Not imported anywhere. `tiktokVideos` in `content/social.ts` is `[]`, and even when non-empty, `lib/news-feed.ts` renders TikTok items through `NewsCard`, never `TikTokCard`.
- `components/reel-card.tsx`. **Certain.** Not imported anywhere in the current IA. The /watch reels are rendered via `NewsCard` from `lib/news-feed.ts`.

### Content / data

- `services` array exported from `content/home.ts` lines 28-33. **Certain.** Already duplicated by `content/services.ts`. Consumer is `components/services-overview.tsx`; switch the import.
- `content/news.ts` and `news` import path in `app/watch/page.tsx` and `lib/news-feed.ts`. **Needs confirmation.** Empty today. Owner may want to publish posts.
- `tiktokVideos` in `content/social.ts`. **Needs confirmation.** Empty today, and the rendering glue (TikTokCard) is going away. If TikTok is not part of the surface, drop the array and the `lib/news-feed.ts` loop that iterates it.
- The "5,000+ Tickets Sold" entry in `marqueeWords`. **Likely.** Violates house rules unless the figure is verified.

### Public assets

- `public/about/`, `public/book-a-show/`, `public/comic-submissions/`, `public/sponsorships/`, `public/media/`. **Certain.** Stale meta-refresh redirect pages that point to non-existent routes (see finding 1).
- `public/favicon.png`. **Likely.** Only referenced by `scripts/build-shows-feeds.ts:73`; trivial to repoint at `/brand/favicon-256.png`.
- `public/_headers`. **Likely.** Sets `image/png` Content-Type for `/opengraph-image` paths, which `vercel.json` also sets. If you ship to Cloudflare Pages too, keep one; otherwise duplicate.

### Scripts

- `scripts/import-open-mics-xlsx.ts`. **Likely.** One-time bulk import script. Not invoked from `package.json` scripts. 17 KB of code that runs once.

### Dependencies

- `framer-motion`. **Needs confirmation.** Only `components/text-effect.tsx` uses it. Replace with a CSS keyframe (finding 18) and remove from `dependencies`.

### Comments / cosmetics

- `next.config.mjs` `remotePatterns` block. **Likely.** Unreachable while `unoptimized: true`.
- `components/section-header.tsx` line 6: `@deprecated index?` prop. **Likely.** No callers pass an `index`. Remove the prop.

## UX Additions

### 1. Loading skeletons for the news feed grid
- Solves: First paint on `/watch` shows a blank space while `buildNewsFeed()` returns. With sync failures, the page also shows the "Auto-synced from Instagram, YouTube, TikTok" line without anything to back it. A skeleton makes the wait feel intentional.
- Lives in: `components/news-feed.tsx`. Render a 6-cell grid of haze-500 squares while items are empty during an explicit "loading" state. Build time is static, so the skeleton is only for the rare empty case, but it also gives us a state to use if feeds fail.
- Scope: S
- Why it fits: Matches the bumper-style negative space. No new motion library, just `animate-pulse` from Tailwind.

### 2. Empty-state copy for `/shows` in bumper voice when there are no shows AND `presale` is null
- Solves: Today the empty state reads cleanly but lacks the next step. Add a small "We are between specials. The next one drops in Q2." style microcopy slot keyed off `content/shows.ts`.
- Lives in: `content/shows.ts` add a `betweenShowsCopy: string | null`. Render under the existing `showsCopy.emptyState` paragraph.
- Scope: S
- Why it fits: Adult Swim bumper register. Owner-editable. No invented stats.

### 3. Scroll-reveal stagger on roster grids
- Solves: The roster page is a tall scroll past a long crew list. A 12px translate-up + opacity in/out per item as it enters view gives it pacing without theatrics.
- Lives in: `components/roster-teaser.tsx` and `app/roster/page.tsx` comedian grid. Pure CSS `@starting-style` or an IntersectionObserver hook; both are static-export safe.
- Scope: M
- Why it fits: Subtle, respects `prefers-reduced-motion`, no Framer Motion dependency added.

### 4. Per-show share button already exists. Add per-service share too
- Solves: `/book/[slug]` is a high-intent page for partners and venues. A share button at the page-header level lets a venue manager send "this one" to their team.
- Lives in: `app/book/[slug]/page.tsx`. Drop in `<ShareButton title={svc.title} text={svc.summary} url={`${site.url}/book/${svc.slug}`} surface="service" />` near the `Read brief ↗` row in the page header.
- Scope: S
- Why it fits: Existing component, existing analytics event, no new patterns.

### 5. Inline mailing-list confirmation pulse
- Solves: On submit, the slim copy line swaps to "You're on the list." That is fine but bottom-aligned and easy to miss on mobile.
- Lives in: `components/mailing-list-capture.tsx`. After success, swap the input row to a centered confirmation block with the hazard accent on a single word ("Locked in."). Keep the existing copy below.
- Scope: S
- Why it fits: Adult Swim register. Single accent.

### 6. 404 in the house voice already exists; add a recent shows tile
- Solves: 404 page currently has 3 inferred suggestions. If `upcomingShows.length > 0`, list the next show as a fourth, hazard-period card.
- Lives in: `app/not-found.tsx` after the `picks.map` list, add a single-line "Next on stage. <date>. <venue>." that links to `/shows#<id>`.
- Scope: S
- Why it fits: Reinforces the tour-diary frame on a page visitors might bounce from. No invented content.

### 7. ICS export per-show already lives in `AddToCalendar`. Add a "subscribe to feed" prompt
- Solves: `app/shows/page.tsx` exposes `/shows/feed.ics` via the metadata `alternates` header and a small link in the upcoming-dates row. A short copy block reminding visitors they can subscribe (so future shows arrive automatically) would lift sign-ups.
- Lives in: `app/shows/page.tsx` below the upcoming-dates list, two-line block: "Subscribe to the calendar. Shows arrive in Apple Calendar or Google Calendar automatically." with two outbound links.
- Scope: S
- Why it fits: Practical. The feed already exists. No new dep.

### 8. Image lightbox for `/roster` member portraits on click
- Solves: Crew portraits already do a halftone-to-color hover. On mobile there is no hover, and on desktop the photo is small. A lightbox lets visitors see the actual portrait.
- Lives in: `app/roster/page.tsx` crew section. Wrap each portrait in a Radix Dialog (already a dependency) that opens a larger view with name and role under it.
- Scope: M
- Why it fits: Uses an existing dep. No new motion.

### 9. Instagram and YouTube feed posts get publish dates rendered
- Solves: `NewsCard` shows the platform label and title but not when it was posted. Visitors cannot tell if "From the feed" is daily-fresh or weeks stale.
- Lives in: `components/news-card.tsx` add a small mono date under the platform label. `relativeAge` from `lib/feeds.ts` formats it cleanly.
- Scope: S
- Why it fits: Reuses existing helper. Tiny mono accent.

### 10. Search palette empty state in bumper voice
- Solves: Today the empty state reads "No matches. Try a comic name, a city, or a service." It works but is generic.
- Lives in: `components/search-palette.tsx` line 153. Replace with one of three rotating lines: "Nothing matches that. The map is bigger than the search box." / "Empty. Try a city or a comic." / "Goose says no."
- Scope: S
- Why it fits: Bumper register without taking over the UI. Single line.

### 11. Mobile nav: show next show inline
- Solves: Mobile nav currently shows the wordmark, link list, tickets CTA, and email. The Tickets button drives the most value. Surface the next show date and venue directly above it.
- Lives in: `components/nav.tsx` mobile sheet. Below the link list, before the Tickets button, render `upcomingShows[0]` summary line if present.
- Scope: S
- Why it fits: Reinforces the live-comedy lead. No new component.

### 12. Open-mic explorer: "save to phone" weekly digest CTA
- Solves: The map is dense. Comics scanning the list want a digest they can keep.
- Lives in: `app/open-mics/page.tsx` between the explorer and the "Spotted a missing mic" block. Add a mailing-list capture variant (`page="open-mics"`) that mentions "Weekly digest of new mics and changes."
- Scope: S
- Why it fits: Uses existing `MailingListCapture` with a new page tag for analytics.

### 13. Bumper kicker links to a soft destination on hover
- Solves: Bumpers are pauses, not destinations. But the footnote (`thank you for visiting.`) could grow a hover affordance that reveals the next section name in tiny mono, reinforcing the cable-bumper frame.
- Lives in: `components/bumper.tsx` footnote line. Wrap in a span that exposes a tiny scroll-down chevron on hover, scrolls to the next section.
- Scope: M
- Why it fits: Honors the "Bumpers are pauses" comment by not turning them into links, just hinting at flow.

### 14. Sitemap XML includes per-show anchor for SEO event indexing
- Solves: `app/sitemap.ts` lists the 8 static routes and the 4 service detail routes. Each show has `Event` JSON-LD but the sitemap does not surface its anchor link, so Google has to discover shows via the listing.
- Lives in: `app/sitemap.ts`. After `serviceRoutes`, add `upcomingShows.map((s) => `/shows#${s.id}`)`. Confirm Google accepts hash routes (they do, but treat them as pointers, not separate URLs). Lower priority field.
- Scope: S
- Why it fits: No new dep. Surfaces real content.

## Suggested Execution Order

### Phase 1. Safest deletions and corrections that do not touch design or copy tone
- Remove `public/about/`, `public/book-a-show/`, `public/comic-submissions/`, `public/sponsorships/`, `public/media/` (finding 1).
- Update `public/_redirects` and `vercel.json` to point all legacy slugs at the current IA. Make the two files match. (Finding 2.)
- Update `.lighthouserc.json` to current routes (finding 3).
- Add explicit canonicals on `/contact`, `/shop`, `/watch`, plus per-slug canonicals on `/book/[slug]` (finding 4).
- Delete unused components `tiktok-card.tsx` and `reel-card.tsx` (Removals).
- Switch `services-overview.tsx` to read from `content/services.ts` and drop the duplicate export in `content/home.ts` (finding 13).
- Repoint RSS favicon to `/brand/favicon-256.png` and remove `public/favicon.png` (finding 14).
- Remove deprecated `metadata.icons.shortcut` (finding 16).
- Remove unreachable `remotePatterns` block in `next.config.mjs` (finding 27).
- Drop unused `index?` prop from `components/section-header.tsx`.
- Drop `scripts/import-open-mics-xlsx.ts` if no further imports are planned (Removals, ask owner).
- Confirm: `npm run lint` and `npm run typecheck` pass after each delete.

### Phase 2. Image and performance work
- Add `scripts/optimize-images.ts` (uses already-installed `sharp`) that resizes `public/images/**` and `public/brand/**` to target widths. Run it once, commit the resized files (finding 5).
- Fix `scripts/build-placeholders.ts` poster path and wire `placeholder="blur"` into `FeaturedSpecialPlayer` (finding 6).
- Replace `framer-motion` `TextEffect` with a CSS keyframe and drop the dependency (finding 18). Visually verify hero cadence.
- Move Leaflet pin and cluster CSS from styled-jsx into `app/globals.css` (finding 22).
- Confirm: `npm run build`, eyeball `/out`, run Lighthouse against the resized images.

### Phase 3. Correctness and accessibility
- Restructure `components/open-mic-list.tsx` row to remove nested interactive children, add a dedicated "Show on map" button per row (finding 7).
- Centralize honeypot handling outside Zod schemas (finding 12).
- Add outside-click close to `AddToCalendar` `<details>` dropdown (finding 26).
- Optionally tighten `lib/feeds.ts` with a minimal runtime guard (finding 23).
- Confirm: keyboard navigate the open-mic list, screen-reader test the form honeypot.

### Phase 4. UX additions, lower priority
- News feed loading state (UX 1), mailing-list confirmation pulse (UX 5), feed post dates (UX 9), search-palette empty-state copy (UX 10), mobile nav next-show line (UX 11), 404 next-show card (UX 6), sitemap show anchors (UX 14), service-page share button (UX 4).
- Confirm: build, lint, click-through.

### Phase 5. Design and copy tone (owner reviews personally)
- Replace or remove `"5,000+ Tickets Sold"` marquee item (finding 9).
- Write final copy for `film-your-comedy-set` and `collaboration` services, or change the page renderer to skip TODO entries (finding 8).
- Decide on `content/news.ts` future (finding 10, Removals).
- Rename `/book` "Venues" section or filter the services list (finding 11).
- Refine `app/book/[slug]/opengraph-image.tsx` template (finding 19).
- Inline mailing-list "subscribe to calendar" block (UX 7), image lightbox on roster (UX 8), open-mic weekly digest (UX 12), bumper footnote hover (UX 13), scroll-reveal stagger (UX 3), `/shows` "between shows" microcopy (UX 2).
- Confirm: owner browses every changed page, signs off on tone.

## Open Questions

1. Are you deploying to Vercel exclusively, or also Cloudflare Pages or Netlify? Answers determine whether `public/_redirects` and `public/_headers` need to stay alongside `vercel.json`. If Vercel-only, delete the two files.

2. Is `/members` a future route or a fully retired one? `vercel.json` currently sends `/about → /roster`, and `public/_redirects` sends `/about → /members`. The new IA uses `/roster`. Confirm we should standardize on `/roster` everywhere.

3. Same question for `/services`, `/submit`, `/sponsor`. The current IA collapses all of these into `/book` with section anchors. Confirm we should redirect them to `/book` (or `/book#sponsors`, `/book#corporate`) rather than to slugs that do not exist.

4. The two draft services in `content/services.ts` (`film-your-comedy-set`, `collaboration`). Should the audit plan write final copy on owner brief, or should the page renderer collapse TODO items until copy lands? Both are real services on the site, so they should not be hidden, but the literal "TODO: copy needed." text should not ship.

5. Is the "5,000+ Tickets Sold" marquee phrase a real figure? If yes, this is just a verification ask. If not, what should replace it (or do you want it dropped entirely)?

6. `content/news.ts` is currently `[]`. Is there a plan to publish news posts? If not, the audit recommends removing the news section from `/watch` and deleting `content/news.ts`.

7. TikTok. Is TikTok a real surface for the brand? If yes, we should at least populate `tiktokVideos`. If no, the audit recommends removing the dead components and the news-feed glue.

8. Replacing `framer-motion` with CSS would remove ~70 KB gz from the client bundle. The hero stagger is the only thing it powers. Are you OK with the swap, or do you want to keep Framer Motion available for future motion work? (Falls under the "no new libraries without flagging" rule, but here we are removing one.)

9. Image preprocessing. The plan is to commit resized files into `public/`. Owner preference: overwrite the existing files in place, or keep originals in `attached_assets/` and resized derivatives in `public/`? The second is safer for re-export but doubles disk.

10. Lighthouse CI thresholds in `.lighthouserc.json` are set to 0.9 across categories. After image preprocessing, that should be achievable. Should we tighten any of them to 0.95, or leave at 0.9?
