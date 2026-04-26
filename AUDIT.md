# stonedgooseproductions.com — site audit

Snapshot: main @ fb950f6 · Next.js 15 App Router static export · 18 prerendered routes · ~106 kB First Load JS on home

## Stack

- Framework: Next.js 15.5.15, App Router, `output: "export"` (deployable to any static host)
- Language: TypeScript, strict mode
- Styling: Tailwind CSS v3 with custom tokens (ink, bone, hazard, haze)
- Type: Fraunces (display serif, italic for emphasis), Inter (body sans), JetBrains Mono (used once: hero status banner)
- Motion: Framer Motion (used sparingly), all motion respects `prefers-reduced-motion`
- Forms: Posted client-side to `formsubmit.co/ajax/kyle@stonedgooseproductions.com`
- Hosting: Codespaces dev verified; production target Vercel/Cloudflare Pages

## Site-wide elements

### Navigation (top, fixed)
- Wordmark: "Stoned Goose." (period in hazard yellow), single line, baseline-aligned with nav
- Links: Shows, Members, Comedians, Watch, Services, Shop, Contact
- Right-side action: "Book a Show ↗" as a hazard-underlined text link (not a button, primary CTA stays in the hero)
- Mobile: hamburger reveals a clip-path masthead menu with display-size links + indices, plus email and "Book a Show" button at the bottom
- Background: transparent on hero, ink/85 + blur on scroll

### Footer
- Left block: "Olympia, WA" / "Stoned Goose." (display, hazard period) / brand description / email + phone + locality in mono uppercase
- Three columns: Explore, Services, Connect
- Bottom row: 5 socials (Instagram, Facebook, TikTok, YouTube, Patreon), copyright, "Website Design by Kyle Mixon."

### Site-wide chrome
- SVG grain overlay on every page at 12% opacity, mix-blend overlay
- Skip-to-content link (focus-visible)
- LocalBusiness JSON-LD (areaServed, sameAs, contactPoint, address)
- 404 page with editorial treatment

## Pages

### `/` Home
Has: Hero · Marquee · Bumper · Upcoming Shows · Bumper · Services list · Bumper

- Hero: mono status banner ("Now booking corporate events + media production") · two-line lockup "Stoned Goose / Productions." with hazard period · baseline-aligned grid: subhead left, italic "live. local. comedy." tagline right · single yellow "Start Booking" CTA + 3 text links (Browse Shows, Sponsor a Show, Comic Submissions)
- Marquee: scrolls 9 brand/place/status phrases with hazard "//" separators
- Bumper 1: clarification / We are a comedy production company. We are not a goose. / thank you for visiting.
- Upcoming Shows: "Next on stage" eyebrow + "Shows" heading on left, empty-state copy on right (verbatim original) + "See the shows page ↗" CTA + Eventbrite text link
- Bumper 2: aside / We do other things too. / it's listed below.
- Services: "Now hiring out" / "We do five things." with TV-guide style numbered list of 5 services, each linking to its detail page · "See all services" CTA + "Or just email us" text link
- Bumper 3: end of bumper / Goodnight, Olympia. / please drive carefully.

### `/members`
- Page header: "[ The Crew / Issue 001 ]" eyebrow / "Members." display
- Four pillars in a 2x2 lined grid: Production & Ops · Media Team · Community & Partners · Creative Lab
- Crew section on bone (cream) background: 5 members as a long editorial list with halftoned 3:4 portraits that reveal color on hover · names in display, role in tracked sans
- Closing CTA: "Want to work with us?" → /submit + /contact

### `/comedians`
- Page header: "The Roster" / "Our Friends." / "Comedians we have worked with."
- 22-comic grid (2/3/4/5 cols responsive), each: 3:4 halftoned portrait, hover reveals IG/FB links over a gradient
- Closing CTA: "Want to work with us?" → /submit

### `/shows`
- Page header: "Tour Diary" / "Upcoming Shows." / subhead
- Featured production block: Xavier Rake's full special, 16:9 halftoned poster, "Watch now" CTA → /watch, "@jokedeal3r" link
- Upcoming dates list: currently empty-state ("Currently — empty calendar" + verbatim original empty copy + "See all dates on Eventbrite" link)
- Mailing list block: "Stay in the loop" form posting "Show announcements + presale signup"

### `/watch`
- Page header: "Now Streaming" / "Media & Clips."
- Featured / Full Special: 16:9 halftoned poster of Xavier with hazard play button overlay · "Channel on YouTube" link
- Reels: 2-up grid: Halloween Comedy Costume Contest, Matt Loes Krusty Impression, 9:16 halftoned posters with hazard play overlays
- Channel block: "Open the channel ↗" CTA

### `/services`
- Page header: "What We Do" / "Services."
- Index list of all 5 services with 1-paragraph summaries, each linking to detail
- Venue Partner Program block ("Bring consistent comedy to your room.") with CTA to /contact
- Packages & Pricing: 3-tier grid (Starter $750, Pro $2,000, Premium $5,000) with bullet lists
- Quick Quote form: service type, event date, budget, venue size, contact email

