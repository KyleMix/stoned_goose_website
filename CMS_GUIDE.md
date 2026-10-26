# Editing the site: the short guide

The site has a built-in editor at `/admin`. You change words and images in a
form, hit Save, and the live site rebuilds itself. No code involved.

## Log in

1. Go to `https://www.stonedgooseproductions.com/admin`.
2. Click **Sign in with GitHub** and use the GitHub account that has access
   to this repo. You approve it once per browser.

Every save becomes a commit on the repo and the site redeploys on its own.
Give it about two minutes, then refresh the live page.

## Add a show

1. In the left sidebar, click **Shows and events**, then **Create**.
2. Fill in the name and the date and start time. That is the minimum.
3. Pick a ticket status. If tickets are on sale, choose Ticketed and paste
   the ticket link (it has to start with https://).
4. Add the venue, price, door time, a short description, and a poster if you
   have them. Every field explains itself under the box.
5. Leave "Hide from the site" off and hit **Save**.

The show appears on /shows and in the ticket strip at the top of the home
page. One thing to know: if the automatic Eventbrite sync is turned on and
finds shows, the synced list replaces the manual one.

## Add a headliner

Headliners get the big card on /shows: photo, credits, bio, and flyer, plus
their own page at `/shows/their-name` to put in the Instagram bio. Shared
anywhere, that page previews with the comic's photo, date, and venue.

### The usual way: let Eventbrite start it

1. Publish the event on Eventbrite with a title like
   **"Josh Johnson Live in Olympia"** (anything after "Live in" is fine, e.g.
   "| Stand-Up Comedy at the Eagles"). Free events are skipped.
2. Within about 6 hours the site creates a **Headliners** entry for that comic
   on its own, linked to the event.
3. Open **Headliners**, find the comic, and upload the arch headshot, the
   cutout, and the flyer under **Images**. Add credits and a bio if you have
   them. Save.

The date, time, venue, ticket link, and price all come from Eventbrite and
stay in sync: change them on Eventbrite and the site follows on the next sync.
The price shown is the ticket's face value from Eventbrite with
"+ Eventbrite fees" after it. Typing a **Base ticket price** in the CMS
overrides it.

An event titled any other way (no "Live in") is not picked up. Add that
headliner by hand as below.

### By hand, before the event is on Eventbrite

1. Click **Headliners**, then **Create**.
2. Fill in the name exactly as it will read in the Eventbrite title, and a
   link name like `matt-ross`.
3. Add the show date, the price from the flyer (`$20`), the credits, the bio,
   and the images.
4. Leave **Eventbrite event ID** blank. The card shows with "Tickets coming
   soon" and the venue and times from **Site copy > Shows page copy >
   Headliner show defaults**.
5. When the event goes live on Eventbrite it is matched by name (or paste its
   ID, the number at the end of the Eventbrite link) and the card switches to
   the live event. No duplicate card, and no second entry.

### When the show is over

Every show stays on the page through its date and comes off the next morning,
along with the comic's own page. Nothing to do. The Headliners entry stays in
the CMS, so a comic who comes back is already set up.

Sharper web copies of the photos and flyer are made automatically a minute or
two after you save.

## Upload images

Image fields have an upload button; each one tells you the shape and size it
wants (portraits are vertical 3:4, posters and news images are wide 16:9).
Phone photos are fine. Big files get compressed automatically about a minute
after you save, so do not worry about size.

If a save fails with a red message, read it. Every rule has a plain
explanation, like a ticket link needing to start with https://.

## What everything in the sidebar is

- **Site copy**: the words on the main screens. Home page, Site config
  (brand, contact info, social links, menu, footer), and the copy for the
  Shows, Watch, Roster, Open mic, Shop, and Contact pages. Sponsorship
  packages and the pro comedy club list live here too.
- **Shows and events**: your shows. Covered above.
- **Pro calendar extras**: hand-added shows for the regional pro comedy
  calendar. Most of that calendar fills itself from the clubs; only add one
  here when a listing is missing or wrong.
- **Comedians**: the roster grid. Give someone a bio or a reel link and they
  get their own page at /roster/their-name.
- **Crew members**: the production crew on /roster. The two-digit display
  order decides who shows first.
- **Services (what we do)**: the bookable offerings on /book, one page each.
- **Show packages (Build Your Show)**: the three packages the estimator on
  /book recommends.
- **Shop products (manual backup)**: a hand-kept product list for /shop.
  When the Fourthwall sync is connected, the live store replaces it.
- **TikTok videos**: hand-picked clips for the Latest strip on the home page.
- **News posts**: announcement cards on /watch and the home Latest strip.
- **Extra pages**: standalone pages built from blocks. A page titled "About"
  goes live at /about. To put it in the menu, edit Site copy, Site config,
  Primary nav.

## House rules the editor enforces

- No em dashes, anywhere. Use a period, comma, or colon. The editor rejects
  them, and so does the build.
- No invented stats or fake quotes. If it is not real, it does not go up.
- One accent color and the brand voice are handled by the site itself; you
  only supply words and images.

## If something goes wrong

- **Save rejected with a red message**: fix the field it points at. The
  message says what it wants.
- **Saved but the site did not change**: wait two minutes, then hard-refresh
  (Ctrl+Shift+R). Still nothing? The build may have failed; a developer can
  check the Cloudflare deploy log. The site never half-updates: a failed
  build keeps the previous version live.
- **Cannot log in**: the sign-in relay or your GitHub access is the issue.
  See "Editing with Sveltia CMS" in SERVER_DEPLOYMENT.md.

## For developers: edit locally without auth

1. `npm run dev`
2. Open `http://localhost:3000/admin/index.html` in Chrome or Edge.
3. Click **Work with Local Repository** and pick the repo folder.
4. Edits write to your working tree; commit and push yourself.

The editor is Sveltia CMS, pinned in `public/admin/index.html`, configured
by `public/admin/config.yml`. Content lives in `content/`, is validated by
`npm run content:validate` on every build, and is consumed through the typed
shims in `content/*.ts`.
