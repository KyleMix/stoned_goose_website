# SPEC — site/audit-fixes

Decisions captured from interview on 2026-04-26. Source for IMPLEMENTATION.md and any copy edits. Update here first if anything changes.

## Content holes

### Sponsor stats — real but need updating
Treat the existing numbers (1,200+ in-room, 85K+ social, 30K+ video views) as placeholders. Owner will provide updated figures. Flag in `content/sponsorships.ts` and `public/sponsorship-one-sheet.txt` until refreshed. Do not invent new numbers.

### Member bios — owner writes, I commit
Extend the `Member` type with optional `bio?: string`. Render the bio under role on `/members` only when present. No invented bios. Field stays empty in `content/members.ts` until owner pastes copy per member.

### Xavier Rake's full special — keep poster, "Coming soon" label
On `/shows` and `/watch`: keep the halftoned 16:9 poster. Replace the hazard play overlay with a neutral "Coming soon" label. Strip the click target until `featuredSpecial.videoUrl` is non-null. When the URL arrives, restore the play overlay and wire to a YouTube embed modal.

### covervideo.mp4 — delete
Remove `public/covervideo.mp4`. Cuts export size. Hero stays text-only.

### Mission strip on home — owner writes copy
No `/about` route. Add a single editorial mission block on the home page, slotted between the existing bumpers. Scaffold the layout and a `mission` field in `content/home.ts`; render only when `mission.copy` is populated. No invented manifesto.

### `/comedians` clarifying subhead
Keep "Our Friends." headline. Add a subhead clarifying scope: a mix of booked-by-us comics and friends-of-the-house. Final wording lives in `content/comedians.ts` and is owner-editable. Working draft for review:

> Booked, produced, or platformed by Stoned Goose. Plus the friends who keep showing up.

If owner prefers something else, edit the content file. House rule: no em dashes.

## Brand / tone

### Tagline dedupe — drop from hero
Marquee keeps `live. local. comedy.` Hero right column drops it. Pick a replacement italic short line from the existing marquee phrase pool, or collapse the right column and let the subhead span the baseline grid. Final pick happens during implementation; flag for owner sign-off before commit.

### Bumper rotation — add alternates, random per session
Each of the three home bumper slots gets a small pool (3-5 alternates) in `content/home.ts`. Page selects one per session client-side (deterministic per session id, not per scroll, to avoid flicker). Owner-editable. I draft alternates in Adult Swim register matching the existing voice; owner approves before commit.

## Per-page OG images — generate templated cards

Use Next 15 file-based `opengraph-image.tsx` route conventions per page. Each route's image renders at build time (compatible with `output: "export"`) using `next/og` ImageResponse. Template: `[Page].` in Fraunces display on ink, hazard period, mono eyebrow, brand wordmark in corner. One template, per-page text fed from route metadata.

Per-route OG cards:
- `/` (default site card stays, can keep `/opengraph.jpg`)
- `/members` — "Members."
- `/comedians` — "Comedians."
- `/shows` — "Shows."
- `/watch` — "Watch."
- `/services` — "Services." (and one per service detail slug)
- `/shop` — "Shop."
- `/sponsor` — "Sponsor."
- `/submit` — "Submit."
- `/contact` — "Contact."

## Redirects — both vercel.json and meta-refresh fallback

Static export ignores `next.config.mjs` `redirects()`. Belt and suspenders:
1. `vercel.json` with `redirects[]` entries (308s on Vercel).
2. `public/_redirects` for Cloudflare Pages / Netlify (single file works for both).
3. Static meta-refresh HTML stubs at each old path under `public/` as final fallback.

Confirmed map:

| Old slug | New target |
|---|---|
| `/about` | `/members` |
| `/media` | `/watch` |
| `/comic-submissions` | `/submit` |
| `/sponsorships` | `/sponsor` |
| `/book-a-show` | `/services` |

## Hosting — currently unspecified

Not deployed yet / unsure. All redirect mechanisms shipped so any host wins.

## Out of scope (deferred)

- New `/about` page (rejected; mission strip on home covers it).
- Testimonials block (audit-flagged as corporate-sounding; absent from current home; not requested back).
- Stats band on home (50+ shows etc; same situation, owner has not requested).
- Cover-video repurposed page (covervideo.mp4 deleted instead).
