# Design tokens

The single reference for the visual system. Tokens live in
`tailwind.config.ts` (color, weight, letter spacing, max width, motion)
and `app/globals.css` (type scale, section rhythm). Do not invent new values:
extend a token here and reuse it.

This is the Marquee brand system. `CLAUDE.md` carries the rules; this file
carries the values.

## Color

Five colors. The theme **replaces** Tailwind's default color scale rather than
extending it, so a stray `text-gray-400` or `bg-red-500` fails to generate and
shows up in review as unstyled output instead of shipping quietly.

| Token            | Hex       | Role                                                    |
| ---------------- | --------- | ------------------------------------------------------- |
| `surface-tuxedo` | `#0F0F0F` | Background, or headline text on ivory                   |
| `surface-ivory`  | `#F4EEE2` | Background, or text on tuxedo                           |
| `accent-gold`    | `#D4AA4A` | Accent, rules, the monocle ring, headline text on tuxedo |
| `gold-ink`       | `#87681F` | Small gold text on ivory only                           |
| `smoke`          | `#8C8781` | Secondary text and hairlines. The only permitted gray.  |

Names are deliberately verbose. `bg-surface-ivory` and `text-gold-ink` state
the role, so gold-as-background or Dark Gold on black is legible as wrong at
the call site.

Two surfaces, never a third. No gold background anywhere on this site. No
second accent: the retired `hazard` yellow and `slime` green are gone and must
not come back.

### Interaction

Interaction is a fill swap inside the palette, not a new color. Gold rests,
ivory responds.

| Element                     | Rest              | Hover / active     |
| --------------------------- | ----------------- | ------------------ |
| Primary CTA                 | `bg-accent-gold`  | `bg-surface-ivory` |
| Body / nav link on tuxedo   | `text-surface-ivory` | `text-accent-gold` |
| Selected item with gold mark | `border-accent-gold` | `border-surface-ivory` on hover |

Where a selected state is gold, its hover is ivory so the two stay
distinguishable. No glows, no shadows, no gradient scrims.

### Contrast

Measured against WCAG 2.1, and verified in the browser: an audit walks every
rendered text node on nine routes, resolves its real painted background, and
checks the ratio against its size class. It currently reports zero failures.

| Pairing                   | Ratio   | AA normal | AA large | Non-text (3:1) |
| ------------------------- | ------- | --------- | -------- | -------------- |
| `surface-ivory` on tuxedo | 16.59:1 | pass      | pass     | pass           |
| `surface-tuxedo` on ivory | 16.59:1 | pass      | pass     | pass           |
| `accent-gold` on tuxedo   | 8.81:1  | pass      | pass     | pass           |
| `smoke` on tuxedo         | 5.38:1  | pass      | pass     | pass           |
| `gold-ink` on ivory       | 4.51:1  | pass      | pass     | pass           |
| `smoke` on ivory          | 3.08:1  | **fail**  | pass     | pass           |
| `accent-gold` on ivory    | 1.88:1  | **fail**  | **fail** | **fail**       |

Two of these needed resolving. Neither was solved by inventing a color.

**`gold-ink` was `#8A6A21`, at 4.36:1.** That is 0.14 short of AA, and the spec
puts Dark Gold on ivory at label size, which is small text, so no size or
weight change could rescue it. A search over the neighbouring RGB space for the
smallest perceptual change that clears 4.5:1 returned `#87681F`: dE76 of 0.97
from the original, below the just-noticeable difference on adjacent flat
patches. Three hex digits moved and the pairing passes at every size.

**`smoke` on ivory cannot be fixed at all, and that is a fact about the
palette.** Clearing 4.5:1 against Tuxedo requires relative luminance of at
least 0.1965; clearing it against Ivory requires at most 0.1519. The windows do
not overlap, so no single gray passes body text on both surfaces. Since Smoke
is the only permitted gray, the resolution is to split its two jobs:

- As a **hairline or border**, the 3:1 non-text threshold applies and Smoke
  passes on both surfaces (3.08:1 and 5.38:1). Unchanged everywhere.
