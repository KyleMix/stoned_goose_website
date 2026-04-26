# Stoned Goose Productions - Content Inventory

Source of truth for the rebuild. All copy is preserved verbatim from the existing site (client/src/\*\*).

## 1. Pages and Routes (existing site)

| Existing route | New route | Notes |
| --- | --- | --- |
| `/` | `/` | Home |
| `/about` | `/members` | Team + 4 pillars |
| `/comedians` | `/comedians` | Friends roster (22) |
| `/services` | `/services` | Services hub + pricing + quote form |
| `/:slug` (5 detail pages) | `/services/[slug]` | live-show-production, comedian-booking, corporate-events, media-and-podcasts, headshots-and-promo |
| `/book-a-show` | merged into `/services` | |
| `/media` | `/watch` | YouTube + Instagram reels |
| `/merch` | `/shop` | Fourthwall storefront |
| `/sponsorships` | `/sponsor` | Tiers + inquiry form |
| `/comic-submissions` | `/submit` | Tape submission form |
| `/#contact` | `/contact` | Standalone contact page |
| `*` | `/not-found` | 404 |

## 2. Site-wide

### Contact

- Email: `kyle@stonedgooseproductions.com`
- Phone: `(360) 323-0667`
- Address line: `Stoned Goose Productions, Comedy-friendly location`
- Service area: Olympia, Lacey, Tacoma, South Sound, Thurston County, Pierce County, WA

### Social

- Instagram: https://www.instagram.com/stonedgooseproductions/
- Facebook: https://www.facebook.com/profile.php?id=61573095812128
- TikTok: https://www.tiktok.com/@stonedgooseproductions
- YouTube: https://www.youtube.com/@stonedgooseproductions
- Patreon: https://www.patreon.com/cw/StonedGooseProductions

### Footer credit

> Website Design by Kyle Mixon.

## 3. Home page

### Hero

- Eyebrow: `Now booking corporate events + media production`
- Tagline (rotated): `LIVE. LOCAL. COMEDY.`
- Headline: `Stoned Goose Productions`
- Subhead: `Crafting cinematic stand-up, curated showcases, and comedy chaos across your city.`
- Primary CTA: `Book a Show` / `Bring a high-impact comedy night to your venue, company event, or private experience.` -> `Start Booking` -> `/services`
- Secondary CTA: `Get Tickets` / `See what's next in Olympia and across the South Sound—then lock in your seats.` -> `Browse Shows` -> `/shows`
- Tertiary links: `Sponsor a Show` -> `/sponsor`; `Comic Submissions` -> `/submit`
- Trust stats: `50+ Shows Produced`, `20+ Comedians Booked`, `5,000+ Tickets Sold`, `8+ Venue Partners`
- Background: `/covervideo.mp4` with poster `/opengraph.jpg`

### Upcoming Shows

- Heading: `Upcoming Shows`
- Subhead: `Live lineups, presales, and ticket drops across Olympia and the South Sound.`
- Mailing list block:
  - Eyebrow: `Stay in the loop`
  - Heading: `Get show announcements + presale codes`
  - Body: `Join the mailing list so you hear about new drops before tickets sell out.`
  - Success: `You're on the list. See you at the next show.`
- Eventbrite profile: https://www.eventbrite.com/o/stoned-goose-productions-107337391771
- Empty state: `We don't have any shows on the calendar right now. Follow Stoned Goose Productions to be the first to hear when the next lineup drops.`
- Show data shape: `{ id, name, start, end, url, summary, imageUrl, venue: { name, address, city, region, country } }`

### Services overview

- Eyebrow: `We book revenue-generating services`
- Heading: `What We Do`
- Subhead: `We don't just tell jokes. We build the stage for them—and capture the headshots to match.`
- CTAs: `Request a Quote` -> `/contact`; `View Services` -> `/services`; `Venue Partner Program` -> `/services#venue-partner-program`
- Service cards (5):
  1. **Live Show Production** - "From intimate clubs to theaters, we handle everything from booking to stage management."
  2. **Comedian Booking** - "Need talent? We have a roster of the funniest people you've never heard of (yet)."
  3. **Corporate Events** - "Make your company party less awkward. We bring the laughs, you bring the open bar."
  4. **Media & Podcasts** - "Full service audio/video production for comedy specials and podcast series."
  5. **Headshots & Promo Shoots** - "Professional headshots and press kits to spotlight comedians, staff, and partners in the best light."
