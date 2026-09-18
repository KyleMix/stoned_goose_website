# Site simplification: audit, research, and proposal

Status: **Phase 1 and Phase 2 complete. Awaiting approval before any code changes.**

Goal restated: the site exists to get Stoned Goose work. Every page leads toward
contacting us. The two supporting jobs are showing our people and showing what
we are working on now. Anything else comes off the homepage.

---

# Phase 1. Audit

## 1.1 Route map

| Route | File | Purpose |
|---|---|---|
| `/` | `app/(site)/page.tsx` | Homepage |
| `/shows` | `app/(site)/shows/page.tsx` | Show calendar |
| `/open-mics` | `app/(site)/open-mics/page.tsx` | Open Mic Explorer app announcement |
| `/open-mics/map` | `.../map/page.tsx` | The PNW mic map (Leaflet) |
| `/open-mics/privacy`, `/open-mics/terms` | `.../privacy`, `.../terms` | App store required |
| `/open-mics/delete-account` | `public/open-mics/delete-account/index.html` | Google Play required |
| `/watch` | `app/(site)/watch/page.tsx` | Video |
| `/roster` | `app/(site)/roster/page.tsx` | Crew + comics |
| `/roster/[slug]` | `.../[slug]/page.tsx` | Comedian EPK. **Generates zero pages today** |
| `/book` | `app/(site)/book/page.tsx` | Booking funnel |
| `/book/[slug]` | `.../[slug]/page.tsx` | 4 service briefs (1 draft) |
| `/shop`, `/shop/[slug]` | `app/(site)/shop/...` | Fourthwall merch |
| `/contact` | `app/(site)/contact/page.tsx` | Contact page + form |
| `/[slug]` | `app/(site)/[slug]/page.tsx` | CMS "extra pages" |
| `/_calendar` | `app/(site)/_calendar/` | Unpublished (leading underscore) |
| `/admin` | `public/admin/` | Sveltia CMS |

## 1.2 Homepage sections, in render order

Counting only bands that actually render today:

| # | Band | Component | Note |
|---|---|---|---|
| 0 | Header ticker | `nav.tsx` | **Next show, instance 1 of 3** |
| 1 | Hero | `hero.tsx` | Primary CTA is "Browse Shows". **Show instance 2 of 3** |
| 2 | Word marquee | `marquee.tsx` | 9 scrolling words |
| 3 | Bumper: clarification | `rotating-bumper.tsx` | "Disclosure / we made it on purpose" |
| — | `topSections` | `section-renderer.tsx` | Empty in CMS |
| 4 | Shows | `upcoming-shows-block.tsx` | **Show instance 3 of 3** |
| 5 | Open Mic Explorer | `open-mic-teaser.tsx` | 4 mics, ivory |
| 6 | Video grid | `video-strip.tsx` | 5 clips |
| 7 | Latest social feed | `latest-strip.tsx` | 6 tiles |
| 8 | Bumper: aside | `rotating-bumper.tsx` | "There is more to this than shows. See the menu." |
| 9 | Services | `services-overview.tsx` | "We do four things", ivory |
| 10 | Shop | `shop-strip.tsx` | 3 products |
| — | Press | `press-strip.tsx` | **Renders nothing**, press array is empty |
| — | Mission | inline in `page.tsx` | **Renders nothing**, `show: false` |
| 11 | Newsletter | `mailing-list-capture.tsx` | ivory |
| — | `bottomSections` | `section-renderer.tsx` | Empty in CMS |
| 12 | Bumper: outro | `rotating-bumper.tsx` | "More shows on the calendar." |

**12 rendered bands plus the header ticker. Zero contact form. One booking
link, buried as tertiary hero text ("Book Us ↗") and as "Or just email us ↗"
at the bottom of the services band.**

## 1.3 Your known problems, checked against the code