### `/services/[slug]` (5 pages)
Routes: live-show-production, comedian-booking, corporate-events, media-and-podcasts, headshots-and-promo

Each has: page header · "What you get" + "Ideal for" 2-up · 3-step Process · Pricing block + per-service quote form (name, email, date, budget, notes) · 4-question FAQ · "Next service" navigation footer

### `/sponsor`
- Page header + downloadable one-sheet link (`/sponsorship-one-sheet.txt`)
- By the numbers: 1,200+ monthly audience · 85K+ social impressions · 30K+ video views (each with description)
- Tiers: Bronze $500/show, Silver $1,250/mo, Gold $2,500/mo with deliverables
- Inquiry form: name, company, email, tier of interest, sponsorship goals

### `/submit`
- Page header: "Roster Pipeline" / "Comic submissions."
- Two-up info: "What to send" requirements (4 bullets) + "Response time"
- 8-field submission form: name, email, phone, city, years performing, social links, set tape URL, additional notes

### `/contact`
- Page header: "Direct Line" / "We want to work with you"
- Left: clickable email + phone (display-size, hazard on hover) · "Find us" address · service-area list
- Right: name, email, message form

### `/shop`
- Page header: "Fourthwall Storefront" / "Fresh Merch."
- 18-product grid (3 cols on desktop), each linking to Fourthwall checkout
- 3 products have product imagery (Metal Goose, LOGO Hoodie, Sick Hat); the other 15 use a single-letter initial placeholder
- Closing block linking to the full Fourthwall store

### `/_not-found`
- Editorial 404: "Lost." in massive display, two CTAs (home, contact)

## Forms

| Page | Endpoint | Fields | Subject |
|---|---|---|---|
| Contact | formsubmit.co | name, email, message | "New site contact form message" |
| Shows mailing list | formsubmit.co | email | "Show announcements + presale signup" |
| Services quote (hub) | formsubmit.co | service type, date, budget, venue, email | "Quick Quote" |
| Service detail (×5) | formsubmit.co | name, email, date, budget, notes | "Quote — [service]" |
| Sponsor inquiry | formsubmit.co | name, company, email, tier, goals | "Sponsorship inquiry" |
| Comic submission | formsubmit.co | name, email, phone, city, years, socials, tape URL, notes | "Comic submission" |

All show idle / loading / success / error states. None of them use captcha (`_captcha: false` set in payload).

## Assets

- Hero/OG: `covervideo.mp4` (currently unused after hero swap to solid black) · `opengraph.jpg` · `favicon.png` · `logo.png` (in `/images/misc`, not currently rendered) · `stage.png` (in `/images/misc`, not currently rendered)
- Members: 5 portraits in `/images/members/`
- Comedians: 23 files in `/images/comedians/` (22 listed comics + the kayleen-dunn duplicate)
- Media reels: `halloween.png`, `matt-loes.png` in `/images/media/`
- Static download: `/sponsorship-one-sheet.txt` (still a .txt; no PDF version)

## Positives — what's working

- **Type system locked.** Three families, each with one job. Hero, navigation, footer, bumpers, and section headers are all hand-aligned to the same baseline grid.
- **Editorial rhythm.** Page headers, section indices, and the bumpers form a consistent bumper-and-footnote pattern that reads as designed, not generic.
- **Hazard yellow is disciplined.** One color, one role. Accents on punctuation periods, the primary CTA, hover states, and the one place per page it can support a phrase.
- **Halftone treatment is sitewide and free.** Every portrait, reel poster, and product image gets the radial-dot mix-blend treatment. Hover reveals color. No PNG masks, all CSS.
- **Static export is real.** No server. Build outputs to /out. Forms work in production because they POST cross-origin to formsubmit.co.
- **Accessibility groundwork.** Skip link, ARIA labels on nav and sections, focus-visible outlines (hazard), reduced-motion respected, semantic landmarks throughout.
- **Content separation.** Every page reads from typed `content/*.ts` files. Editing copy is a one-file change with no template hunting.
- **Bumpers do their job.** The home now reads like a thing with a personality, not a portfolio shell.

## Issues — flagged

### Content / authenticity
- **Stats are unverified.** "50+ shows / 20+ comedians / 5,000+ tickets / 8+ venues" is preserved verbatim but not fact-checked. Currently absent from home; will resurface if added back.
- **Testimonials read corporate.** "Marcus T. / The Anchor Taproom" etc., they were preserved verbatim but read like stock filler. Removed from home; if real, deploy them on /services or a /press page.
- **Sponsor stats are unverified.** "1,200+ in-room / 85K+ social / 30K+ video views" on /sponsor. Not flagged in copy.
- **Sponsorship one-sheet is a .txt file, not a PDF.** Calling it a "Sponsorship One-Sheet" download sets PDF expectations.
- **Member bios are absent.** Just name + role per person. Working but thin.