- Venue Partner card: `Bring consistent comedy to your room.` / `Collaborate on recurring nights, co-marketing, and revenue splits tailored to your venue's footprint.`
- Pricing tiers: Starter ($750+), Pro ($2,000+), Premium ($5,000+) - see `/services` page for full breakdowns.

### Testimonials

Heading: `Venues. Brands. Comedians.` / Subhead: `Don't take our word for it — here's what the people who've worked with us have to say.`

1. **Marcus T.** - General Manager, The Anchor Taproom — Olympia
   > Stoned Goose turned our slow Tuesday nights into the most-talked-about event of the week. Ticket sales covered our bar staff within the first two shows. We've had a recurring night booked with them ever since.

2. **Priya S.** - HR Director, Pacific Northwest Tech Co.
   > We hired them for our company holiday party and couldn't believe how seamlessly it came together. The comedian they sourced read the room perfectly — HR-approved and laugh-out-loud funny. Zero drama, all laughs.

3. **Darnell W.** - Stand-Up Comedian, Featured on Stoned Goose Productions
   > I've worked with producers all over the state and Kyle's team is the real deal. They handled my contract, coordinated with the venue, promoted the show, and even shot promo content. I just showed up and did my set.

4. **Jennifer K.** - Events Coordinator, South Sound Business Group
   > We reached out on a Friday about a last-minute corporate event and they had a full lineup confirmed by Monday. Fast, professional, and the show was a massive hit with our clients. Will absolutely book again.

Footer line: `Ready to join them? Let's talk about your event.`

### Sponsors block

- Eyebrow: `Sponsors & Partners`
- Heading: `Build the Laughs Together`
- Subhead: `We team up with local businesses and bold brands to amplify comedy across the South Sound.`
- Benefits: `Logo Placement`, `On-Stage Shoutouts`, `Co-Branded Events`, `Social Mentions`
- CTA: `Start a Sponsorship` -> `/sponsor`

### Contact block

- Heading: `We want to work with you`
- Subhead: `Booking, partnerships, or just want to start a conversation?`
- Form: name (min 2), email, message (min 10) -> `kyle@stonedgooseproductions.com`
- Button: `Let's Talk`
- Success: `Message sent! We'll get back to you soon.`
- Error: `Something went wrong. Please try again shortly.`

## 4. Members (5)

| Name | Role | Photo |
| --- | --- | --- |
| Kyle Mixon | Founder & Producer | `kyle.png` |
| Joseph Humphrey | Media & Production | `joseph.jpg` |
| Brendan Meeks | Creative Director | `brendan.png` |
| Samuel Tweed | Stage Manager | `sam.png` |
| Garrett Iverson | Photographer | `garrett-iverson.jpg` |

### Four pillars

1. **Production & Ops** - Producers, bookers, and stage managers who keep tours, residencies, and monthly showcases running smoothly.
2. **Media Team** - Cinematographers, editors, and photographers crafting specials, podcast visuals, and crisp headshots for every comic.
3. **Community & Partners** - Venue partners, sponsors, and collaborators who help us elevate Pacific Northwest comedy together.
4. **Creative Lab** - Writers and creative directors shaping new formats, themed shows, and social content that keeps audiences engaged.

Headings: `About the Team`, subhead `Stoned Goose Productions is a crew of producers, performers, and media pros building cinematic comedy experiences across the Pacific Northwest.` // Crew block heading: `Meet the Crew`, subhead: `Faces behind the productions.`

## 5. Comedians roster (22)

