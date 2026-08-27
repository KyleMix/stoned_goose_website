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
| `gold-ink`       | `#8A6A21` | Small gold text on ivory only                           |
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

Measured against WCAG 2.1. Two pairings fail AA at small sizes and the fix is
size or surface, never a new color.

| Pairing                   | Ratio     | AA normal | AA large |
| ------------------------- | --------- | --------- | -------- |
| `surface-ivory` on tuxedo | 16.59:1   | pass      | pass     |
| `accent-gold` on tuxedo   | 8.81:1    | pass      | pass     |
| `smoke` on tuxedo         | 5.38:1    | pass      | pass     |
| `gold-ink` on ivory       | 4.36:1    | **fail**  | pass     |
| `smoke` on ivory          | 3.08:1    | **fail**  | pass     |
| `accent-gold` on ivory    | 1.88:1    | **fail**  | **fail** |

`accent-gold` on ivory is forbidden outright. The other two failures are open
decisions, see the Phase 0 audit.

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