| Claim | Verdict | Evidence |
|---|---|---|
| Nav hidden behind MENU **even on desktop** | **Partly wrong, but the instinct is right** | `components/nav.tsx:138` renders `<nav className="hidden items-center gap-6 md:flex">`. The links **do** render at ≥768px; the MENU button is `md:hidden` and only exists below 768px. The PDF you sent was printed at page width (612pt), which is why it shows only MENU. The real defect is that the desktop nav is 11px, `letter-spacing: .26em`, `text-smoke` (#8C8781), wedged between the wordmark and the cart button, with a meaningless `01`–`06` in front of every label. It renders; it does not read. |
| Nav text tiny and widely tracked | **Confirmed** | `.t-eyebrow` is `font-size: 11px; letter-spacing: .26em` (`app/globals.css:118`). |
| `/01 /02 /03` numbering everywhere | **Confirmed, 10 places** | `nav.tsx:155`, `nav.tsx:241`, `services-overview.tsx:34`, `book/page.tsx:117`, `book/[slug]/page.tsx:166,265,335`, `roster/page.tsx:89` (pillars), `roster/page.tsx:125` (crew, via `m.index`), `site/not-found-content.tsx:102`. |
| Tiny tracked labels used for body-level info | **Confirmed** | `.t-eyebrow` currently carries: every button label, every "↗" link, all footer contact lines (email, phone, city), every form field label, the nav, the ticker, and the comics' IG/FB links. |
| Footer: 7 Explore links, "Open Mic Map" vs "The App" duplication, stray "Tickets." period | **Confirmed** | `content/site/index.json`. Note: `/open-mics/map` and `/open-mics` are genuinely two different pages, but the labels do not tell you that. |
| Ticker + hero + shows all repeat Oct 17 | **Confirmed** | One show in the feed: Lukas McCrary, Eagle's Grand Ballroom, Sat Oct 17 2026, 7pm PT. Rendered three times. |
| `/book` has five in-page jump links and five ways to do one thing | **Confirmed** | Anchor row (`book/page.tsx:44-83`) + `BookPlanner` (call embed + estimator) + All services + Sponsor tiers + Quote form + `StickyQuoteRail`. |
| "BOOK A FREE INTROCALL" | **Confirmed, and I found the cause** | `components/book-planner.tsx:89-92`: `<span ...>intro</span>{""}call.` The `{""}` between the span and `call` swallows the JSX whitespace. |
| 3 services on `/book`, 4 on the homepage | **Confirmed** | `film-your-comedy-set` has `draft: true`. `/book` filters drafts (`book/page.tsx:105`); `services-overview.tsx:29` does not, and the heading hardcodes "We do four things." |
| Sticky bottom bar on `/book` | **Confirmed** | `StickyQuoteRail` is always mounted, on top of the anchor row and three other CTAs. |
| Sponsors live on `/book` and also have a footer link | **Confirmed** | Footer "Sponsor a Show" → `/book#sponsors`. |
| Roster "Four Pillars" describes departments a 5-person team lacks | **Confirmed** | `content/roster-copy/index.json`: Production & Ops, Media Team, Community & Partners, Creative Lab. |
| Crew layout wastes space | **Confirmed** | `roster/page.tsx:118-160`. A 12-column row: number in col 1, a 220px photo in cols 2-4, name/role/bio in cols 5-12. **Every member's `bio` is empty**, so the right eight columns are blank on all five rows. Your PDF page 5 shows exactly this. |
| Crew titles wrong | **Confirmed** | Kyle Mixon "Founder & Producer & Media", Joseph Humphrey "Founder & Producer", Brendan Meeks "Founder & Producer", Samuel Tweed "Producer", Garrett Iverson "Producer". |
| ~40 comics, long 3-column scroll, tiny IG/FB | **Close.** It is **32** comics, not 40. Grid is 2/3/4/5 columns by breakpoint at `aspect-[3/4]`. The IG/FB links are 11px `.t-eyebrow`, and on desktop they sit in a **hover-reveal overlay** that is invisible until hover or keyboard focus. |

## 1.4 Things you did not list that I found

1. **`/roster/[slug]` generates zero pages.** `hasEpk` requires a `bio` or
   `reelUrl`; no comedian has either, so all 32 are false. The "EPK ↗" link
   never renders and the route produces nothing. Dead path.
2. **`images.unoptimized: true`** (`next.config.mjs`). In a static export
   next/image emits **no `srcset`**, so the `sizes` prop on every image on the
   site is inert. Every browser downloads the full 1000px-wide source file.
   `/roster` ships 32 portraits at 40-120KB each, roughly 2.3MB of images, with
   no responsive variants. This matters for the roster grid work.
3. **`PressStrip` renders nothing** (the `press` array is empty) but is mounted
   on both `/` and `/book`.
4. **`/contact` already exists** with a working form, and the homepage never
   links to it except via "Or just email us ↗" at the foot of the services band.
5. **Two different contact forms with two different schemas**: `contact`
   (name, email, message) on `/contact`, and `generalQuote` (serviceType\*,
   email\*, name, eventDate, budget, venueSize) on `/book`.
6. **Spam protection today is a honeypot only** (`_honey`), in both
   `contact-form.tsx` and `mailing-list-capture.tsx`. `_captcha` is explicitly
   set to `"false"`.
7. Three CMS-driven slots on the homepage (`topSections`, `bottomSections`,
   `mission`) are configured and render nothing.
8. **The homepage's single loudest button points away from the business goal.**
   The gold hero CTA is "Browse Shows" → `/shows`.

## 1.5 Where the form submits

Both forms POST JSON to:

```
https://formsubmit.co/ajax/kyle@stonedgooseproductions.com
```

Payload: `_subject`, `_captcha: "false"`, `source`, `referrer`, plus the field
values. No API key, no server, no database. Every lead arrives as an email to
`kyle@stonedgooseproductions.com`. That is the whole pipeline.

## 1.6 Research

One caveat first: the network proxy in this session blocks direct page fetches,
so these takeaways come from search-result summaries of the cited pages rather
than full-text reads. Worth a spot-check on anything you want to lean on hard.

Only findings that change a decision here are listed.

1. **[NN/g, Hamburger Menus and Hidden Navigation Hurt UX Metrics](https://www.nngroup.com/articles/hamburger-menus/)**
   (179 participants, 6 sites, phone and desktop). Hiding the main nav cuts
   discoverability roughly in half, increases task time, and increases perceived
   difficulty. → Desktop nav must be visible. Confirms the direction even though
   this site's desktop nav technically already renders.
2. **[NN/g, Beyond the Hamburger: Desktop](https://www.nngroup.com/articles/find-navigation-desktop-not-hamburger/)**
   On desktop a hamburger occupies a tiny fraction of a large page, so it is
   ignored *more* than on mobile. → Never move desktop nav behind an icon, and
   do not let a visible nav shrink to hamburger-sized visual weight, which is
   what 11px smoke text is doing.
3. **[NN/g, 5 Tips for Avoiding Confusing Category Names](https://www.nngroup.com/articles/category-names-suck/)**
   and **[Better Link Labels](https://www.nngroup.com/articles/better-link-labels/)**
   Findability is maximized by old, well-known words; lead with the
   information-carrying word. → "Book Us" is good (plain verb, states the
   action). "Roster" is comedy-industry insider language for a client. "About"
   is the well-known word. This is the argument for the rename.
4. **[NN/g, Homepage Design: 5 Fundamental Principles](https://www.nngroup.com/articles/homepage-design-principles/)**
   and **[Top 10 Guidelines for Homepage Usability](https://www.nngroup.com/articles/top-ten-guidelines-for-homepage-usability/)**
   A homepage must communicate who you are and what you do within about 10
   seconds, and should link to an About Us section. → The current hero says
   "Crafting cinematic stand-up, curated showcases, and comedy chaos across your
   city," which does not say five people, Olympia, or production company.
5. **[NN/g, The Fold Manifesto](https://www.nngroup.com/articles/page-fold-manifesto/)**
   ~80% of viewing time is above the fold; people scroll further only if what is
   above promises value. → The above-fold real estate is currently spent on a
   tagline and a "Browse Shows" button.
6. **[Unbounce, the psychology of choice](https://unbounce.com/conversion-rate-optimization/psychology-of-choice-conversion-rates/)**
   and **[MetriFi, repeating your call to action](https://metrifi.com/blog/research-shows-if-you-repeat-your-call-to-action-more-people-will-convert/)**
   These sound contradictory and are not. Many *different* CTAs on one page
   dilute and cause choice paralysis; repeating *one* CTA down a long page lifts
   conversion. → One ask ("book us"), repeated at hero, mid-page, and page foot.
   Kill the competing asks: five jump links and a sticky rail on `/book` is the
   textbook dilution case.
7. **[Baymard, mark required and optional fields explicitly](https://baymard.com/blog/required-optional-form-fields)**
   Most forms carry roughly twice the fields they need; marking both required
   and optional removes ambiguity and cuts validation errors. → 3 required
   fields, 1 explicitly optional, both marked.
8. **[WCAG 2.2 SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)**
   AA is 24×24 CSS px with five exceptions; **44×44 is SC 2.5.5, Level AAA**.
   → Your 44px requirement is the AAA bar. I will hold it for nav, buttons, and
   the comics' social icons. Worth knowing you are asking for above-AA.
9. **[BOIA, all-caps headings](https://www.boia.org/blog/all-caps-headings-are-they-bad-for-accessibility)**
   and **[Stanford, All Caps](https://uit.stanford.edu/accessibility/learn-about/typography/all-caps)**
   All-caps slows every reader because word shape recognition is lost; reserve
   it for short labels. → Keep uppercase for headlines and true eyebrows. Stop
   using it for nav links, contact details, and form labels, which are content.
10. **[web.dev, Responsive images](https://web.dev/learn/design/responsive-images)**
    `sizes` only does anything if `srcset` exists; reserve space with
    width/height or `aspect-ratio` to protect CLS; lazy-load below the fold and
    never lazy-load the LCP image. → Because this export runs `unoptimized`,
    the fix for the roster grids is **smaller source files**, not a better
    `sizes` string. I will still set `sizes` correctly so it works the day
    optimization is enabled.
11. **[Cloudflare, Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)**
    Siteverify is mandatory and there is no static-site exemption. → **Turnstile
    cannot be implemented on this site as built.** There is no server route;
    `wrangler.jsonc` deploys `/out` as Workers Static Assets, and CLAUDE.md
    forbids adding a Next adapter. See the decision in 2.2.6.

---

# Phase 2. Proposal

## 2.1 Sitemap and navigation

### Recommended primary nav: 4 links plus 1 button

```
STONED GOOSE.        SHOWS   ABOUT   OPEN MICS   WATCH      [ BOOK US ]   (cart)
```

Changes from today:

- **Drop Shop from the primary nav** into the footer. It sells to fans, not
  clients. It is the only nav item that serves neither the business goal nor
  the two supporting jobs, and the cart button already lives in the header for
  anyone mid-purchase.
- **Drop "Book Us" as a text link and promote it to the gold button.** It is
  the site's one ask; it should not look like the other four.
- **Remove the `01`–`06` prefixes.**
- **Remove the header ticker bar.** It is repeat 1 of 3 of the same show.

### Recommendation: rename `/roster` to `/about`, label it "About"

I am recommending this, with these reasons:

1. "Roster" is insider language. A venue manager or an events coordinator does
   not scan for "roster"; they scan for "about". NN/g's finding on well-known
   vs. invented category names applies directly.
2. The page already *is* an about page. It carries `aboutCopy.heading` set to
   "About the Team", the pillars, the crew, and the comics.
3. NN/g's homepage guidelines call for an About Us link from the homepage. If
   the destination is called "Roster", the strongest word on the site goes
   unused.
4. `/about` already exists as a 308 redirect **to** `/roster`. We reverse the
   arrow. The cost is one redirect rule, not a new page.

Risk: comics who bookmarked `/roster`. Covered by a 308.

If you would rather not rename, the fallback is keeping `/roster` and labelling
it "About" in the nav, which is worse (the URL and the label disagree) but is a
one-line change to undo later.

### Mobile

```
STONED GOOSE.                  [ BOOK US ]   ☰
```

- The Book Us button stays **outside** the menu at every width, minimum 44px
  tall, gold on tuxedo.
- The hamburger holds the four secondary links plus Shop, at `text-2xl` with
  full-width 56px rows (already close to this today).
- The mobile panel's "Tickets." button becomes "See upcoming shows".

### Footer

Three columns become two plus a contact block:

```
Pages                 Work with us            [lockup]
  Shows                 Book us               Olympia, WA
  About                 Sponsor a show        kyle@stonedgooseproductions.com
  Open Mics                                   (360) 323-0667
  Open Mic Explorer app
  Watch
  Shop
```

- "Open Mic Map" and "The App" become "Open Mics" (`/open-mics/map`) and
  "Open Mic Explorer app" (`/open-mics`), so the labels say what differs.
- "Tickets." drops the stray period and merges into "Shows".
- "Contact" as a footer link goes away; the contact details are right there,
  and the site's contact destination is `#contact` on the homepage.
- Contact lines move from 11px `.t-eyebrow` to body-size sentence case, and
  become real `mailto:` and `tel:` links with 44px tap targets.

### The type problem, and a decision I need from you

`.t-eyebrow` is 11px at `.26em` tracking. CLAUDE.md is explicit that this role
is for eyebrows and labels, and equally explicit that there is no sixth role
without asking the brand. Today `.t-eyebrow` is doing the work of nav links,
buttons, inline links, contact details, and form labels, which is the readability
problem you flagged.

**I am asking for a sixth role rather than bending the five.** Proposed:

```
.t-ui   Regular 400, uppercase, 14px, letter-spacing .08em
        ivory on tuxedo, tuxedo on ivory, gold on hover and active
```

Used for: nav links, button labels, inline "↗" links, form field labels, tab
and chip labels. `.t-eyebrow` goes back to being only an eyebrow. Contact
details and captions move to `.t-body` (sentence case), which needs no new role.

This is a brand decision, not a taste call. **It needs your yes before I touch
`globals.css`.**

## 2.2 New homepage

### Before and after

| | Before | After |
|---|---|---|
| Rendered bands | **12** (plus header ticker) | **7** |
| Times the next show appears | **3** | **1** |
| Filler / bumper bands | **3** | **0** |
| Contact forms on the page | **0** | **1** |
| Distinct CTAs above the fold | 4 (Browse Shows, Find a mic, Book Us, Get tickets) | **1** primary, 1 secondary |

### The order

| # | Section | Purpose | Surface |
|---|---|---|---|
| 1 | **Hero** | Who we are, where, what we do, in two sentences. One gold CTA: Book us. | Tuxedo |
| 2 | **About us** | Plain-language paragraph. The thing the site currently does not have. | Ivory |
| 3 | **What we do** | Four services, one line each, no numbering. Links to the briefs. | Tuxedo |
| 4 | **What we're working on** | 2-3 cards: next show, latest video, Open Mic Explorer. Current work, once each. | Tuxedo |
| 5 | **Who we work with** | Crew strip (5 portraits) + comics strip (12 of 32). Links to /about. | Ivory |
| 6 | **Contact** | The destination. Short form, email, phone, intro-call link. | Tuxedo |
| 7 | **Newsletter** | Slim, visually secondary. | Ivory |

Then the footer.

### 2.2.1 Above the fold

```
┌──────────────────────────────────────────────────────────┐
│ STONED GOOSE.   SHOWS ABOUT OPEN MICS WATCH   [BOOK US]  │
├──────────────────────────────────────────────────────────┤
│ OLYMPIA, WASHINGTON                                      │
│                                                          │
│ STONED GOOSE                                             │
│ PRODUCTIONS.                                          ╭─ │
│ ─────────────────────────────────────────────────    │   │
│                                                      │   │
│ We are a five-person comedy production company in    │   │
│ Olympia, Washington. We produce live stand-up across │   │
│ the South Sound, and we shoot, record, and publish   ╰─  │
│ what comes out of it.                                    │
│                                                          │
│ [ BOOK US  → ]      See upcoming shows ↗                 │
└──────────────────────────────────────────────────────────┘
```

- Primary gold button "Book us" jumps to `#contact` on the same page. Not to
  `/book`: the research on repeated single CTAs says keep the ask on the page
  the visitor is already on, and `/book` remains the destination for anyone who
  wants the call.
- Secondary is a plain text link to `/shows`. **The next show itself appears
  once, in section 4.** You wrote both "next show can appear here as a secondary
  link" and "the next show shown ONCE on the page"; I read the second as the
  binding constraint. Say the word if you want the date and venue in the hero
  instead and I will move the card out of section 4.
- The `MonocleRing` stays in the hero (one per section, enforced by
  `scripts/test/monocle-ring.test.ts`).
- "lights on. jokes loaded." moves to the footer or retires. It is a good line
  but it is occupying the position where the value proposition belongs.

### 2.2.2 About us, draft copy

**DRAFT. For your review. No invented stats, venues, clients, or claims.**

> **ABOUT US**
>
> Stoned Goose Productions is a five-person comedy production company based in
> Olympia, Washington. We started in January 2025.
>
> We produce live stand-up across Olympia, Lacey, Tacoma, and the wider South
> Sound. That means booking the lineup, running the room, and handling the parts
> of a show an audience is never supposed to notice. We also work on camera and
> behind a microphone, producing video and podcasts for comics and for the
> people who hire us.
>
> The Open Mic Explorer is ours too: a map and an app that tracks open mics
> across the Pacific Northwest, and the video series that goes with it.
>
> If you have a room, an event, or a project that needs comedy in it, talk to us.
>
> [ Meet the crew ↗ ]

Facts used: five people, founded January 2025, Olympia WA, Olympia/Lacey/Tacoma/
South Sound, on-camera production, podcasts, Open Mic Explorer series and map.
Nothing else. No em dashes.

### 2.2.3 What we do

Four rows, title plus one line, no `/01`, linking to `/book/[slug]`:

```
LIVE SHOW PRODUCTION      End to end production for comedy shows across the South Sound.   ↗
FILM YOUR COMEDY SET      Multi-cam capture, clean audio, edited video you can post.       ↗
MEDIA & PODCASTS          Audio and video production for comedians and brands.             ↗
COLLABORATION             Got a project that needs a comedy partner? Pitch us.             ↗
```

**This forces a decision.** `film-your-comedy-set` is currently `draft: true`,
which is why `/book` shows three and the homepage shows four. Two options:

- **A (recommended): publish it.** Set `draft: false`. Both pages show four,
  `/book/film-your-comedy-set` enters the sitemap, and the homepage heading
  "We do four things" becomes true. The brief content already exists.
- **B: keep it draft.** Both pages show three, and the heading becomes "We do
  three things."

Either way, `ServicesOverview` starts filtering drafts so the two can never
drift again.

### 2.2.4 What we're working on

One band, three cards, replacing four current bands (shows, open mics, video,
social feed):

```
┌────────────────────┬────────────────────┬────────────────────┐
│ NEXT SHOW          │ LATEST ON THE      │ OPEN MIC EXPLORER  │
│                    │ CHANNEL            │                    │
│ Sat, Oct 17        │ [thumbnail]        │ [map thumbnail]    │
│ Lukas McCrary Live │                    │                    │
│ in Olympia         │ <video title>      │ Every open mic in  │
│ Eagle's Grand      │                    │ the Pacific        │
│ Ballroom, Olympia  │ Watch ↗            │ Northwest, mapped. │
│                    │                    │                    │
│ Get tickets ↗      │ All videos ↗       │ Open the map ↗     │
└────────────────────┴────────────────────┴────────────────────┘
```

- Show data comes from `upcomingShows[0]`, exactly as today. When the calendar
  is empty the card collapses and the row becomes two cards, reusing the
  existing graceful-degradation logic in `upcoming-shows-block.tsx`.
- The 6-tile social feed strip retires from the homepage. It already lives on
  `/watch`, and "latest Instagram post" is not what a hiring client needs.

### 2.2.5 Who we work with

```
WHO WE WORK WITH

THE CREW
[ ] [ ] [ ] [ ] [ ]        five 4:5 portraits, name + title under each
Kyle  Joseph  Brendan  Samuel  Garrett

COMICS WE HAVE BOOKED
[ ][ ][ ][ ][ ][ ]         twelve 4:5 portraits, name under each
[ ][ ][ ][ ][ ][ ]

                           [ See everyone ↗ ]  → /about
```

Both pull from the same CMS collections the `/about` page uses
(`content/.generated/members-index.json`, `comedians-index.json`). No duplicated
content; the homepage just slices.

### 2.2.6 Contact section

This is the page's destination and gets the most vertical space of any section
below the hero.

```
┌─────────────────────────────┬────────────────────────────────┐
│ BOOK US                     │  Your name *                   │
│                             │  ____________________________  │
│ Tell us what you are        │                                │
│ planning and we will come   │  Email *                       │
│ back within two business    │  ____________________________  │
│ days.                       │                                │
│                             │  What are you planning? *      │
│ kyle@stonedgoose...com      │  ____________________________  │
│ (360) 323-0667              │  ____________________________  │
│                             │                                │
│ Prefer to talk?             │  Date (optional)               │
│ Book a free 15-minute       │  ____________________________  │
│ intro call ↗                │                                │
│                             │  [ SEND IT  → ]                │
└─────────────────────────────┴────────────────────────────────┘
```

**Fields: 3 required, 1 optional.** Name, Email, What are you planning
(textarea). Date optional. Required marked with `*`, optional marked
"(optional)", per Baymard. That is the minimum that lets you reply usefully
without a follow-up email.

- Built as **one shared component**, `<BookingEnquiry />`, wrapping the existing
  `ContactForm`. Used on the homepage `#contact` and on `/book`. One component,
  one schema, one success message.
- **Submits to the existing endpoint**: `https://formsubmit.co/ajax/kyle@stonedgooseproductions.com`,
  same as every other form on the site. Nothing new to configure or pay for.
- Success: "Got it. We read every one of these. You will hear back within two
  business days." (`role="status"`)
- Error: "That did not send. Email kyle@stonedgooseproductions.com and we will
  pick it up there." (`role="alert"`, with the address as a live mailto link)

**Spam protection: Turnstile is not possible here.** Cloudflare requires a
server-side `siteverify` call and there is no exemption for static sites. This
site is `output: "export"` deployed as Workers Static Assets with no server
runtime, and CLAUDE.md forbids adding a Cloudflare Next adapter. Two options:

- **A (recommended): honeypot plus a time trap.** Keep the existing `_honey`
  field, and reject submissions that arrive less than ~2.5 seconds after the
  form is first touched. Zero dependencies, zero cost, no user friction, no
  accessibility cost. Catches the overwhelming majority of naive bot traffic,
  which is what a small business contact form actually faces.
- **B: add a Cloudflare Worker route.** A small Worker sitting alongside the
  static assets that accepts the POST, calls `siteverify`, and forwards to
  formsubmit. This is real Turnstile, and it is also the first server-side code
  in this project. It needs its own secret, its own deploy path, and a change to
  `wrangler.jsonc`. **This is your call.**

I will build A unless you say otherwise, and I will structure the submit handler
so B can be dropped in later without touching the form component.

### 2.2.7 Newsletter

Stays, but drops from a full ivory band with a display headline to a slim strip:
one line of body text, one input, one text-button. No gold fill, no
display-size type. It must not compete with the section above it.

### 2.2.8 Removed from the homepage

Header ticker · word marquee · all three rotating bumpers (clarification,
aside, outro) · the full services list (replaced by the compact four-line
version) · the merch grid · the social feed strip · the press strip (renders
nothing) · the mission block (off).

The bumper *content* stays in the CMS. The `RotatingBumper` component stays in
the tree. I am removing the three homepage mount points, not deleting the
system, so you can put one back on `/watch` or `/shows` if you miss it.

## 2.3 New `/book`

One primary path, one secondary path.

| | Before | After |
|---|---|---|
| Sections | 6 | 4 |
| In-page jump links | 5 | 0 |
| Sticky bars | 1 | 0 |
| Distinct CTAs | 7+ | 2 |

```
1. PAGE HEADER        "Book us."  +  [ BOOK A FREE INTRO CALL ]  Send us the details ↓
2. INTRO CALL         Cal.com embed. Headline typo fixed.
3. WHAT WE DO         Same four services as the homepage. No numbering.
4. CONTACT FORM       The identical <BookingEnquiry /> from the homepage.
   SPONSOR STRIP      Logos only, and only when real sponsors exist.
```

**Build Your Show: recommend removing it.** It is a third path to the same
conversation, its own copy calls the result "ballpark only", and it exists to
prefill a notes field on a call the visitor could just book. The intro call does
this job with a human in it. If you want to keep it, the least harmful home is
its own page at `/book/planner`, linked as one text line under the form ("Not
sure what you need? Try the planner"). It should not sit between the call and
the form.

**Sponsor tiers: recommend moving to `/sponsor`.** It is a different audience
(a business buying visibility, not a client buying production), the footer link
already implies the page exists, and it is currently the reason `/book` has five
sections. `/sponsor` gets the three tiers, the "want the one-sheet" block, the
sponsor logo strip, and its own copy of `<BookingEnquiry />` with the subject
line changed.

**Sticky rail: remove.** With the form on the page and two buttons in the header,
it is a third simultaneous ask and it covers content at the bottom of a phone
screen.

## 2.4 New `/about` (was `/roster`)

Order: page header → About the company → The crew → Comics we have booked →
Contact CTA.

**Four Pillars: removed.** Replaced with one honest sentence in the About block:

> There are five of us. We produce the shows, shoot the video, cut the audio,
> and answer the email.

### Crew titles

| Name | Current | Proposed |
|---|---|---|
| Kyle Mixon | Founder & Producer & Media | **Co-Founder & Producer** |
| Joseph Humphrey | Founder & Producer | **Co-Founder & Producer** |
| Brendan Meeks | Founder & Producer | **Co-Founder & Producer** |
| Samuel Tweed | Producer | **Producer** |
| Garrett Iverson | Producer | **Producer** |

Open question: Kyle's current title carries "& Media". Do you want that kept
(e.g. "Co-Founder, Producer & Media") or dropped for consistency? I will drop it
unless you say otherwise.

### Crew grid, desktop (≥1024px)

```
┌──────────────────────────────────────────────────────────────────┐
│ THE CREW                                                         │
│ There are five of us. We produce the shows, shoot the video,     │
│ cut the audio, and answer the email.                             │
│                                                                  │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│ │        │ │        │ │        │ │        │ │        │          │
│ │  4:5   │ │  4:5   │ │  4:5   │ │  4:5   │ │  4:5   │          │
│ │  B&W   │ │  B&W   │ │  B&W   │ │  B&W   │ │  B&W   │          │
│ │        │ │        │ │        │ │        │ │        │          │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘          │
│ KYLE MIXON JOSEPH HU.. BRENDAN M.. SAMUEL TW. GARRETT IV.        │
│ Co-Founder Co-Founder  Co-Founder  Producer   Producer           │
│ & Producer & Producer  & Producer                                │
└──────────────────────────────────────────────────────────────────┘
```

### Crew grid, phone (375px)

```
┌────────────────────────┐
│ THE CREW               │
│ There are five of us.  │
│ We produce the shows,  │
│ shoot the video, cut   │
│ the audio, and answer  │
│ the email.             │
│                        │
│ ┌─────────┐ ┌────────┐ │
│ │         │ │        │ │
│ │   4:5   │ │  4:5   │ │
│ │         │ │        │ │
│ └─────────┘ └────────┘ │
│ KYLE MIXON  JOSEPH     │
│ Co-Founder  HUMPHREY   │
│ & Producer  Co-Founder │
│             & Producer │
│                        │
│ ┌─────────┐ ┌────────┐ │
│ │   4:5   │ │  4:5   │ │
│ └─────────┘ └────────┘ │
│ BRENDAN     SAMUEL     │
│ MEEKS       TWEED      │
│ Co-Founder  Producer   │
│ & Producer             │
│                        │
│ ┌─────────┐            │
│ │   4:5   │            │
│ └─────────┘            │
│ GARRETT IVERSON        │
│ Producer               │
└────────────────────────┘
```

**Exact breakpoints:** `grid-cols-2` below 640px · `sm:grid-cols-3` at 640px ·
`lg:grid-cols-5` at 1024px. Five people land as 2+2+1 on phone, 3+2 on tablet,
5 across on desktop, which is the 3+2 you suggested at the tablet step and a
clean single row on desktop.

**Image treatment:** one aspect ratio, `4/5`, `object-cover` with
`object-position: 50% 25%` so faces sit in the upper-middle of the crop rather
than getting chinned off. Consistent `grayscale(1) contrast(1.05)` at rest with
**no hover-to-colour swap** (the current hover reveal is inconsistent between
crew and comics and reads as a bug on touch devices). This stays inside the
brand rule: photography as shot, in black and white, with no tint or overlay.

### Comics grid, desktop (≥1024px)

Denser than the crew so it reads as secondary.

```
┌──────────────────────────────────────────────────────────────────┐
│ COMICS WE HAVE BOOKED                                            │
│ Booked, produced, or platformed by Stoned Goose.                 │
│                                                                  │
│ ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐                            │
│ │4:5 ││4:5 ││4:5 ││4:5 ││4:5 ││4:5 │                            │
│ └────┘└────┘└────┘└────┘└────┘└────┘                            │
│ ALEXA  BRANDON BRUCE  CASEY  CHRIST. CLOE                        │
│ HANSEN WHITE   DETORE MCLAIN MATEO   NOMIC                       │
│ [ig][fb] [ig]  [ig][fb] [ig] [ig]    [ig][fb]                    │
│                                                                  │
│ ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐      ... 32 total          │
└──────────────────────────────────────────────────────────────────┘
```

### Comics grid, phone (375px)

```
┌────────────────────────┐
│ COMICS WE HAVE BOOKED  │
│ Booked, produced, or   │
│ platformed by Stoned   │
│ Goose.                 │
│                        │
│ ┌─────────┐ ┌────────┐ │
│ │   4:5   │ │  4:5   │ │
│ └─────────┘ └────────┘ │
│ ALEXA       BRANDON    │
│ HANSEN      WHITE      │
│ ⌗  ⌗        ⌗          │  ← 44×44 icon targets
│                        │
│ ┌─────────┐ ┌────────┐ │
│ │   4:5   │ │  4:5   │ │
│ └─────────┘ └────────┘ │
│ BRUCE       CASEY      │
│ DETORE      MCLAIN     │
│ ⌗  ⌗        ⌗          │
└────────────────────────┘
```

**Exact breakpoints:** `grid-cols-2` below 640px · `sm:grid-cols-3` at 640px ·
`md:grid-cols-4` at 768px · `lg:grid-cols-6` at 1024px. Six across on desktop
against the crew's five, with a smaller card and smaller name type, so the
hierarchy reads without a caption explaining it.

**Names:** 13px, uppercase, `.06em`, allowed to wrap to two lines with the
height reserved so the grid rows stay aligned. No truncation, no ellipsis. The
longest name in the set is "Jeremiah Hughes"; at six columns on a 1400px
container that is roughly a 205px cell, which fits on two lines comfortably.

**Social links:** the tiny "IG ↗ / FB ↗" text and the desktop hover-reveal
overlay both go. Replaced with inline SVG Instagram and Facebook glyphs, 20px
artwork centred in a 44×44 hit area, `aria-label="Alexa Hansen on Instagram"`,
**always visible at every breakpoint**. Note for CLAUDE.md compliance: two
hand-written SVG paths inline in a component is not an icon library, but the
rule says ask, so I am asking.

**The EPK link branch gets removed** until a comedian actually has a bio or
reel. It cannot render today and it will not until the CMS is filled in. The
`/roster/[slug]` route itself stays in place, moved to `/about/[slug]`, so the
day you write a bio the page appears.

**Images:** every portrait through `next/image` with `sizes` set to the real
rendered widths, `loading="lazy"` on everything below the fold, `priority` on
nothing in these grids, blur placeholders from the existing
`lib/placeholders.ts`, and a fixed `aspect-[4/5]` wrapper so nothing shifts.
Because `images.unoptimized` is on, I will also flag which source files are
oversized for their largest rendered size so you can run `npm run optimize:images`
against a tighter target. I am not changing `unoptimized` in this pass.

### Page foot

```
WANT THESE PEOPLE AT YOUR EVENT?

[ BOOK US  → ]      or email kyle@stonedgooseproductions.com
```

Jumps to `/#contact`.

## 2.5 Files and CMS collections I will change

### New files

- `components/booking-enquiry.tsx` — the one shared contact form
- `components/home/hero.tsx` (rewrite of `components/hero.tsx`)
- `components/home/about-block.tsx`
- `components/home/working-on.tsx`
- `components/home/who-we-work-with.tsx`
- `components/home/contact-block.tsx`
- `components/crew-grid.tsx`
- `components/comics-grid.tsx`
- `components/icons/social.tsx` — two inline SVGs
- `app/(site)/about/page.tsx`, `about/opengraph-image.tsx`, `about/[slug]/page.tsx`, `about/[slug]/opengraph-image.tsx`
- `app/(site)/sponsor/page.tsx`, `sponsor/opengraph-image.tsx`

### Edited

| File | Change |
|---|---|
| `app/(site)/page.tsx` | Rewritten to the 7-section order |
| `app/(site)/book/page.tsx` | Cut to 4 sections, sponsors removed, anchors and rail removed |
| `app/(site)/contact/page.tsx` | Kept, form swapped for the shared component |
| `app/globals.css` | Add `.t-ui` role (pending your approval) |
| `components/nav.tsx` | Numbers removed, Book Us button, ticker removed, `.t-ui` sizing |
| `components/footer.tsx` | New column structure, contact details to body size |
| `components/services-overview.tsx` | Numbers removed, drafts filtered, compact variant |
| `components/book-planner.tsx` | INTROCALL typo fixed; planner removed or moved per your call |
| `components/sticky-quote-rail.tsx` | Unmounted from `/book` (component kept) |
| `components/roster-teaser.tsx` | Folded into `comics-grid.tsx` |
| `components/site/not-found-content.tsx` | `/0N` numbering removed |
| `app/(site)/book/[slug]/page.tsx` | Three `/0N` numbering sites removed |
| `lib/navigation.ts` | `KNOWN_ROUTES`: `/roster` → `/about`, add `/sponsor` |
| `lib/schema.ts` | Breadcrumb labels; add `telephone` and `email` to the LocalBusiness node |
| `lib/form-schemas.ts` | Add `bookingEnquiry`; retire `generalQuote` |
| `app/(site)/sitemap.ts` | `/roster` → `/about`, add `/sponsor` |
| `content/site/index.json` | `nav` and `footer.columns` rewritten |
| `content/site.ts` | `DEFAULT_NAV` and `DEFAULT_FOOTER` matched to the above |
| `content/home/index.json` | Hero copy, new `about` block; bumper and marquee content retained but unmounted |
| `content/roster-copy/index.json` | `pillars` removed, `about.story` and `about.oneLine` added |
| `content/members/*/index.json` | Five `role` values updated |
| `content/services/film-your-comedy-set/index.json` | `draft` flag, per your decision |
| `content/sponsorships/index.json` | Unchanged; consumed by `/sponsor` instead of `/book` |
| `public/admin/config.yml` | See below |
| `public/_redirects`, `vercel.json` | See 2.6 |

### Deleted

- Nothing is deleted outright. `RotatingBumper`, `Marquee`, `StickyQuoteRail`,
  `LatestStrip`, `ShopStrip`, `PressStrip` and `BookPlanner` all stay in the
  repo and stay available as CMS section blocks. They are unmounted from the
  pages in question. That keeps the change reversible and keeps the CMS's
  `section_types` list working.
- The only genuine deletion is the `pillars` field and its four entries.

### CMS collection changes (`public/admin/config.yml`)

1. `roster_copy` → relabel "About page copy". **The file path
   `content/roster-copy/index.json` stays put**; renaming it would break any
   open `/admin` tab and buys nothing. Remove the `pillars` list field; add
   `about.story` (text, em-dash validator) and `about.oneLine` (string).
2. `site_content/home` → add an `about` object (eyebrow, heading, body) so the
   About copy is editable. Keep the `bumpers` and `marqueeWords` fields; they
   still drive the section blocks.
3. `site_content/site` → the `nav` and `footer` hints get updated to describe
   the new structure. No schema change.
4. `members` → the `index` field stays (it still controls sort order) but its
   hint changes to say it is no longer displayed.
5. `sponsorships` → description changes from "shown on /book" to "shown on
   /sponsor".
6. `services` → no schema change; the `draft` flag now hides a service from the
   homepage list too.

## 2.6 Redirects, schema, and sitemap

### Redirects

Both `public/_redirects` and `vercel.json` get the same rules, since the repo
deliberately mirrors them.

**Reversed:**

```
/about               /roster   308      →      /roster          /about   308
```

**Added:**

```
/roster              /about    308
/roster/*            /about    308      (safe: /roster/[slug] generates 0 pages today)
/sponsor             /book#sponsors     →      (removed; /sponsor becomes a real route)
/sponsorships        /book#sponsors     →      /sponsorships    /sponsor  308
```

**Unchanged:** `/members`, `/comedians` (retargeted to `/about`), `/media`,
`/book-a-show`, `/services`, `/submit`, `/comic-submissions`.

Note on `/book#sponsors`: a fragment never reaches the server, so no redirect
rule can catch it. The footer link changes to `/sponsor` directly, and anyone
arriving at `/book#sponsors` from an old external link lands on `/book` with a
dead anchor, which degrades to the top of the page. I will add an in-page line
on `/book` pointing sponsors at `/sponsor` for a release or two.

### schema.org

- `organization` in `lib/schema.ts` gains top-level `telephone` and `email`
  fields alongside the existing `contactPoint`, so the contact details now
  visible on the homepage are asserted at the entity level. Everything stays
  sourced from `content/site/index.json`, so the schema cannot drift from the
  rendered NAP data.
- `BREADCRUMB_LABELS`: `roster: "Roster"` → `about: "About"`, plus
  `sponsor: "Sponsor"`.
- The five `Person` nodes on `/about` keep emitting, with the corrected
  `jobTitle` values and `url` pointing at `/about`.
- `buildBreadcrumbs("/about")` on the new page; `buildBreadcrumbs("/sponsor")`
  on the new sponsor page.
- No new schema types. No `Service` or `Offer` markup is being added, because
  nothing on the page asserts a price.

### Sitemap and metadata

- `staticRoutes`: `/roster` → `/about`, add `/sponsor`.
- `epkRoutes` now maps over `/about/[slug]`; it is empty today and stays
  harmless.
- `canonical` on every touched page updated.
- `app/(site)/roster/opengraph-image.tsx` moves to `about/`.

---

# Open questions. I need answers on these before Phase 3.

1. **The sixth type role (`.t-ui`, 14px / .08em uppercase).** Yes or no? This is
   the change that fixes nav and label readability, and CLAUDE.md says a sixth
   role is the brand's call, not mine.
2. **Services: 3 or 4?** Publish `film-your-comedy-set`, or keep it draft and
   change the homepage to "We do three things"?
3. **`/roster` → `/about` rename.** Approve, or keep the URL and just relabel?
4. **Build Your Show.** Remove it, or move it to `/book/planner`?
5. **Sponsors to `/sponsor`.** Approve?
6. **Spam protection.** Honeypot plus time trap (no server, recommended), or add
   a Cloudflare Worker route so real Turnstile is possible?
7. **Kyle's title.** "Co-Founder & Producer", or keep the media role in it?
8. **Phone number.** Confirm (360) 323-0667 is the number you want printed on
   the homepage contact block.
9. **Inline SVG social icons** on the comics grid. OK, given the "no icon set
   without asking" rule?
10. **Newsletter.** Keep it as a slim strip, or cut it from the homepage
    entirely?
11. **Next show in the hero.** I have it appearing once, in "What we're working
    on", with the hero linking generically to `/shows`. Confirm, or move the
    date and venue up into the hero and drop the card?

---

# Phase 3, for reference. Not started.

On approval: implement, fix the INTROCALL and "Tickets." typos, strip `/0N`
numbering sitewide, meet WCAG AA contrast and 44px targets, update schema,
sitemap, metadata, CMS config and redirects, run lint + typecheck + test +
build, test the form end to end (success, validation errors, honeypot), check
`/`, `/book` and `/about` at 375 / 768 / 1280, and finish with a changelog.