- As **text**, Smoke stays on tuxedo and flips to Tuxedo ink on ivory. On an
  ivory surface, hierarchy is carried by size and weight rather than tint,
  which is how a printed page does it anyway.

`accent-gold` on ivory stays forbidden at any size; the type roles make it
unreachable rather than merely discouraged.

**Focus** is a flat 2px outline, never a glow. Gold clears the 3:1 non-text
threshold on tuxedo but not on ivory, so `[data-surface="ivory"] :focus-visible`
flips it to Tuxedo ink.

## Type

One typeface: **Josefin Sans**, loaded through `next/font/google` at weights
300 / 400 / 700 only, `display: swap`. No italics: the face is not loaded and
the browser would synthesize an oblique, which the spec forbids.

next/font self-hosts the woff2 into the static export at build time, so the
Workers Static Assets deploy serves the font from its own origin. There is no
runtime request to fonts.gstatic.com. The emitted chain is:

    Josefin Sans, Josefin Sans Fallback, Futura, Century Gothic, Arial, sans-serif

`Josefin Sans Fallback` is the size-adjusted metric fallback next/font derives
automatically; the rest is the declared chain.

The theme replaces `fontFamily` and `fontWeight` rather than extending them, so
`font-serif`, `font-mono`, `font-medium` and `font-semibold` do not exist.

### The five roles

Weight, case, tracking and color belong to the role, not the call site. Use the
class, or the component in `components/brand/type.tsx`.

| Role       | Class         | Component     | Weight | Case      | Tracking |
| ---------- | ------------- | ------------- | ------ | --------- | -------- |
| Headline   | `.t-headline` | `<Headline>`  | 700    | uppercase | `0.04em` |
| Subhead    | `.t-subhead`  | `<Subhead>`   | 700    | uppercase | `0.06em` |
| Eyebrow    | `.t-eyebrow`  | `<Eyebrow>`   | 400    | uppercase | `0.26em` |
| Body       | `.t-body`     | `<Body>`      | 300    | sentence  | normal   |
| Fine print | `.t-fine`     | `<FinePrint>` | 400    | sentence  | normal   |

Roles live in the `components` layer, not `utilities`, so an explicit
`hover:text-accent-gold` or a one-off `text-surface-ivory` at the call site
still wins. The role is a default, never a lock. Do not restate a role's own
weight, case, tracking or color next to it.

### Surface-aware color

Color is not a per-caller decision. A section declares its surface and every
role inside flips at once:

| Role       | on tuxedo (default) | on `data-surface="ivory"` |
| ---------- | ------------------- | ------------------------- |
| Headline   | `accent-gold`       | `surface-tuxedo`          |
| Subhead    | `surface-ivory`     | `surface-tuxedo`          |
| Eyebrow    | `accent-gold`       | `gold-ink`                |
| Body       | `surface-ivory`     | `surface-tuxedo`          |
| Fine print | `smoke`             | `smoke`                   |

Use `<Surface tone="ivory">` from `components/brand/surface.tsx`, which sets the
background and the attribute together. A bare `bg-surface-ivory` leaves
descendants guessing and will render a gold headline on ivory: 1.88:1, the one
pairing the spec forbids outright.

### Defaults and guards

The surface rules come in two kinds, and the difference is deliberate.

**Defaults** are the five role colours. They use `:where([data-surface="ivory"])`,
which contributes zero specificity, so the rule still flips the role but loses
to any colour utility the call site sets. The role is a default, never a lock.
This matters: written at full specificity, they beat an explicit
`text-surface-tuxedo` on a gold CTA sitting inside an ivory section, turning
its label Dark Gold on gold at 2.39:1.

**Guards** are the forbidden pairings. They keep full specificity and are meant
to beat a call site, because a component that renders on both surfaces cannot
know which one it is on and the failure mode is illegible text:

| On an ivory surface | Becomes | Why |
| ------------------- | ------- | --- |
| `.text-smoke`, `.t-fine` | `surface-tuxedo` | 3.08:1, fails AA, and no gray passes on both surfaces |
| `.text-accent-gold` | `gold-ink` | 1.88:1, the pairing the spec forbids at any size |
| `.text-surface-ivory` | `surface-tuxedo` | 1:1, always a mistake |

