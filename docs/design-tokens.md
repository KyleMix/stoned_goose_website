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

One typeface. Weights 300 / 400 / 700 only; the theme defines exactly those
three, so `font-medium` and `font-semibold` do not exist.

| Role      | Weight        | Case      | Tracking            | Color                              |
| --------- | ------------- | --------- | ------------------- | ---------------------------------- |
| Headline  | `font-bold`   | uppercase | `tracking-headline` | tuxedo on ivory, gold on tuxedo    |
| Subhead   | `font-bold`   | uppercase | `tracking-subhead`  | tuxedo on ivory, ivory on tuxedo   |
| Eyebrow   | `font-normal` | uppercase | `tracking-eyebrow`  | `gold-ink` on ivory, gold on tuxedo |
| Body      | `font-light`  | sentence  | normal              | tuxedo on ivory, ivory on tuxedo   |
| Fine print | `font-normal` | sentence  | normal              | `smoke`                            |

| Tracking token      | Value    |
| ------------------- | -------- |
| `tracking-headline` | `0.04em` |
| `tracking-subhead`  | `0.06em` |
| `tracking-eyebrow`  | `0.26em` |

## Display type scale

Named steps in `globals.css`. Use these instead of hand-rolling a `clamp()` on
each heading.

| Class        | Size                         | Role                                        |
| ------------ | ---------------------------- | ------------------------------------------- |
| (PageHeader) | `clamp(3rem, 11vw, 9rem)`    | Page masthead `<h1>`, owned by `PageHeader`  |
| `display-1`  | `clamp(2.4rem, 7vw, 5rem)`   | Top section heading (home hero sections)     |
| `display-2`  | `clamp(2rem, 5vw, 3.5rem)`   | Standard section heading                     |
| `display-3`  | `clamp(1.8rem, 4vw, 2.6rem)` | Sub-section / strip heading                  |

The page masthead size is centralized in `components/page-header.tsx`; every
internal page uses that component, so it stays consistent without a utility.

## Section vertical rhythm

Three documented steps replace the ad-hoc `py-16/20/24/28/32` spread.

| Class             | Mobile (`py`) | Desktop (`md:py`) | Role                       |
| ----------------- | ------------- | ----------------- | -------------------------- |
| `section-y-tight` | `4rem`        | `5rem`            | Compact strips             |
| `section-y`       | `5rem`        | `7rem`            | Standard section           |
| `section-y-lg`    | `6rem`        | `8rem`            | Emphasis / closing section |

New sections should pick one of these rather than a raw `py-*` value.

## Surface declaration

A section declares its surface with `data-surface="ivory"` so descendants can
respond structurally instead of each control guessing. Focus outlines use it
today: gold on tuxedo, tuxedo on ivory.

## Radius

The brand is sharp-cornered: borders and surfaces use the default `0` radius.
The only intentional curves are Leaflet map pins. Do not add rounded corners to
cards, buttons, or inputs.

## Forbidden

No gradients. No shadows, glows, or glassmorphism. No recoloring a mark in CSS
(`filter`, `mix-blend-mode`, or a background behind a knockout). No color
overlay on photography. Photos run full color or black and white.

## Motion

Keyframes and durations live in `tailwind.config.ts` (`marquee`, `fade-in`).
The unused `drift` and `scan` keyframes were removed with the `.scanlines`
rule they drove. All motion respects `prefers-reduced-motion` via the global
reset in `globals.css`.
