# Open mic pre sign up list

The Log Cabin Comedy Open Mic moved from a clipboard at 6:00 PM to a pre sign
up list on `/open-mics`, starting **Monday 28 September 2026**.

- **12 spots** a night, **8 minutes** each.
- **4 Mondays** open at a time.
- Comics see **how many spots are left**, never **who has them**.
- The list is **exportable as CSV** (running order included).
- A Monday's list is **deleted the night it happens**, and the next Monday
  **joins the board on Tuesday morning**.

Nothing about that rotation is a separate scheduled job. The window is one
function, `micWindow()` in [`lib/open-mic-schedule.ts`](../lib/open-mic-schedule.ts),
and both the page and the Worker read it, so "the previous one is deleted the
night before" and "the latest one posts Tuesday morning" cannot drift apart.

---

## Where the pieces are

| File | What it does |
|---|---|
| [`lib/open-mic-schedule.ts`](../lib/open-mic-schedule.ts) | The rules. Slot count, spot length, window size, series start, and the rolling four Monday window. **Single source of truth.** |
| [`worker/index.ts`](../worker/index.ts) | The API. Counts, sign ups, the CSV export, and the nightly purge. |
| [`worker/schema.sql`](../worker/schema.sql) | The D1 table and its UNIQUE constraints. |
| [`components/open-mic/signup-board.tsx`](../components/open-mic/signup-board.tsx) | The board and form on the page. |
| [`content/log-cabin-mic/index.json`](../content/log-cabin-mic/index.json) | The words, editable at `/admin`. |
| [`scripts/test/open-mic-schedule.test.ts`](../scripts/test/open-mic-schedule.test.ts) | Pins the rotation, including the Tuesday turnover and both DST changes. |
| [`scripts/test/open-mic-worker.test.ts`](../scripts/test/open-mic-worker.test.ts) | Drives the Worker against a stub D1: the cap, the running order, privacy, the export, the purge. |

### The numbers are not in the CMS, on purpose

12, 8, 4 and the start date live in `lib/open-mic-schedule.ts`, which the
Worker imports. If the slot count were a CMS field, an editor could set it to
13 and the page would advertise a spot the database then refuses to sell. The
comic finds that out at the moment of sign up. Changing the format is a code
change plus a test run, not an edit.

The **copy** around the list is fully editable: `/admin` > Open mic page (Log
Cabin) > **Sign up list copy**.

---

## Deploying it

This is still a static export with no server build and no Next adapter. What
was added is a hand written Worker in front of the same `/out` assets, scoped
to `/api/*` by `assets.run_worker_first` in
[`wrangler.jsonc`](../wrangler.jsonc). Every page, image and asset is served
exactly as before.

Needs **Wrangler 4.20 or newer** (`run_worker_first` only takes a list of globs
from that version on).

### 1. Create the database

```sh
npx wrangler d1 create stoned-goose-open-mic
```

Paste the `database_id` it prints into `wrangler.jsonc`, replacing
`REPLACE_WITH_D1_DATABASE_ID`. **The deploy will fail until you do.**

### 2. Create the table

```sh
npx wrangler d1 execute stoned-goose-open-mic --remote --file worker/schema.sql
```

### 3. Set the export token

Any long random string. This is the only thing standing between the internet
and comics' email addresses, so generate it rather than choosing it:

```sh
openssl rand -hex 24
```

Copy what it prints, **save it in your password manager**, then paste it when
this prompts you:

```sh
npx wrangler secret put OPEN_MIC_EXPORT_TOKEN
```

Two steps on purpose. Piping `openssl` straight into `wrangler secret put`
risks storing the trailing newline as part of the secret, and the Worker
compares the token by exact length before anything else, so the export would
401 every time with nothing in the logs to say why. It also leaves you without
a copy of a secret you cannot read back out of Cloudflare.

Losing it costs one `wrangler secret put`; leaking it costs the list.

### 4. Lock the sign up form to our own origin

```sh
npx wrangler secret put OPEN_MIC_ALLOWED_ORIGINS
# https://www.stonedgooseproductions.com
```

Optional. Left unset, the Worker compares the `Origin` header against whatever
host the request arrived on, which is the same rule with one less thing to
keep in sync. Set it if the site is ever served from more than one hostname.

### 5. Deploy

```sh
npm run build && npx wrangler deploy
```

The nightly purge is a cron trigger in `wrangler.jsonc` and needs nothing else
switched on.

### 6. Check it end to end

```sh
curl -s https://www.stonedgooseproductions.com/api/open-mic/slots
```

Four Mondays, `"remaining": 12` on each. Then take a spot on the real page and
run it again.

---

## Getting the list

Open this in a browser, or `curl` it:

```
https://www.stonedgooseproductions.com/api/open-mic/export?token=YOUR_TOKEN
```

That downloads all four Mondays. For one night's running order, add the date:

```
https://www.stonedgooseproductions.com/api/open-mic/export?token=YOUR_TOKEN&date=2026-09-28
```

Columns: `Monday, Slot, Name, Email, Instagram, Signed up`. Slot is the
position on the running order, 1 to 12, in the order comics signed up.