### Open content holes
- **Xavier Rake's full special has no video.** The poster shows on /shows and /watch, the play button has no target. `content/shows.ts → featuredSpecial.videoUrl` is null and flagged.
- **Show calendar is empty.** Empty-state copy is preserved verbatim. Real shows need to be added to `content/shows.ts → upcomingShows`.
- **YouTube channel grid is missing.** /watch shows the featured special and 2 hardcoded Instagram reels. The original site pulled YouTube via `/api/youtube` server-side; static export can't do that. Either: (a) hardcode a list of YouTube videos in `content/watch.ts`, or (b) embed an iframe of the channel, or (c) drop the channel grid.
- **15 of 18 shop products lack images.** Only Metal Goose, LOGO Hoodie, and Sick Hat have product imagery. The rest render with a single-letter placeholder. Fourthwall image URLs need pasting into `content/shop.ts`.

### Design / UX
- **Cover video file is in /public but unused.** `covervideo.mp4` ships in the export but the hero now uses solid black. Either delete it or wire it into a dedicated reel page.
- **Hero is text-only.** No imagery, no video, no portrait/poster. Intentional after the design pass, but worth noting if you want to add a single restrained visual element.
- **Stats band, testimonials, sponsors block, contact block were removed from home.** Each lives only on its dedicated page now. If a visitor doesn't click through, they don't see them. Tradeoff was made for clarity over completeness.
- **No 'About / Mission' page.** Members page covers the team; there's no narrative page about the company itself. May or may not be needed.
- **Shop placeholder cards are visually inconsistent.** The 15 letter-only cards next to 3 photographed products is jarring. Either fill in the missing images or hide the placeholder products until imagery exists.
- **Reels are an iframe-less link.** Clicking a reel poster opens Instagram in a new tab. Could embed the reel inline (Instagram Embed Script) or play in a modal, neither is wired up.
- **404 copy mentions "the special"** (a film-industry word). Charming, but slightly out of register if "special" is also Xavier Rake's actual product on the site.

### Technical / debt
- **Forms have no spam protection.** `_captcha: false` is set on every form. Easy to spam. Add Cloudflare Turnstile or formsubmit's honeypot at minimum.
- **No analytics.** No GA, Plausible, Vercel Web Analytics, or anything. Add before launch.
- **No sitemap.xml.** `/robots.txt` exists but `sitemap.xml` was in the old build and didn't get rebuilt. Should be regenerated for SEO.
- **No 404 redirects.** Old /about → new /members, old /media → new /watch, old /comic-submissions → new /submit, old /sponsorships → new /sponsor, old /book-a-show → new /services. Static export can do these via `next.config.mjs` redirects but they're not configured. Anyone sharing an old URL will hit the 404.
- **Lighthouse not run.** Targets in the README say 90+ across categories but no run has been logged.
- **Unused files:** `/images/misc/logo.png` and `/images/misc/stage.png` ship in the build but aren't referenced.
- **Image not used for Fourthwall product images.** Shop uses raw `<img>` tags because they're external CDN. Fine for static export but throws an ESLint warning at build time.
- **No OG image per page.** All pages share the site default `/opengraph.jpg`. Pages like /members, /comedians, individual services could benefit from custom OG cards.
- **No structured data per page.** LocalBusiness schema is in the root layout. Service detail pages could carry Service schema; Shows could carry Event schema.

### Brand / tone
- **Bumper humor is one-note.** Three bumpers, all in the same Adult Swim register. Works once; if you scroll the home twice in a session it might wear. Consider rotating bumper copy or making one of them seasonal.
- **`live. local. comedy.` tagline appears twice.** Once in the marquee, once in the hero baseline-aligned right column. Not a bug, but noticeable.
- **No mission statement anywhere.** What Stoned Goose Productions stands for, beyond "comedy in Olympia," isn't captured in copy.
- **Comedian roster framing is "Our Friends".** Casual and on-brand, but ambiguous: are these booked-by-us comics, friends-of-Kyle, or both? A 1-line subhead under "Our Friends" could clarify.

## Quick wins (sorted by effort)

| Effort | Win |
|---|---|
| 1 min | Delete `covervideo.mp4` from `/public` (cuts export size) |
| 2 min | Delete unused `logo.png`, `stage.png` |
| 5 min | Add `redirects()` in `next.config.mjs` for old route slugs |
| 10 min | Wire formsubmit honeypot or Turnstile |
| 15 min | Run Lighthouse on `/out` and log results in README |
| 15 min | Fill in 15 missing Fourthwall product images |
| 20 min | Add per-page OG images (or per-page metadata description at minimum) |
| 30 min | Drop in Xavier Rake video URL → wire play button to YouTube embed modal |
| 30 min | Add Plausible or Vercel Analytics |
| 1 hr | Hardcode a list of YouTube videos for the /watch channel grid |
| 1 hr | Generate `sitemap.xml` (Next has a built-in `sitemap.ts` convention) |
| 2 hr | Embed Instagram reels inline instead of linking out |