The gold guard puts Dark Gold above label size, which the written spec reserves
for labels. The alternative was shipping 1.88:1 or dropping the gold emphasis
device from every ivory section. Flagged for ratification.

### Surface rhythm

Ivory punctuates; it does not stripe. Alternating every section reads as a
barcode, and the spec's reference layouts use ivory as an insert. Each route
gets one to three ivory bands placed at a shift in what the page is doing, and
the closing ask is ivory on every route that has one.

Blocks that appear on more than one page take a `tone` prop rather than
hardcoding a background, because their surface is a property of where they sit.
They route it through `<Surface>`, which sets the background and declares
`data-surface` together.

### Secondary labels

An uppercase tracked label in a muted color has no slot in the spec, which
gives Eyebrow exactly one color per surface. Rather than turn 139 metadata
labels gold, they take **Smoke**: on palette, and 5.38:1 on tuxedo against the
off-palette alpha composites they replaced. Flagged for ratification.

## Display type scale

Size only. Pair with `.t-headline` or `.t-subhead`, which carry everything else.

Retuned for Josefin Sans: uppercase at +4% tracking sets roughly a third wider
than the sentence-case serif it replaced, so every step came down to keep short
headlines on one line.

| Class          | Size                           | Role                           |
| -------------- | ------------------------------ | ------------------------------ |
| `display-mega` | `clamp(4rem, 14vw, 12rem)`     | Short statement numerals (404) |
| `display-hero` | `clamp(2.5rem, 8vw, 7rem)`     | Page masthead and hero `<h1>`  |
| `display-1`    | `clamp(2rem, 5.5vw, 4rem)`     | Top section heading            |
| `display-2`    | `clamp(1.75rem, 4.5vw, 3rem)`  | Standard section heading       |
| `display-3`    | `clamp(1.5rem, 3.5vw, 2.2rem)` | Sub-section / strip heading    |

Do not hand-roll a `clamp()` next to these. Add a step here if a real gap
appears.

## The two marks

Seven files under `public/brand/`, all RGBA with straight alpha and a single
flat ink value across every opaque pixel, so each composites cleanly onto any
surface. Verified on import: exact canvases, exact palette inks, and alpha
masks that are pixel-identical within each family, which confirms all four
lockups and all three badges come from one true knockout.

| File | Canvas | Ink |
| ---- | ------ | --- |
| `SGP_Lockup_Tuxedo.png` | 3353 x 3028 | `#0F0F0F` |
| `SGP_Lockup_Ivory.png`  | 3353 x 3028 | `#F4EEE2` |
| `SGP_Lockup_Gold.png`   | 3353 x 3028 | `#D4AA4A` |
| `SGP_Lockup_White.png`  | 3353 x 3028 | `#FFFFFF` |
| `SGP_Badge_Tuxedo.png`  | 1750 x 1750 | `#0F0F0F` |
| `SGP_Badge_Ivory.png`   | 1750 x 1750 | `#F4EEE2` |
| `SGP_Badge_Gold.png`    | 1750 x 1750 | `#D4AA4A` |

Use `<Lockup colorway="gold" width={320} />` and
`<Badge colorway="ivory" width={140} />`. Never reference the files directly.
The components enforce four rules the call site cannot get wrong:

1. **Clear space is baked into the artwork**, 245px of the 3353px lockup canvas
   on every side. Do not add component padding. Padding twice floats the mark
   and reads undersized.
2. **Minimum width** is 281px for the lockup and 115px for the badge, the 240px
   and 96px artwork minimums converted to file width. Smaller values are
   clamped, with a dev-console warning.
3. **The lockup canvas is 1.107:1, not square.** Pass a width; height follows.
   No `aspect-square`, no cropping container.
4. **Never recolor a mark.** No `filter`, no `mix-blend-mode`, no background
   behind the knockout. Every colorway you need is already a file. Reaching for
   a fifth lockup colorway is a design error, not a missing asset.

Lockup on audience surfaces, badge on client surfaces, never both in one
section. The site footer carries the lockup; `/book` carries the badge.

