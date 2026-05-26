# Editing the live site

The site is editable through the Keystatic admin at `/keystatic`. You sign in
with GitHub. Every save commits to the repo and triggers a deploy. Allow
~2 minutes for a change to appear on the live site.

## Get in

1. Visit `https://<your-domain>/keystatic` (or `http://localhost:3000/keystatic` for dev).
2. Sign in with the GitHub account that has access to this repo.
3. You'll see the admin sidebar grouped by purpose: Pages, Site copy, Roster, Booking, Shows, Merch, Open mics, Posts.

## Add a new page

New pages live at `/<slug>` (e.g. `/about`, `/faq`, `/sponsorship-deck`).

1. In the sidebar, click **Pages → + Add Page**.
2. Set the **Slug**. Lowercase letters, numbers, hyphens. The page will be reachable at `/<slug>`.
3. Fill in **Title** and (optionally) **SEO description** and **Social share image**.
4. In **Page sections**, click **+** and pick a block type. Add as many as you want, in any order. Drag the handles to reorder.
5. Leave **Draft** unchecked when you're ready to publish.
6. Save. The deploy takes ~2 min, then the page is live.
7. To link to it from the nav, open **Site copy → Site config → Primary nav** and add `{ label: "About", href: "/about" }`.

### Reserved slugs

You can't use these slugs because they already point at hard-coded routes:
`shows`, `watch`, `roster`, `open-mics`, `book`, `contact`, `shop`, `keystatic`,
`api`, `_next`, `feed.xml`, `feed.ics`, `sitemap.xml`, `robots.txt`,
`favicon.ico`, `home`, `index`, `admin`, `pagefind`, `opengraph-image`,
`twitter-image`, `manifest.webmanifest`. Keystatic will block you on save.

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
- Check the GitHub commit landed on `main`: every Keystatic save shows up
  as a commit by the Keystatic Cloud bot.
- If the deploy is red, check the Vercel dashboard for the build log. Most
  failures are a missing required field (e.g. an empty image alt).
