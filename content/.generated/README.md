# Generated content cache

JSON files in this directory are written by `npm run sync:*` scripts and
imported by sibling files in `content/`. They're committed so static deploys
work without re-running syncs at every build. CI cron workflows refresh them
on a schedule.

Delete a file here to force the next sync run to start fresh.

## Why these are committed, and what that costs

The site is a static export and the deploy has no credentials, so the last
good sync has to ship in the repo. There is no server to fetch at request
time and no build step that can be trusted to reach Eventbrite or a club's
website. That makes the committed JSON the source of truth for the live site,
and it makes every sync script a potential deleter.

`refresh-feeds.yml` auto-commits `shows.json` and `pro-shows.json` every six
hours under a single routine message, so a bad write does not arrive looking
like anything worth reading.

## The rule the writers follow

**A sync never replaces real listings with nothing.**

An outage is the easy case and was always handled: the fetch returns null and
the previous JSON stands. The dangerous case is the request that *succeeds*
and carries nothing. A revoked token scope, a mistyped organizer id, a club
redesign, a bot interstitial served with a 200: all of them parse to an empty
list, which is indistinguishable from a genuinely cleared calendar unless you
check what was there a moment ago.

So both writers check:

- `sync-shows.ts` keeps the committed JSON when Eventbrite returns zero
  upcoming events and the file already has some (`hasUpcoming`).
- `sync-pro-shows.ts` makes that call per club (`reconcileClub`), so one
  broken adapter cannot empty the others.

Neither guard can strand stale data. Kept shows still age out against the
same cutoff as fresh ones, so a venue that really has gone dark drains on its
own within a few weeks and then writes empty freely.

`scripts/test/sync-guards.test.ts` pins all of this, including the cases that
must stay *writable*, and runs in `npm test`.

## Only real changes are written

`sync-pro-shows.ts` used to stamp a new `fetchedAt` on every run, so the
6-hourly cron committed a diff about 1400 times a year whether or not a single
show had moved. That noise is what made a real deletion invisible. It now
leaves the file alone when the listing is byte-identical.

This means a dirty `content/.generated/` is worth reading, and `fetchedAt` on
`/calendar` now means the lineup changed rather than that a job ran.

## The indexes must match their source

`*-index.json` is a different kind of file from the sync output. It is a pure
function of the CMS collection directories, rebuilt by `build-content-index.ts`
in `prebuild`, and it is committed so a fresh clone can typecheck and so
`next dev` can boot. The deploy does not depend on it: `prebuild` regenerates
it before `next build`, and `dev` regenerates it before `next dev`.

That makes drift quiet rather than dangerous, and quiet is the problem. The CMS
writes to `content/<collection>/` directly and never runs the generator, so an
edit or a delete made in `/admin` leaves the index behind. Every build and every
`npm run dev` then rewrites the file, so the tree is dirty before anyone has
typed anything, and this directory turns into one people stage without reading.
That habit is what turns a bad write into a committed one.

`scripts/test/content-index-drift.test.ts` regenerates into a temp directory and
compares. It names the entries that moved and the command that fixes them. It
found five open mics deleted through the CMS in `8baa3a0` still sitting in the
committed index seven weeks later.