**The header carries no mark.** The lockup's minimum is 281 x 254px, which
cannot sit in a 64px bar, and shrinking it past the minimum is the rule this
system exists to prevent. A header this size carries the wordmark as type.

Icons are generated from `SGP_Badge_Gold.png` by `npm run brand:generate`: the
circular mark stays recognisable in a round or squircle crop where the 1.107:1
lockup would have to be letterboxed, and gold holds up against both light and
dark browser chrome. Nothing in that script recolors a mark; the only
background it paints is the Tuxedo square the iOS slot requires, since that
slot cannot be transparent.

### Web renditions

The masters are print resolution and must stay that way, but they are far too
heavy to serve. The lockup is 3353px and 523KB, and the footer renders it at
320px on every page: ten times the pixels the slot needs. Static export sets
`images.unoptimized`, so next/image resizes nothing and whatever a component
references is what the browser downloads.

`npm run brand:generate` writes `public/brand/web/`, one rendition per colorway
at twice the documented web maximum (800px lockup, 400px badge), so a 400px
render is still retina sharp. `<Lockup>` and `<Badge>` pick the rendition below
that maximum and fall back to the master above it, so a large placement never
upscales. This cut every page from 523KB of imagery to 105KB.

Still open: these are raster. SVG remains the better end state and is what the
40 foot banner case would need. Do not trace the goose to get there.

## Primitives

Reusable pieces in `components/brand/`. Start from these rather than
hand-rolling: they carry the rules that would otherwise live in a comment.

| Piece | What it enforces |
| ----- | ---------------- |
| `<Lockup>` / `<Badge>` | Minimum widths, aspect, no recoloring, no double padding |
| `<Surface tone>` | Sets the background and declares `data-surface` together |
| `<Headline>` etc. | The five type roles |
| `<MonocleRing>` | 3px gold circle, bleed off a corner or frame a headshot |
| `<GoldRule>` | Flat 1px gold hairline, never a gradient |
| `<ShowInfoBlock>` | The fixed show-info order |
| `<SponsorStrip>` | The one sanctioned Smoke surface |

### The icon master

The badge is line art and does not survive a favicon. Measured on the real
file: the artwork is 1466px inside the 1750px canvas, and its thinnest stroke
is 18px, which is 1.23% of the artwork. That renders at 0.16px in a 16px
favicon and only becomes clean around 256px, which is why the small sizes came
out as a gold blob.

A second measured constraint decided the shape of the fix: no palette ink
clears the 3:1 non-text threshold against both light and dark browser chrome.
Gold is 2.2:1 on a white tab and 7.4:1 on a dark one; tuxedo and ivory are
worse. A transparent icon is therefore illegible in one chrome whatever colour
it uses, so the icon carries its own Tuxedo ground and the contrast lives
inside it at 8.81:1.

`public/brand/SGP_Icon_Gold.png`, 1024 x 1024 RGBA. Derived from
`SGP_Badge_Gold.png` by geometry, not redrawn: the inner circle's outer edge
spans x=429 to x=1320 on the centreline, an 892px disc centred at (874, 875).
Cropping there keeps the goose and monocle and drops the ring wordmark, which
is the part that cannot survive 16px. The crop is scaled to 78% of the canvas
over a solid `#0F0F0F` circle.

The resize uses the `linear` kernel deliberately. Lanczos3, sharp's default,
overshoots at hard edges and produced 98 opaque pixels brighter than pure gold;
mitchell left one. Linear leaves none, so the file passes the palette check at
strict tolerance without post-processing final art.

It supplies favicon 16/32/48/64 and the apple-touch-icon. That last one is a
180px asset but iOS renders it at roughly 60pt, so it is a small-size slot
despite the large file. The badge keeps 128/256/512 and the OG mark, where its
detail earns its place.

Honest limit: 16px is better but still not a readable goose. Sixteen pixels is
sixteen pixels. What it buys is a solid dark disc that is findable in a tab
strip, against a pale ghost that was not.

### The monocle ring

One ring per page section, maximum. It is the signature device; at full size on
everything it stops meaning anything.

