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

### 1. Create the database, and put its id in the config

```sh
npx wrangler d1 create stoned-goose-open-mic
```

**Then paste the `database_id` it prints into `wrangler.jsonc`, replacing
`REPLACE_WITH_D1_DATABASE_ID`.** Do not skip to step 2: every later step
addresses the database by that id, so the very next command fails with
`Invalid property: databaseId => Invalid uuid [code: 7400]`, which reads like
an API problem and is really just the placeholder.

Read the id back at any time with `npx wrangler d1 list`, then patch the config
in place:

```sh
sed -i 's/REPLACE_WITH_D1_DATABASE_ID/<the-uuid>/' wrangler.jsonc
```

Or have the shell look it up. Note the quoting: this deliberately contains no
`!`, because an interactive bash does history expansion inside double quotes
and mangles any script that has one.

```sh
ID=$(npx wrangler d1 list --json | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')).find(x=>x.name==='stoned-goose-open-mic');process.stdout.write(d?(d.uuid||d.id):'')")
test -n "$ID" && sed -i "s/REPLACE_WITH_D1_DATABASE_ID/$ID/" wrangler.jsonc && grep database_id wrangler.jsonc
```

An empty `$ID` means the database does not exist yet; run the create above.

The id is not a secret. It gets committed, and it has to be, or a deploy from
anywhere but your own checkout has nothing to bind to.

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

### Rotating it later

Do this any time the token has been seen: pasted into a chat, read off a shared
screen, mailed to somebody, or printed by `openssl` in a terminal whose output
got copied somewhere.

```sh
npx wrangler deploy

openssl rand -hex 24 | tr -d '\n' > /tmp/tok
npx wrangler secret put OPEN_MIC_EXPORT_TOKEN < /tmp/tok
cat /tmp/tok      # copy into the password manager, then:
shred -u /tmp/tok
```

Three things there are load bearing.

The `wrangler deploy` first. Rotating a secret on a Worker whose latest version
is not the deployed one fails with "Secret edit failed. You attempted to modify
a secret, but the latest version of your Worker isn't currently deployed." That
is Cloudflare refusing to deploy a version you did not ask it to deploy, not a
problem with the secret. Deploying makes latest and deployed the same again.
`npx wrangler versions secret put` is the other way out, but it writes a new
version without deploying it, so the new token does not take effect until you
deploy anyway.

The `tr -d '\n'`. It is what makes the file redirect safe, by stripping the
newline `openssl` adds. Without it the newline can be stored as part of the
secret, and since the Worker compares length first, every export 401s with
nothing in the logs.

The rotation takes effect immediately, with no further deploy. The old token
stops working the moment the new one is stored.

### 4. Extra origins, if you have any

**Skip this.** You almost certainly do not need it.

The sign up POST is already locked to the host the request arrived on, with no
configuration: a page on another domain cannot post the form on a visitor's
behalf, and that holds on every hostname this Worker answers on at once, which
is the apex, the `www`, `workers.dev`, and any preview URL.

`OPEN_MIC_ALLOWED_ORIGINS` **adds** origins on top of that, comma separated,
for the case where the form is embedded on a genuinely different domain:

```sh
npx wrangler secret put OPEN_MIC_ALLOWED_ORIGINS
# https://someone-elses-site.example
```

Setting it to our own canonical origin is the one thing not to do. It is
harmless now, but it was actively broken before: the list used to replace the
same-host rule instead of adding to it, so naming `https://www.…` refused
every other hostname, and a comic on the apex domain got "Sign ups only work
from the site itself" while standing on the real site. If the secret is set to
our own origin from that era, delete it, it is doing nothing:

```sh
npx wrangler secret delete OPEN_MIC_ALLOWED_ORIGINS
```

### 5. Confirmation emails (Resend)

Skip this and sign ups still work; comics just get the on-page confirmation
and nothing in their inbox. **But read the privacy section below before you
decide to leave it off**: the removal link in that email is the only way a
comic can get off the roster, and keeping their details with no way out is not
a position to be in.

1. Sign up at <https://resend.com> and add `stonedgooseproductions.com` as a
   domain. Free tier is 3,000 a month; this room uses about 50.
2. Resend prints three DNS records (a `TXT` for SPF, a `CNAME` or `TXT` for
   DKIM, and usually a DMARC `TXT`). Add them in Cloudflare under DNS for the
   domain. **Do not skip these.** Unauthenticated mail from your domain goes
   to spam, and worse, it teaches mailbox providers to distrust the domain
   your booking email also comes from.
3. If your email is on Google Workspace, you already have an SPF record. Do
   not add a second one: a domain with two SPF records fails SPF entirely.
   Merge Resend's `include:` into the record you have.
4. Wait for Resend to show the domain as verified, then:

```sh
npx wrangler secret put RESEND_API_KEY
# paste the key from the Resend dashboard
```

Two optional settings, as plain vars rather than secrets, if the defaults are
wrong:

```sh
npx wrangler secret put OPEN_MIC_FROM_EMAIL
# Log Cabin Open Mic <mic@stonedgooseproductions.com>
npx wrangler secret put OPEN_MIC_REPLY_TO
# kyle@stonedgooseproductions.com
```

The address in `OPEN_MIC_FROM_EMAIL` has to be on the domain you verified.
Sending as `@gmail.com` will be rejected.

Sending is best effort and happens after the response, so a Resend outage
cannot fail a sign up: the comic has their slot on screen before the email is
attempted. Failures land in `npx wrangler tail` with Resend's own message,
which is nearly always an unverified domain.

### 6. The host token

For whoever runs the room. See "Handing the list to whoever is running the
mic" below.

```sh
openssl rand -hex 24 | tr -d '\n' > /tmp/host
npx wrangler secret put OPEN_MIC_HOST_TOKEN < /tmp/host
cat /tmp/host
shred -u /tmp/host
```

