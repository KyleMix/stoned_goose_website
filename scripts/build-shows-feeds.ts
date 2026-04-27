// Generates per-show .ics, a combined feed.ics, and an RSS feed.xml inside
// /out/shows after `next build` finishes. Runs as `postbuild`. Reads from
// content/shows.ts (the file may itself import from content/.generated/).
//
// Static-export only: there's no server, so calendar data is baked into /out
// once per deploy. Re-run on schedule via GitHub Actions to refresh.
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createEvents, type EventAttributes, type DateArray } from "ics";
import { Feed } from "feed";
import { upcomingShows, type Show } from "../content/shows";
import { site } from "../content/site";

const OUT_DIR = join(process.cwd(), "out", "shows");

function isoToDateArray(iso: string): DateArray {
  const d = new Date(iso);
  return [
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
  ];
}

function showToEvent(show: Show): EventAttributes | null {
  if (!show.start) return null;
  const startIso = show.start;
  const endIso =
    show.end ??
    new Date(new Date(startIso).getTime() + 2 * 60 * 60 * 1000).toISOString();

  return {
    uid: `${show.id}@stonedgooseproductions.com`,
    title: show.name,
    description: show.summary,
    start: isoToDateArray(startIso),
    startInputType: "utc",
    end: isoToDateArray(endIso),
    endInputType: "utc",
    location: [
      show.venue?.name,
      show.venue?.city,
      show.venue?.region,
    ]
      .filter(Boolean)
      .join(", ") || undefined,
    url: show.ticketUrl ?? show.url ?? `${site.url}/shows`,
    organizer: { name: site.name, email: site.contact.email },
    productId: "stoned-goose-productions/ics",
  };
}

function writeIcs(filename: string, events: EventAttributes[]) {
  if (events.length === 0) return;
  const { error, value } = createEvents(events);
  if (error) {
    console.warn(`[shows-feeds] ics error for ${filename}:`, error);
    return;
  }
  if (!value) return;
  writeFileSync(join(OUT_DIR, filename), value, "utf8");
}

function writeRss(shows: Show[]) {
  const feed = new Feed({
    title: `${site.name} Shows`,
    description: "Upcoming live comedy dates from Stoned Goose Productions.",
    id: `${site.url}/shows`,
    link: `${site.url}/shows`,
    language: "en",
    favicon: `${site.url}/favicon.png`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${site.name}`,
    feedLinks: { rss2: `${site.url}/shows/feed.xml` },
    author: {
      name: site.name,
      email: site.contact.email,
      link: site.url,
    },
  });

  for (const show of shows) {
    if (!show.start) continue;
    feed.addItem({
      title: show.name,
      id: `${site.url}/shows#${show.id}`,
      link: show.ticketUrl ?? show.url ?? `${site.url}/shows`,
      description: show.summary,
      date: new Date(show.start),
    });
  }

  writeFileSync(join(OUT_DIR, "feed.xml"), feed.rss2(), "utf8");
}

function main() {
  if (!existsSync(join(process.cwd(), "out"))) {
    console.warn("[shows-feeds] /out missing. Run after next build. Skipping.");
    return;
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const events = upcomingShows
    .map((show) => ({ show, evt: showToEvent(show) }))
    .filter((x): x is { show: Show; evt: EventAttributes } => x.evt !== null);

  for (const { show, evt } of events) {
    writeIcs(`${show.id}.ics`, [evt]);
  }

  writeIcs("feed.ics", events.map((x) => x.evt));
  writeRss(upcomingShows);

  console.log(
    `[shows-feeds] wrote ${events.length} per-show .ics + feed.ics + feed.xml`,
  );
}

main();