| Name | Instagram | Facebook | Photo |
| --- | --- | --- | --- |
| Brandon White | brandonwhitecomedy | brandon.white.98871 | brandon-white.jpg |
| Casey McLain | caseymclaincomedy | casey.mclain.5 | casey-mclain.jpg |
| Christian Mateo | christianmateo.comedy | - | christian-mateo.jpg |
| Cloe Nomic | clonipps | cloey.peachez | cloe-nomic.jpg |
| David Weed | davidweedcomedy | - | david-weed.png |
| Derek Gladson | derekgladsoncomedy | derek.gladson | derek-gladson.jpg |
| Ezra Bonillas | ezrabonillas | - | ezra.png |
| Gavin Howells | gavvy.goo | gavin.howells.566602 | gavin-howells.jpg |
| Jacob Barber | jacob_is_a_comedian | jacob.barber.167 | jacob-barber.jpg |
| Jess Everett | imjesseverett | jess.everett.758 | jess-everett.jpg |
| Karan Sharma | karanbhaisharma | sharmakaran | karan-sharma.jpg |
| Kayleen Dunn | dunnwithcomedy | - | kayleen-dunn.jpg |
| Lonnie Williams | swagdaddysensei | - | lonnie-williams.png |
| Luke Severeid | lukesevereid | lukesevereidcomedy | luke-severeid.jpg |
| Lynette Manning | lynettecomedy | lynette.nicolas | lynette-manning.jpg |
| Min Lin | min_lin_comedy | minlinsunny | min-lin.jpg |
| Seth Fairchild | sethfcomedy | seth.fairchild.77 | seth-fairchild.png |
| Steven Rine | stevebefuckinup | steven.rine | steven-rine.jpg |
| Tony Cardoza | cardozacomedy | anthony.vincent.90226 | tony-cardoza.jpg |
| Trenton Cotton | trentoncottencomedy | trenton.cotten | trenton-cotton.jpg |
| Tyler Smith | dr_tyler_smith | DrTylerSmith | tyler-smith.jpg |
| Xavier Rake | jokedeal3r | - | xavier.png |
| Yoshi Obayashi | yoshiobayashi | yoshiobayashi | yoshi.png |

Heading: `Our Friends` / Subhead: `Comedians we have worked with.` / Roster CTA: `Want to work with us?` / `We keep a rolling submission pipeline for future showcases and feature sets. Send your latest tape and details for review.` -> `Submit to the roster` -> `/submit`

## 6. Shows / Productions

Live data flows through `/api/eventbrite` from Eventbrite. Static fallback is empty. Page should:

- Show all upcoming Eventbrite events (cards)
- Feature **Xavier Rake's full special** as a hero/feature block (the user explicitly called this out)
- Mailing list signup
- Empty-state copy preserved verbatim (see Home > Upcoming Shows)

## 7. Services - 5 detail pages

Full FAQs, ideal-for, process, what-you-get blocks captured for each service. See `/client/src/data/servicePages.ts` originals for full text. Each service slug:

- `live-show-production`
- `comedian-booking`
- `corporate-events`
- `media-and-podcasts`
- `headshots-and-promo`

Pricing tiers (page-level):

| Tier | Best for | Price | Includes |
| --- | --- | --- | --- |
| Starter | Clubs & pop-ups | Starting at $750 | Talent sourcing + booking; basic run-of-show planning; day-of production coordination |
| Pro | Theaters & corporate | Starting at $2,000 | Full booking + contracts; production staffing & tech specs; photo + short-form recap assets |
| Premium | Festivals & branded activations | Starting at $5,000 | Executive producing & creative direction; on-site video/audio capture; post-event marketing kit + highlights |

Quote form fields: service type, event date, budget range, venue size, contact email.

## 8. Watch / Media

- Heading: `Media & Clips`
- Subhead: `Watch clips, reels, and full sets from Stoned Goose Productions.`
- YouTube channel: https://www.youtube.com/@stonedgooseproductions (live API fetch)
- Featured: Xavier Rake's full special (per user spec)
- Instagram reels:
  1. **Halloween Comedy Costume Contest** - https://www.instagram.com/reel/DP3Uddejt-n/ (thumb: `Halloween.png`)
  2. **Matt Loes - Krusty The Clown Impression** - https://www.instagram.com/reel/DMhDTw7up7Q/ (thumb: `matt-loes.png`)
- Empty state: `No videos available yet. Check out our channel for the latest uploads.`

## 9. Shop / Merch

