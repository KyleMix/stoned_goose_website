# Stoned Goose Productions — site

## Stack
Next.js 15 App Router, static export to /out, TypeScript strict, Tailwind v3, Framer Motion, formsubmit.co for forms.

## Run
- `npm run dev` — local dev
- `npm run build` — must pass before any commit
- `npm run lint` — must pass before any commit
- Output goes to /out, deployable as static

## House rules
- Three font families only: Fraunces (display), Inter (body), JetBrains Mono (mono accents). Don't add others.
- One accent color: hazard yellow. Used on punctuation periods, primary CTA, resting state, and rarely a phrase. Don't add accents.
- One restricted secondary: slime green. Green is the universal hover color: every hover state turns slime (text, border, background, underline), including primary CTAs (bg-hazard buttons flip to bg-slime). It also marks the contribute / submit flow (submit a mic). Yellow stays the resting accent: green only appears on hover and interaction, never as a static fill.
- No em dashes anywhere. Use periods, commas, colons, or split the sentence.
- Bumper voice stays Adult Swim register. Don't soften brand copy.
- Progressive disclosure under 3 levels per page.
- No invented stats, no invented testimonials. If it isn't real, cut it.
- Content lives in `content/*.ts`. Edit copy there, not in components.
- Halftone portrait treatment is sitewide via CSS. Don't replace with PNG masks.

## Verify
After any change: build passes, lint passes, click-through on changed pages works.