The token also works as a header, which is the better habit when you are at a
terminal anyway:

```sh
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://www.stonedgooseproductions.com/api/open-mic/export -o mic.csv
```

**A note on the query parameter form.** A URL with a secret in it lands in
browser history and in any proxy log along the way. It is supported because
the export is genuinely needed on a phone on a Monday afternoon, and the
alternative is a login screen this site has no server to host. The exposure is
bounded: the token is read only, it reaches a list that is deleted weekly, and
rotating it is one command. Do not paste that URL into a group chat.

### Privacy, and what it rests on

`GET /api/open-mic/slots` is the only public endpoint, and it returns counts.
There is no endpoint that returns a name without the export token. That is
enforced in the Worker, not in the page, because a client side filter is not a
privacy boundary. `scripts/test/open-mic-worker.test.ts` asserts that the
public query does not so much as `SELECT` a name or an email.

Rows are deleted, not archived, once their Monday drops off the board. There
is no soft delete and no `deleted` flag, because either would mean the site is
quietly keeping every comic's email forever. If you want a record of who has
played, export the CSV before the night is over.

---

## The flyer

The flyer field in the CMS is **empty on purpose**. The old artwork says
*sign ups 6 PM*, which is no longer true, and a page that contradicts its own
flyer is worse than a page with no flyer. `/open-mics` renders the copy full
width while the field is empty, so nothing looks broken.

Upload the new one at `/admin` > Open mic page (Log Cabin) > **Flyer**, and
update the alt text in the field beneath it at the same time. It appears on the
page immediately.

The Express document to edit:
<https://new.express.adobe.com/id/urn:aaid:sc:US:160a8be6-b34e-4f19-8e78-fb696c1f7d8a?category=search&pageId=e7483684-5970-4c60-a434-2d4c12fd7763>

### What the new flyer needs to say

Replacing the old sign up line is the only substantive change. Everything else
on the old flyer is still accurate.

- **Remove:** "Sign ups 6 PM" and anything implying a day-of list. Drop the
  "to 9 PM" end time too.
- **Add:** `12 SPOTS / 8 MINUTES` and `SIGN UP AT STONEDGOOSEPRODUCTIONS.COM/OPEN-MICS`
- **Keep:** Log Cabin Comedy Open Mic, Every Monday, Log Cabin Bar & Grill,
  7035 Pacific Ave SE, Olympia, WA 98503.
- **One time only:** `SHOW STARTS AT 7 PM`. No sign up time, and no end
  time: the room publishes the start and nothing else.
- **Motto:** now "Sign up, show up, go up." (was "Show up, go up.")

Brand rules, same as everywhere:

- Tuxedo `#0F0F0F` or ivory `#F4EEE2` background. **Never a gold background.**
- Gold `#D4AA4A` for the headline and rules. Gold never carries body text.
- Josefin Sans only, weights 300 / 400 / 700. No italics.
- Headlines uppercase and letterspaced. Body sentence case and Light.
- The **lockup** (goose with joint, wordmark beneath), not the badge: a flyer
  is sold to an audience. Do not add padding around it, the clear space is in
  the file. Do not recolor it, every colorway is its own file in
  `public/brand/`.
- No gradients, no shadows, no glows, no photo overlays.
- No em dashes.

Export square (1080 x 1080) as `.webp` or `.jpg`. The page renders it at
1080 x 1080 inside a Smoke hairline.

---

## Changing the format later

Everything below is one edit in `lib/open-mic-schedule.ts` followed by
`npm test`:

| To change | Edit |
|---|---|
| Spots per night | `MIC_SLOT_COUNT` |
| Minutes per spot | `MIC_SPOT_MINUTES` |
| Mondays on the board | `MIC_WINDOW_WEEKS` |
| The first Monday | `MIC_SERIES_START` |

Two of those need a thought first:

- **Lowering `MIC_SLOT_COUNT`** does not remove anyone already signed up past
  the new cap. Those comics keep their spots and the night reads as
  over-full until it rotates off. Export first if it matters.
- **`MIC_SERIES_START`** only ever clamps the window forward. Moving it into
  the past does nothing; moving it into the future parks the board on that
  date.

Moving the room off Mondays is a bigger change: the `MONDAY` constant and
`micWindow()` both assume one night a week, and the rotation copy on the page
and in the CMS says Monday and Tuesday out loud.

## Troubleshooting

**The board says "12 spots" instead of a count.** The page reached the site
but not the Worker. Check `npx wrangler tail` and that `database_id` in
`wrangler.jsonc` is real.

**Every sign up 403s.** `OPEN_MIC_ALLOWED_ORIGINS` is set to something other
than the hostname people are actually on. Unset it or fix it.

**The export 503s.** `OPEN_MIC_EXPORT_TOKEN` is not set on the Worker. An
unconfigured token closes the export rather than opening it.

**A Monday that has happened is still on the board.** The purge is belt and
braces, not load bearing: `slots` recomputes the window on every request and
only asks about the dates in it, so a stale row cannot reach the page. If you
are seeing one, the page is cached. Check that `/api/open-mic/slots` answers
with `Cache-Control: no-store`.
