// Eventbrite organizer events -> content/.generated/shows.json
// Static-export friendly: the JSON is committed and read by content/shows.ts.
// When env vars are unset we skip cleanly. When the API call fails we leave
// the existing JSON in place so builds remain deterministic. A call that
// succeeds and returns nothing gets the same treatment: see hasUpcoming.
//
// Phase 4 extends this with Facebook Page events. The merged output is
// deduplicated by (name, start, venue.name) and tagged with a `source` field
// so the owner knows where each show came from.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Show } from "../content/shows";
import { requireEnv, safeFetch, writeJson } from "./_sync-helpers";
import { isStillListed, showTimeZone } from "../lib/dates";

const OUT_PATH = join(process.cwd(), "content", ".generated", "shows.json");

// Stoned Goose Productions on Eventbrite. The organizer id is public, it is
// right in the eventbrite.com/o/ URL, so a baked-in default keeps setup to a
// single secret (the token). EVENTBRITE_ORGANIZER_ID still overrides it.
const DEFAULT_ORGANIZER_ID = "107337391771";

type EventbriteEvent = {
  id: string;
  name: { text: string };
  description: { text: string | null };
  start: { utc: string | null; timezone?: string | null };
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
  ticket_classes?: EventbriteTicketClass[] | null;
  logo?: { url?: string } | null;
};

// Only the fields basePriceOf reads. `cost` is the face value before
// Eventbrite's fees; the fee is a separate field.
type EventbriteTicketClass = {
  free?: boolean;
  hidden?: boolean;
  donation?: boolean;
  cost?: { major_value?: string; value?: number; currency?: string } | null;
};

type EventbriteResponse = {
  events: EventbriteEvent[];
  pagination: { has_more_items: boolean; continuation?: string };
};

/**
 * The cheapest public ticket's face value, before fees, as the flyer writes
 * it: "$20", or "$22.50". minimum_ticket_price cannot be used for this, it is
 * the total with fees (23.18 for a $20 ticket). Null when there is no paid,
 * visible, USD ticket class to read, so the page shows no price rather than a
 * guess. Exported for scripts/test/sync-guards.test.ts.
 */
export function basePriceOf(evt: Pick<EventbriteEvent, "ticket_classes">): string | null {
  const cents = (evt.ticket_classes ?? [])
    .filter((t) => !t.free && !t.hidden && !t.donation && (t.cost?.currency ?? "USD") === "USD")
    .map((t) =>
      typeof t.cost?.value === "number"
        ? t.cost.value
        : Math.round(Number(t.cost?.major_value) * 100),
    )
    .filter((c) => Number.isFinite(c) && c > 0);
  if (cents.length === 0) return null;
  const min = Math.min(...cents);
  return min % 100 === 0 ? `$${min / 100}` : `$${(min / 100).toFixed(2)}`;
}

function normalize(evt: EventbriteEvent): Show {
  const basePrice = basePriceOf(evt);
  return {
    id: `eventbrite-${evt.id}`,
    name: evt.name.text,
    summary: evt.description?.text ?? "",
    start: evt.start?.utc ?? null,
    ...(evt.start?.timezone ? { timeZone: evt.start.timezone } : {}),
    end: evt.end?.utc ?? null,
    url: evt.url,
    ticketUrl: evt.url,
    status: evt.is_free ? "free" : "ticketed",
    ticketPrice: evt.ticket_availability?.minimum_ticket_price?.display,
    ...(basePrice ? { basePrice } : {}),
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

async function fetchAllEvents(
  token: string,
  organizerId: string,
): Promise<EventbriteEvent[] | null> {
  const events: EventbriteEvent[] = [];
  let continuation: string | undefined;

  do {
    const params = new URLSearchParams({
      status: "live",
      order_by: "start_asc",
      expand: "venue,ticket_availability,ticket_classes,logo",
    });
    if (continuation) params.set("continuation", continuation);
    const url = `https://www.eventbriteapi.com/v3/organizers/${organizerId}/events/?${params.toString()}`;
    const data = (await safeFetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })) as EventbriteResponse | null;
    if (!data) return null;
    events.push(...data.events);
    continuation = data.pagination.has_more_items
      ? data.pagination.continuation
      : undefined;
  } while (continuation);

  return events;
}

async function main() {
  const env = requireEnv("EVENTBRITE_TOKEN");
  if (!env) return;

  const organizerId =
    process.env.EVENTBRITE_ORGANIZER_ID || DEFAULT_ORGANIZER_ID;
  const events = await fetchAllEvents(env.EVENTBRITE_TOKEN, organizerId);
  if (!events) {
    console.log(
      "[sync:shows] eventbrite request failed. keeping existing JSON.",
    );
    return;
  }

  // Kept through the show's date and dropped the day after, the same rule the
  // page uses (lib/dates.ts). The first run after midnight Pacific drops it
  // from this file, and that commit is what redeploys the site.
  const shows = events
    .map(normalize)
    .filter((s) => isStillListed(s.start, Date.now(), showTimeZone(s)));

  // A 200 carrying zero events is not proof the calendar is empty. A revoked
  // scope, a mistyped organizer id, or a response-shape change all look like
  // this, and the cron would commit the wipe under a routine message. Writing
  // an empty list is only safe when there was nothing to lose.
  if (shows.length === 0 && hasUpcoming(readExisting())) {
    console.warn(
      "[sync:shows] Eventbrite returned 0 upcoming events but the committed " +
        "JSON has some. Keeping it. Check EVENTBRITE_ORGANIZER_ID and the " +
        "token's scopes if this repeats.",
    );
    return;
  }

  writeJson(OUT_PATH, shows);
  console.log(`[sync:shows] wrote ${shows.length} shows from Eventbrite`);
}

// The committed shows, or an empty list on a first run or unreadable file.
function readExisting(): Show[] {
  try {
    const parsed = JSON.parse(readFileSync(OUT_PATH, "utf8"));
    return Array.isArray(parsed) ? (parsed as Show[]) : [];
  } catch {
    return [];
  }
}

// Exported for scripts/test/sync-guards.test.ts. Past-only listings are
// genuinely empty and must stay overwritable, or a dead calendar never clears.
export function hasUpcoming(shows: Show[], now: number = Date.now()): boolean {
  return shows.some((s) => isStillListed(s.start, now, showTimeZone(s)));
}

// Only run when executed as a script, so the test can import hasUpcoming
// without kicking off a live Eventbrite sync. Matches sync-pro-shows.
if (process.argv[1]?.includes("sync-shows")) {
  main();
}
