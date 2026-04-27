// Facebook Page events -> merged into content/.generated/shows.json
// Reads the existing JSON (typically Eventbrite-sourced from sync:shows),
// fetches FB Page events, normalizes to the Show type, deduplicates by
// (name, start, venue.name) preferring Eventbrite as the ticketing source
// of truth, then re-writes the JSON sorted by start.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Show } from "../content/shows";
import { requireEnv, safeFetch, writeJson } from "./_sync-helpers";

const OUT_PATH = join(process.cwd(), "content", ".generated", "shows.json");

type GraphPlace = {
  name?: string;
  location?: { city?: string; state?: string; country?: string; street?: string };
};

type GraphEvent = {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time?: string;
  cover?: { source?: string };
  place?: GraphPlace;
};

type GraphResponse = { data: GraphEvent[] };

function normalize(evt: GraphEvent): Show {
  return {
    id: `facebook-${evt.id}`,
    name: evt.name,
    summary: evt.description ?? "",
    start: evt.start_time,
    end: evt.end_time ?? null,
    url: `https://www.facebook.com/events/${evt.id}`,
    ticketUrl: null,
    status: "tba",
    imageUrl: evt.cover?.source ?? null,
    venue: evt.place
      ? {
          name: evt.place.name,
          address: evt.place.location?.street,
          city: evt.place.location?.city,
          region: evt.place.location?.state,
          country: evt.place.location?.country ?? "US",
        }
      : undefined,
    source: "facebook",
  };
}

function dedupKey(s: Show): string {
  const name = s.name.toLowerCase().replace(/\s+/g, " ").trim();
  const start = s.start ? new Date(s.start).toISOString().slice(0, 13) : "";
  const venue = s.venue?.name?.toLowerCase().trim() ?? "";
  return `${name}|${start}|${venue}`;
}

function readExisting(): Show[] {
  if (!existsSync(OUT_PATH)) return [];
  try {
    const raw = readFileSync(OUT_PATH, "utf8");
    const parsed = JSON.parse(raw) as Show[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function main() {
  const env = requireEnv("FACEBOOK_PAGE_ACCESS_TOKEN", "FACEBOOK_PAGE_ID");
  if (!env) return;

  const params = new URLSearchParams({
    fields: "id,name,description,start_time,end_time,cover,place",
    time_filter: "upcoming",
    access_token: env.FACEBOOK_PAGE_ACCESS_TOKEN,
  });
  const url = `https://graph.facebook.com/v21.0/${env.FACEBOOK_PAGE_ID}/events?${params.toString()}`;

  const data = (await safeFetch(url)) as GraphResponse | null;
  if (!data) {
    console.log("[sync:facebook-events] request failed. keeping existing JSON.");
    return;
  }

  const fbShows = data.data.map(normalize);
  const existing = readExisting();

  // Merge order: Eventbrite (existing) wins on dupes since it's the
  // ticketing source of truth. Manual entries also win over Facebook.
  const seen = new Set(existing.map(dedupKey));
  const merged = [...existing];
  for (const show of fbShows) {
    if (seen.has(dedupKey(show))) continue;
    merged.push(show);
    seen.add(dedupKey(show));
  }

  merged.sort((a, b) => {
    const ta = a.start ? new Date(a.start).getTime() : 0;
    const tb = b.start ? new Date(b.start).getTime() : 0;
    return ta - tb;
  });

  writeJson(OUT_PATH, merged);
  console.log(
    `[sync:facebook-events] merged ${fbShows.length} FB events. total ${merged.length}.`,
  );
}

main();