That limit is enforced, not requested: `scripts/test/monocle-ring.test.ts`
walks every TSX file, tracks `<section>` nesting, and fails the build when one
section holds two rings, or when a ring sits outside any section (where a bleed
would anchor to the wrong ancestor). Sibling sections may each have one.

It is a `<div>` with a border. No SVG, no dependency, no glow.

### Show info

`<ShowInfoBlock>` renders date, venue, doors and show time, price, ticket link.
Always that order, on every poster, card and event page. The order is not a
prop and cannot be changed from a call site; `layout` only changes how the rows
sit. Missing fields are skipped rather than filled in.

Formatting comes from `lib/dates.ts`, which pins every date to
`America/Los_Angeles`. This matters more than it looks: the site is a static
export, so dates are formatted once at build time on whatever machine ran the
build. CI runs in UTC, which was rendering a 7:00 PM Olympia show as "Sun, Oct
18, 2:00 AM" instead of "Sat, Oct 17, 7:00 PM". Wrong time and wrong day, on
the primary content of the site. Every date formatter in the app now goes
through that module; none call `Intl.DateTimeFormat` directly.

### The sponsor strip

Sponsor logos at the page foot, in a Smoke strip. This is the one sanctioned
exception to the five colors: sponsor logos run in their own brand colors and
are never recolored to fit the palette, since a restyled sponsor mark is worse
than an off-palette one.

The licence covers the logos and nothing else. Type on the strip runs Tuxedo
via `data-surface="smoke"`, which is 5.38:1; gold there would be 1.64:1 and
ivory 3.08:1. The component renders nothing when there are no sponsors.

## Acceptance

`scripts/test/acceptance.mjs` checks the runtime half of the brand rules
against a built and served site: section surfaces, the gold text rules,
gradients and shadows, mark minimum sizes, clear space, show-info order, and
mark mixing. Run it before a release:

    npm run build && node scripts/serve-out.mjs &
    node scripts/test/acceptance.mjs

It is not in `npm run test` because it needs a built export and a running
server. The static half is covered there instead:
`brand-assets.test.ts` guards the logo masters, `monocle-ring.test.ts` guards
the one-ring-per-section rule, and `validate-content.ts` guards the CMS shapes.

### The gold text rule, as implemented

The checklist says "no gold text below headline size on black". Read literally
that forbids the Eyebrow role, which the spec's own type table puts at Marquee
Gold on black at label size, and which two of its four reference layouts show.
The two statements cannot both hold.

Implemented reading: what is forbidden is gold BODY text. Gold is allowed at
headline size, or in the Eyebrow role (Regular 400, uppercase, +26%). The
acceptance script encodes that, and currently finds 44 gold headlines and 55
gold eyebrows with nothing outside those two categories. Flagged so the brand
page can be corrected.

## Section vertical rhythm

Three documented steps replace the ad-hoc `py-16/20/24/28/32` spread.

| Class             | Mobile (`py`) | Desktop (`md:py`) | Role                       |
| ----------------- | ------------- | ----------------- | -------------------------- |
| `section-y-tight` | `4rem`        | `5rem`            | Compact strips             |
| `section-y`       | `5rem`        | `7rem`            | Standard section           |
| `section-y-lg`    | `6rem`        | `8rem`            | Emphasis / closing section |

New sections should pick one of these rather than a raw `py-*` value.

## Radius

The brand is sharp-cornered: borders and surfaces use the default `0` radius.
The only intentional curves are Leaflet map pins. Do not add rounded corners to
cards, buttons, or inputs.

## Forbidden

No gradients. No shadows, glows, or glassmorphism. No italics: only three
upright weights are loaded, so an `italic` class would render a synthesized
oblique. No recoloring a mark in CSS (`filter`, `mix-blend-mode`, or a
background behind a knockout). No color overlay on photography. Photos run full
color or black and white.

## Motion

Keyframes and durations live in `tailwind.config.ts` (`marquee`, `fade-in`).
The unused `drift` and `scan` keyframes were removed with the `.scanlines`
rule they drove. All motion respects `prefers-reduced-motion` via the global
reset in `globals.css`.
