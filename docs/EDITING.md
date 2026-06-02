# Editing the site

This site has a built-in editor at `/admin`. You sign in with GitHub,
change copy or images, click Save, and the live site rebuilds itself.
No code, no FTP, no CMS dashboard somewhere else.

## What you need once

1. A GitHub account with push access to this repo.
2. A laptop or phone browser. The editor is responsive. Phone is fine for
   text edits. Image cropping is easier on a laptop.

That's it. Nothing to install.

## How to open the editor

- Production: `https://www.stonedgooseproductions.com/admin`
- First visit: GitHub asks you to authorize the editor. Approve. You
  only do this once per browser.

## What you can edit

Left-nav groups in the editor map to the site like this:

| Group              | What's in it                                                                       | Where it shows                        |
| ------------------ | ---------------------------------------------------------------------------------- | ------------------------------------- |
| Site copy          | Brand name, tagline, contact info, social links, press, primary nav, footer, SEO   | Everywhere (nav, footer, meta)        |
| Site copy: Home    | Hero copy, section headlines, CTAs                                                 | `/`                                   |
| Site copy: Contact | Eyebrow, title, body, label strings, form copy                                     | `/contact`                            |
| Roster             | Members + comedians (name, bio, headshot, alt text, links, draft flag)             | `/roster`                             |
| Booking            | Services + pricing tiers                                                           | `/book` and `/book/[slug]`            |
| Shows              | Manual show overrides (date, venue, ticket URL, poster alt, draft flag)            | `/shows`                              |
| Merch              | Manual product overrides (price, link, image alt, draft flag)                      | `/shop`                               |
| Open mics          | Recurring mic listings                                                             | `/open-mics`                          |
| Posts              | News articles (featured + draft), TikTok video picks (draft + alt)                 | News and watch pages                  |

Anything not in that list is either auto-pulled from a feed (Instagram,
Facebook, YouTube, Eventbrite, Fourthwall) or lives in code and needs a
developer.

## What happens when you click Save

1. The editor commits the change to GitHub as you. You'll see your name in
   the commit history.
2. The host (Cloudflare Pages) detects the push and starts a deploy. Build
   time is roughly 2 to 4 minutes.
3. When the build finishes, the live site swaps over. There is no cache
   to clear and no "publish" button.

Refresh the public URL after a few minutes to see your change.

## What if the build fails

It is possible to save something that breaks the build (a malformed URL,
a required field left blank). In that case:

- The host keeps the previous version live. The site does not go down.
- Your host shows the deploy as "Failed" (check its dashboard).
- Open `/admin`, find the entry you edited, fix the value, save again.
  The next build picks it up.

The most common trip-wires:

- **Em dashes**: not allowed anywhere. The editor will reject them with a
  friendly error. Use a period, a comma, or split the sentence.
- **Empty required fields**: most copy fields require a minimum length.
  Trying to save with a blank tagline will fail before it ever commits.
- **Bad URLs**: URL fields validate. Paste the full `https://...`.

## How to roll back a change

If you saved something and want to undo it:

1. Open the GitHub repo: `https://github.com/KyleMix/stoned_goose_website`.
2. Click **Commits**, find the change you want to undo (your name + a
   recent timestamp).
3. Click the commit, then **Revert**. Push the revert (a button in the
   GitHub UI).
4. Vercel rebuilds with the prior content. About 2 to 4 minutes.

Or ask a developer to run `git revert <sha>` from the terminal. Same
result.

## Image uploads

When you upload an image in the editor:

1. The original lands in `public/images/...` on the next commit.
2. A separate GitHub Action automatically resizes and compresses the
   file. That posts a follow-up commit a minute or two later.
3. The follow-up commit triggers a second Vercel build. So one image
   upload typically means **two** deploys back-to-back. The site is live
   after the second one finishes.

Practical tips:

- Headshots and posters: upload the highest-quality original you have.
  The optimizer handles sizing.
- Aspect ratios matter. Roster portraits look best square or 4:5. Show
  posters are usually portrait. The editor previews how an image will
  crop.

## What only a developer can change

- Routes, page structure, components
- Fonts, colors, accent rules
- Anything in `app/`, `components/`, `lib/`
- Feed configuration, env variables, host settings
- The editor schema itself (the fields you see in the editor)

If you need a new field on a page, ask a developer to add it to
`public/admin/config.yml`. After that you can edit it forever in `/admin`.

## Two-person editing

If two people edit the same entry at the same time, the editor will warn
the second person at Save time and ask them to refresh. The first save
wins. Resolve the conflict in the editor (re-apply your changes on top
of the latest version) and save again.

## Drafts

Most collections (news, comedians, members, shows, shop, TikTok) have a
**Draft** checkbox. Tick it and the entry disappears from the public site
on the next build. Untick it to publish. Useful for staging a news post
or holding back a comedian portrait until it's ready.

News posts also have a **Featured** checkbox. Featured posts pin to the
top of the Latest strip regardless of date.

## Image alt text

Every image field is paired with an **Alt text** field. Fill it with a
short description of what's in the image. Screen readers and SEO use it.
Leave it blank only for purely decorative images. Defaults to the entry
name when empty.

## Daily-use checklist

- Want to swap the tagline? **Site copy → Site config → Tagline → Save.**
- Want to reorder the top nav? **Site copy → Site config → Primary nav → drag → Save.**
- Want to add a comedian? **Roster → Comedians → New → fill out → Save.**
- Want to publish a news post? **Posts → News → New → fill out → uncheck Draft → Save.**
- Want to update pricing? **Booking → Pricing tiers → edit row → Save.**

Each one is a single commit, a single build, live within a few minutes.

## Where the content actually lives

For anyone curious: every saved change is a JSON or Markdown file in the
repo under `content/`. The site reads those files at build time. The
"database" is the Git history. Nothing else.
