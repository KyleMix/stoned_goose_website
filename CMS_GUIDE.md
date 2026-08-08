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
  Shows, Watch, Roster, Open mics, Shop, and Contact pages. Sponsorship
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
- **Open mics**: every mic on the /open-mics/map map and list. Comics drive to
  these, so keep days and times honest.
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
