# Design tokens

The single reference for the visual system. Tokens live in
`tailwind.config.ts` (color, font family, letter spacing, max width, motion)
and `app/globals.css` (type scale, section rhythm). Do not invent new values:
extend a token here and reuse it.

## Color

One palette. See the house rules in `CLAUDE.md`.

| Token         | Hex       | Role                                                        |
| ------------- | --------- | ---------------------------------------------------------- |
| `ink`         | `#0A0A0A` | Page background, dark surfaces                              |
| `bone`        | `#EFE9DD` | Primary text on ink                                        |
| `haze.50-500` | scale     | Muted surfaces and dividers                                |
| `hazard`      | `#F2EA00` | The accent. Resting state, punctuation periods, primary CTA |
| `slime`       | `#3DDC6E` | Restricted secondary. Universal hover/interaction + submit flow |

Yellow is the resting accent; green appears only on hover/interaction and to
mark the contribute/submit flow. No other accents.

## Type families

Three only: Fraunces (`font-display`), Inter (`font-body`),
JetBrains Mono (`font-mono`).

## Display type scale

Named steps in `globals.css`. Use these instead of hand-rolling a `clamp()` on
each heading. Every step uses the display family with the tight display rhythm.

| Class       | Size                      | Role                                       |
| ----------- | ------------------------- | ------------------------------------------ |
| (PageHeader) | `clamp(3rem, 11vw, 9rem)` | Page masthead `<h1>`, owned by `PageHeader` |
| `display-1` | `clamp(2.4rem, 7vw, 5rem)` | Top section heading (home hero sections)   |
| `display-2` | `clamp(2rem, 5vw, 3.5rem)` | Standard section heading                    |
| `display-3` | `clamp(1.8rem, 4vw, 2.6rem)` | Sub-section / strip heading                |

The page masthead size is centralized in `components/page-header.tsx`; every
internal page uses that component, so it stays consistent without a utility.

## Section vertical rhythm

Three documented steps replace the ad-hoc `py-16/20/24/28/32` spread.

| Class             | Mobile (`py`) | Desktop (`md:py`) | Role                       |
| ----------------- | ------------- | ----------------- | -------------------------- |
| `section-y-tight` | `4rem`        | `5rem`            | Compact strips             |
| `section-y`       | `5rem`        | `7rem`            | Standard section           |
| `section-y-lg`    | `6rem`        | `8rem`            | Emphasis / closing section |

Applied across home, book, shows, and open-mics. New sections should pick one
of these rather than a raw `py-*` value.

## Radius

The brand is sharp-cornered: borders and surfaces use the default `0` radius.
The only intentional curves are the organic `.blob` shape and Leaflet pins
(circular). Do not add rounded corners to cards, buttons, or inputs.

## Motion

Keyframes and durations live in `tailwind.config.ts` (`marquee`, `drift`,
`scan`, `fade-in`). All motion respects `prefers-reduced-motion` via the global
reset in `globals.css`.
