# Editing the live site

The site is editable through Sveltia CMS at `/admin`. You sign in with
GitHub. Every save commits to the repo and triggers a deploy. Allow
~2 minutes for a change to appear on the live site.

## Get in

1. Visit `https://<your-domain>/admin`.
2. Sign in with the GitHub account that has access to this repo.
3. You'll see the sidebar listing each content area: Site copy, Pages,
   Comedians, Crew members, Services, Pricing tiers, Shows, Shop products,
   Open mics, TikTok videos.

## Add a new page

New pages live at `/<slug>` (e.g. `/about`, `/faq`, `/sponsorship-deck`).

1. In the sidebar, click **Pages → New Page**.
2. Fill in the **Title**. The URL slug is derived from it, so the page will be
   reachable at `/<slugified-title>` (e.g. "About" -> `/about`).
3. Optionally set **SEO description** and **Social share image**.
4. In **Page sections**, click **+** and pick a block type. Add as many as you want, in any order. Drag the handles to reorder.
5. Leave **Draft** unchecked when you're ready to publish.
6. Save. The deploy takes ~2 min, then the page is live.
7. To link to it from the nav, open **Site copy → Site config → Primary nav** and add `{ label: "About", href: "/about" }`.

### Reserved slugs

These names already point at hard-coded routes, so a page can't use them:
`shows`, `watch`, `roster`, `open-mics`, `book`, `contact`, `shop`, `admin`,
`api`, `_next`, `feed.xml`, `feed.ics`, `sitemap.xml`, `robots.txt`,
`favicon.ico`, `home`, `index`, `pagefind`, `opengraph-image`,
`twitter-image`, `manifest.webmanifest`. If one slips through, the build
rejects it on deploy (see `lib/reserved-slugs.ts`), so give the page a
different title.

## Block library

| Block | Use it for |
|---|---|
| Hero | A big top-of-page header with eyebrow, headline, italic tagline, subhead, and one or two CTAs. |
| Rich text | Plain prose. Blank line = new paragraph. Single newline = `<br>`. No em dashes (house rule). |
| Image with caption | A single image with alt text and optional caption. Pick a 16:9, 4:5, or 1:1 aspect. |
| Video embed | YouTube, TikTok, or Instagram. Paste the full URL (or an 11-char YouTube id). |
| Call-to-action strip | Big heading + button. Use it to push readers toward a specific next step. |
| Mailing list capture | Drops the email signup form into the page. Set a short tag for signup attribution. |
| Upcoming shows list | Reuses the list rendered on `/shows`. Always live. |
| Latest social strip | Pulls the latest Instagram / TikTok / News items. Pick how many to show. |
| Press quote strip | Reuses the press quotes from Site config. |
| Roster grid teaser | Comedian portrait grid. Pick how many to show. |
| Open mic teaser | The small open-mic-night highlight from the home page. |
| Services overview | The "What we do" overview block. |
| Shop strip | A few product cards from the shop. |

## Customize an existing marketing page

`Home`, `Shows`, `Watch`, `Roster`, and `Open mics` each have two block
arrays exposed in their singleton: **Top sections** (rendered just below the
page header / hero) and **Bottom sections** (rendered near the bottom, just
above the mailing list capture). Use these to drop in new blocks without
touching code, or to A/B a new CTA above the fold.

The core layout of these pages is still owned by code so the editorial
rhythm stays consistent. If you want a section moved, removed, or added to
the core layout, that's still a developer change.

## Edit the navigation

`Site copy → Site config → Primary nav`. Add or remove items. Each item is
`label` + `href`. Use absolute hrefs (`/about`, `/shows`, etc.).

## House rules the editor enforces

- **No em dashes** in long-form fields. Save will fail with a hint.
- **Drafts are hidden.** Anything with the Draft checkbox stays off the
  live site even after the deploy lands.

## When something looks wrong

- Wait 2-3 minutes. The deploy is async.
- Hard-refresh (Cmd-Shift-R / Ctrl-Shift-R) to bust the browser cache.
- Check the GitHub commit landed on `main`: every CMS save shows up as a
  commit by the GitHub account you signed in with.
- If the deploy is red, check your host's build log (e.g. the Cloudflare
  Pages dashboard). Most failures are a missing required field (e.g. an
  empty image alt).