- Storefront: https://stoned-goose-productions-zgm-shop.fourthwall.com
- Featured collection: og-bigboy
- Heading: `Fresh Merch` / Subhead: `Rep the Goose. Look cool. Be happy.`
- Product highlights (3): Metal Goose ($20), LOGO Hoodie ($29), Sick Hat ($18.50)
- Full product list pulled from `attached_assets/content-1764791248744.md` (20 items)

## 10. Sponsor (sponsorships)

- Page heading: `Partner with the South Sound's fastest-growing comedy platform.`
- Subhead: `Sponsor recurring live comedy experiences and get in front of engaged audiences in Olympia, Lacey, Tacoma, and beyond.`
- One-sheet: `/sponsorship-one-sheet.txt`
- Stats: `1,200+` monthly in-room audience, `85K+` social impressions, `30K+` video views

Tiers:

| Tier | Price | Deliverables |
| --- | --- | --- |
| Bronze | $500/show | Logo on graphics + ticketing; 1 host shoutout; 1 pre-show social post |
| Silver | $1,250/month | Bronze + featured monthly promo reel + 2 host shoutouts + branded table signage + monthly recap email |
| Gold | $2,500/month | Silver + title sponsorship + 30s ad read + dedicated sponsored social clip + on-site activation support |

Inquiry form fields: name, company, email, tier of interest, sponsorship goals.
Success: `Thanks! We received your sponsorship inquiry and will follow up shortly.`

## 11. Submit (comic submissions)

- Heading: `Comic submissions` / Eyebrow: `Roster Pipeline`
- Body: `Want to be considered for future Stoned Goose showcases, feature slots, and production projects? Send us a clean submission using the requirements below so we can review your material quickly.`
- Submission requirements (verbatim):
  - 5-10 minute unlisted video link with clear audio.
  - Include current city, years performing, and social handles.
  - Material should represent your current set and stage tone.
  - One submission per comic every 90 days unless requested otherwise.
- Response time: `We review submissions on a rolling basis and typically respond within 2-3 weeks. High-volume periods can take up to 30 days. If it's a fit for current programming, we'll contact you directly for next steps.`
- Form: name, email, phone, city/region, years performing, social/website links, set tape URL, additional notes.
- Success: `Submission received. We review every tape and will reach out if there's a roster fit.`

## 12. SEO

- Site URL: https://www.stonedgooseproductions.com
- LocalBusiness schema: areaServed (Olympia, Lacey, Tacoma, South Sound, Thurston County, Pierce County, WA), sameAs (all socials), contactPoint (sales email + phone), address (Olympia, WA, US)
- Default OG: `/opengraph.jpg`
- Favicon: `/favicon.png`

## 13. Assets to migrate to /public

```
/public/
  covervideo.mp4
  favicon.png
  opengraph.jpg
  robots.txt
  sponsorship-one-sheet.txt
  images/
    members/
      kyle.png
      joseph.jpg
      brendan.png
      sam.png
      garrett-iverson.jpg
    comedians/
      [22 headshots, .jpg/.png as listed]
    media/
      Halloween.png
      matt-loes.png
    misc/
      dark_comedy_club_stage_with_neon_spotlights.png
      logo.png
```

## 14. Open questions / flags

- **Hero copy refinement**: the existing tagline `Crafting cinematic stand-up, curated showcases, and comedy chaos across your city.` is fine but a touch generic. Flagging only — preserved as-is unless user says otherwise.
- **Stats authenticity**: the 50+/20+/5,000+/8+ stats are unverified. Preserved as-is.
- **Testimonials**: 4 testimonials with what look like generic local-business names. Preserved as-is, flagged.
- **Em dashes in existing copy**: existing testimonials use em dashes (`—`). Per spec, preserved verbatim. New copy I generate will not use em dashes.
- **Xavier Rake's full special**: must be featured on `/shows` and `/watch`. Source video URL not in the codebase — needs to be supplied or pulled from YouTube channel at runtime.
- **Crew member count**: spec said "5 people: Joe Humphrey, Sam Tweed, Garrett Iverson, Kyle Mixon, and one more". The 5th is **Brendan Meeks** (Creative Director).