### 7. Deploy

```sh
npm run build && npx wrangler deploy
```

The nightly purge is a cron trigger in `wrangler.jsonc` and needs nothing else
switched on.

### 8. Check it end to end

```sh
curl -s https://www.stonedgooseproductions.com/api/open-mic/slots
```

Four Mondays, `"remaining": 12` on each. Then take a spot on the real page and
run it again.

---

## Handing the list to whoever is running the mic

Send them this, with the host token on the end:

```
https://www.stonedgooseproductions.com/open-mics/run-of-show?token=HOST_TOKEN
```

A phone-sized running order: slot, name, Instagram handle, a button per Monday
and a refresh. No email addresses, ever, whatever the URL says. They can
bookmark it and it keeps working week to week, because it defaults to the
front of the window, which on a Monday is that night.

Set the token once:

```sh
openssl rand -hex 24 | tr -d '\n' > /tmp/host
npx wrangler secret put OPEN_MIC_HOST_TOKEN < /tmp/host
cat /tmp/host      # this is the one you paste into the link
shred -u /tmp/host
```

When somebody stops running the room, rotate just this one and send the new
link to whoever took over. Your export keeps working throughout.

## Getting the list yourself

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

### The comedian roster

Same token, different route. This is the one that survives the weekly purge:

```
https://www.stonedgooseproductions.com/api/open-mic/roster?token=YOUR_TOKEN
```

Columns: `Name, Email, Instagram, First signed up, Last signed up, Spots
taken`, newest first. `Spots taken` is the useful column when booking: it
separates the comics who keep turning up from the ones who came once.

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
No endpoint returns a name without a token. That is enforced in the Worker,
not in the page, because a client side filter is not a privacy boundary.
`scripts/test/open-mic-worker.test.ts` asserts that the public query does not
so much as `SELECT` a name or an email.

Two lifetimes, and the page states both:

- **The running order** (`signups`) is deleted once its Monday drops off the
  board. Operational data with an expiry date.
- **The roster** (`comedians`) is kept. Name, email, handle, first and last
  seen, and how many spots they have taken, so there is somebody to call when
  a show needs booking.

Keeping the second one is only defensible because the person handing the
details over is told it is happening and can get back out. Three things carry
that, and none of them is optional decoration:

1. The privacy note under the sign up board says the roster exists and what is
   on it. It is CMS-editable, and the field hint says not to cut that part.
2. Every confirmation email carries a removal link, plus `List-Unsubscribe`
   headers so Gmail and Outlook can offer it in their own UI.
3. Removal is honoured permanently. The row is kept with the name and handle
   blanked and `removed_at` set, so a sign up next month does not put somebody
   back on a list they asked to leave. `GET /api/open-mic/roster` never
   returns a removed row.

If you turn the confirmation email off, you have taken away the only removal
route a comic has while still keeping their details. Don't.

### The three credentials

| Token | Reaches | Give it to |
|---|---|---|
| `OPEN_MIC_EXPORT_TOKEN` | Both CSVs. Names, emails, handles, the roster. | Nobody but you. |
| `OPEN_MIC_HOST_TOKEN` | One night's running order. Slot, name, handle. **No emails.** | Whoever is running the room. |
| Link tokens | One row, one action, for the person that row is about. | Mailed automatically. |

The host token is a separate route rather than a narrower view of the export
on purpose: a credential that physically cannot return contact details is safe
to hand to somebody who is only around on Mondays, and rotating it when they
stop being does not break your export.

Link tokens are random UUIDs stored on the row. `GET` on those routes only
reports what the token refers to; the action needs a `POST`. Mail clients and
security scanners fetch links nobody clicked, and a cancel on `GET` would
release spots by itself.

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

**The export 401s with the right token.** The stored secret probably has a
trailing newline, from piping `openssl` into `wrangler secret put`. The Worker
compares length first, so it never matches. Set it again by pasting at the
prompt, per step 3.

**`Invalid uuid [code: 7400]` from any d1 command.** `wrangler.jsonc` still
says `REPLACE_WITH_D1_DATABASE_ID`. See step 1.

**`Secret edit failed ... latest version of your Worker isn't currently
deployed`.** Run `npx wrangler deploy`, then set the secret. See "Rotating it
later" above.

**No confirmation email arrives.** `npx wrangler tail`, then take a spot. The
log says which: `RESEND_API_KEY unset, skipping` means step 5 is not done;
`resend 403` with a message about the domain means the DNS records are not
verified yet; `no unsubscribe token, not sending` means the roster write
failed, so the email was withheld rather than sent without a removal link.

**Email lands in spam.** The DNS records from step 5 are missing, incomplete,
or there are two SPF records on the domain. Check with
`dig TXT stonedgooseproductions.com` that exactly one `v=spf1` record exists.

**A cancel link says "Nothing to release".** Already used, or that Monday has
rotated off the board and been purged. Both are expected.

**Sign ups 403 with "Sign ups only work from the site itself".** The `Origin`
header did not match the host the request arrived on, and is not in
`OPEN_MIC_ALLOWED_ORIGINS` either. On a normal deployment this should be
impossible, so check whether that secret is set to something. If it is set to
our own origin, delete it: `npx wrangler secret delete
OPEN_MIC_ALLOWED_ORIGINS`. See step 4. Counts loading fine while sign ups 403
is the signature of this, since only the write path checks the origin.

**A Monday that has happened is still on the board.** The purge is belt and
braces, not load bearing: `slots` recomputes the window on every request and
only asks about the dates in it, so a stale row cannot reach the page. If you
are seeing one, the page is cached. Check that `/api/open-mic/slots` answers
with `Cache-Control: no-store`.
