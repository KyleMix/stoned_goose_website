// Eventbrite organizer events -> content/.generated/shows.json
// Static-export friendly: the JSON is committed and read by content/shows.ts.
// When env vars are unset we skip cleanly. When the API call fails we leave
// the existing JSON in place so builds remain deterministic.
//
// Phase 4 extends this with Facebook Page events. The merged output is
// deduplicated by (name, start, venue.name) and tagged with a `source` field
// so the owner knows where each show came from.
import { join } from "node:path";
import type { Show } from "../content/shows";
import { requireEnv, safeFetch, writeJson } from "./_sync-helpers";

const OUT_PATH = join(process.cwd(), "content", ".generated", "shows.json");

type EventbriteEvent = {
  id: string;
  name: { text: string };
  description: { text: string | null };
  start: { utc: string | null };
  end: { utc: string | null };
  url: string | null;
  status: string;
  is_free: boolean;
  venue?: {
    name?: string;
    address?: {
      address_1?: string;
      city?: string;
      region?: string;
      country?: string;
    };
  } | null;
  ticket_availability?: {
    minimum_ticket_price?: { display?: string };
  } | null;
  logo?: { url?: string } | null;
};

type EventbriteResponse = {
  events: EventbriteEvent[];
  pagination: { has_more_items: boolean; continuation?: string };
};

function normalize(evt: EventbriteEvent): Show {
  return {
    id: `eventbrite-${evt.id}`,
    name: evt.name.text,
    summary: evt.description?.text ?? "",
    start: evt.start?.utc ?? null,
    end: evt.end?.utc ?? null,
    url: evt.url,
    ticketUrl: evt.url,
    status: evt.is_free ? "free" : "ticketed",
    ticketPrice: evt.ticket_availability?.minimum_ticket_price?.display,
    imageUrl: evt.logo?.url ?? null,
    venue: evt.venue
      ? {
          name: evt.venue.name,
          address: evt.venue.address?.address_1,
          city: evt.venue.address?.city,
          region: evt.venue.address?.region,
          country: evt.venue.address?.country ?? "US",
        }
      : undefined,
    source: "eventbrite",
  };
}

async function fetchAllEvents(token: string, organizerId: string): Promise<EventbriteEvent[] | null> {
  const events: EventbriteEvent[] = [];
  let continuation: string | undefined;

  do {
    const params = new URLSearchParams({
      status: "live",
      order_by: "start_asc",
      expand: "venue,ticket_availability,logo",
    });
    if (continuation) params.set("continuation", continuation);
    const url = `https://www.eventbriteapi.com/v3/organizers/${organizerId}/events/?${params.toString()}`;
    const data = (await safeFetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })) as EventbriteResponse | null;
    if (!data) return null;
    events.push(...data.events);
    continuation = data.pagination.has_more_items ? data.pagination.continuation : undefined;
  } while (continuation);

  return events;
}

async function main() {
  const env = requireEnv("EVENTBRITE_TOKEN", "EVENTBRITE_ORGANIZER_ID");
  if (!env) return;

  const events = await fetchAllEvents(env.EVENTBRITE_TOKEN, env.EVENTBRITE_ORGANIZER_ID);
  if (!events) {
    console.log("[sync:shows] eventbrite request failed. keeping existing JSON.");
    return;
  }

  const shows = events
    .map(normalize)
    .filter((s) => s.start && new Date(s.start).getTime() > Date.now());

  writeJson(OUT_PATH, shows);
  console.log(`[sync:shows] wrote ${shows.length} shows from Eventbrite`);
}

main();
