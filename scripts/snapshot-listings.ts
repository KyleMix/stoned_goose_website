// What /shows lists right now -> content/.generated/listed-shows.json.
//
// This file exists to trigger a deploy. The site is a static export, so a
// show only comes off the page when the site is rebuilt, and Cloudflare only
// rebuilds on a push. Eventbrite shows already cause one (the sync drops them
// from shows.json the day after), but a headliner with no event yet, or a
// show added by hand in the CMS, changes no synced file when its date passes.
//
// The refresh-feeds workflow runs this every 6 hours and commits the result.
// The list only changes when a show drops off or appears, so most runs commit
// nothing, and the first run after midnight Pacific on the day after a show
// pushes the commit that rebuilds the site without it.
//
// Run: npm run snapshot:listings   (after content:index)

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { upcomingShows } from "../content/shows";

const OUT = join(process.cwd(), "content", ".generated", "listed-shows.json");

const listed = upcomingShows.map((s) => ({ id: s.id, start: s.start }));
const next = JSON.stringify(listed, null, 2) + "\n";
const prev = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";

if (next !== prev) {
  writeFileSync(OUT, next, "utf8");
  console.log(`[snapshot:listings] listing changed, ${listed.length} shows.`);
} else {
  console.log("[snapshot:listings] listing unchanged.");
}
