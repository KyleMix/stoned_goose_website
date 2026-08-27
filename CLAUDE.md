# Stoned Goose Productions, site

## Stack
Next.js 15 App Router, static export to /out, TypeScript strict, Tailwind v3, Framer Motion, formsubmit.co for forms. Sveltia CMS at /admin writes JSON under content/.

## Run
- `npm run dev`: local dev
- `npm run build`: must pass before any commit
- `npm run lint`: must pass before any commit
- Output goes to /out, deployed as Workers Static Assets (see wrangler.jsonc). Do not add a Cloudflare Next.js adapter; there is no server build.

## Brand: the Marquee system
The palette, type, and marks are specified. Where taste and the spec disagree, the spec wins. Tokens live in `tailwind.config.ts` and are named so misuse is visible in review.

### Five colors, no others
| Token | Hex | Use |
|---|---|---|
| `surface-tuxedo` | `#0F0F0F` | Background, or headline text on ivory |
| `surface-ivory` | `#F4EEE2` | Background, or text on tuxedo |
| `accent-gold` | `#D4AA4A` | Accent, rules, the monocle ring, headline text on tuxedo |
| `gold-ink` | `#8A6A21` | Small gold text on ivory only |
| `smoke` | `#8C8781` | Secondary text, hairlines. The only permitted gray. |

- Every section is either an ivory surface or a tuxedo surface. There is no third surface. **No gold backgrounds anywhere on this site**, ever. Gold as a full background is for Instagram stories and merch only.
- Gold never carries body text. Gold text is headline size on tuxedo, or `gold-ink` at label size on ivory. Nothing else. Never `accent-gold` on ivory at any size: it measures 1.88:1.
- No second accent color. The old hazard yellow and slime green are retired and must not come back.
- **Interaction is a fill swap, not a new color.** Gold rests, ivory responds: a gold CTA hovers to ivory, ivory text hovers to gold. Where a selected state is gold, its hover is ivory so the two stay distinguishable.
- No gradients. Not on heroes, not on buttons, not on card hovers, not as a scrim. Use a flat panel.
- No shadows, glows, or glassmorphism. Focus is a flat 2px outline, gold on tuxedo, tuxedo on ivory (sections declare `data-surface="ivory"`).
- Sponsor logos in their own brand colors, inside a Smoke strip at the page foot, are the one sanctioned exception.

### Type
One typeface: Josefin Sans, loaded via `next/font/google` at weights 300 / 400 / 700 only and self-hosted into the static export. The theme replaces `fontFamily` and `fontWeight`, so `font-serif`, `font-mono`, `font-medium` and `font-semibold` do not exist. Fallback chain is Futura, Century Gothic, Arial, sans-serif. No italics: the face is not loaded, so an `italic` class renders a synthesized oblique.

Use the role classes (`.t-headline`, `.t-subhead`, `.t-eyebrow`, `.t-body`, `.t-fine`) or the components in `components/brand/type.tsx`. Never restate a role's weight, case, tracking or color at the call site. Size comes from the display scale (`display-mega/hero/1/2/3`); do not hand-roll a `clamp()`.

Color is surface-aware. Wrap a section in `<Surface tone="ivory">` (or set `data-surface="ivory"`) and every role inside flips at once. A bare `bg-surface-ivory` renders a gold headline on ivory, which is 1.88:1 and forbidden.

| Role | Weight | Case | Tracking | Color |
|---|---|---|---|---|
| Headline | Bold 700 | Uppercase | `tracking-headline` (.04em) | tuxedo on ivory, gold on tuxedo |
| Subhead | Bold 700 | Uppercase | `tracking-subhead` (.06em) | tuxedo on ivory, ivory on tuxedo |
| Eyebrow / label | Regular 400 | Uppercase | `tracking-eyebrow` (.26em) | `gold-ink` on ivory, `accent-gold` on tuxedo |
| Body | Light 300 | Sentence case | normal | tuxedo on ivory, ivory on tuxedo |
| Fine print | Regular 400 | Sentence case | normal | `smoke` |

Headlines and subheads are always uppercase and letterspaced. Body is always sentence case and Light. Never swap them. Never condense, stretch, or stroke the type. No display font, no monospace. The goose is the fun.

### The two marks
- **Lockup** (goose with joint, wordmark beneath) on anything sold to an audience: home, shows, tickets, merch, the site header. Gold on tuxedo is the hero version.
- **Badge** (circular monocle ring goose) on anything sold to a client: production services, vendor and sponsor material, invoices, lower thirds. Never on a gold background.
- Clear space is baked into the asset files. **Do not add component padding on top of it.**
- Minimum rendered width: lockup 281px, badge 115px (the 240px / 96px artwork rule converted to file width).
- The lockup canvas is 3353 x 3028, about 1.107:1. Size by width, let height follow. No `aspect-square`, no cropping container.
- **Never recolor a mark in CSS.** No filter, no mix-blend-mode, no background-color behind a knockout. Every colorway exists as a file.
- Never place a mark over a photo without a solid tuxedo panel behind it.
- Don't mix lockup and badge on one page unless it genuinely serves both audiences, and then keep them in separate sections.

### The monocle ring
A thin `accent-gold` circle, 3px stroke, bleeding off a section corner or framing a headshot. **One ring per page section, maximum.** Use the `<MonocleRing />` component so the limit is enforceable.

### Layout
- Show info renders in this order every time, everywhere: date, venue, doors and show time, price, ticket link. Use `<ShowInfoBlock />`.
- Start from an existing primitive. Change the words and the photo, nothing else.

## House rules
- No em dashes anywhere. Use periods, commas, colons, or split the sentence. The CMS enforces this with a pattern validator.
- Bumper voice stays Adult Swim register. Don't soften brand copy.
- Progressive disclosure under 3 levels per page.
- No invented stats, no invented testimonials, no invented prices, dates, or comedian names. If it isn't real, cut it or leave a marked TODO.
- Content lives in `content/*.ts` and `content/**/*.json`. Edit copy there, not in components.
- Don't add a UI library, icon set, animation library, or dependency without asking. A gold circle is a `<div>` with a border.

## Verify
After any change: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` all pass, and click-through on changed pages works.
