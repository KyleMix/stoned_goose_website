import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type EventbriteEvent = {
  id: string;
  name?: { text?: string | null };
  start?: { local?: string | null };
  end?: { local?: string | null };
  url?: string | null;
  summary?: string | null;
  logo?: { url?: string | null } | null;
  venue?: {
    name?: string | null;
    address?: {
      address_1?: string | null;
      city?: string | null;
      region?: string | null;
      country?: string | null;
    } | null;
  } | null;
};

type EventbriteResponse = {
  events?: EventbriteEvent[];
};

const EVENTBRITE_TOKEN = process.env.EVENTBRITE_TOKEN ?? process.env.VITE_EVENTBRITE_TOKEN;
const EVENTBRITE_ORGANIZER_ID =
  process.env.EVENTBRITE_ORGANIZER_ID ?? process.env.VITE_EVENTBRITE_ORGANIZER_ID;
const EVENTBRITE_ENDPOINT = process.env.EVENTBRITE_ENDPOINT ?? null;

if (!EVENTBRITE_TOKEN) {
  console.error("Missing EVENTBRITE_TOKEN (or VITE_EVENTBRITE_TOKEN). Cannot fetch shows.");
  process.exit(1);
}

if (!EVENTBRITE_ORGANIZER_ID && !EVENTBRITE_ENDPOINT) {
  console.error(
    "Missing EVENTBRITE_ORGANIZER_ID (or VITE_EVENTBRITE_ORGANIZER_ID) and EVENTBRITE_ENDPOINT.",
  );
  process.exit(1);
}

const endpoint =
  EVENTBRITE_ENDPOINT ??
  `https://www.eventbriteapi.com/v3/organizers/${EVENTBRITE_ORGANIZER_ID}/events/?status=live&order_by=start_desc&expand=venue,logo`;

const response = await fetch(endpoint, {
  headers: {
    Authorization: `Bearer ${EVENTBRITE_TOKEN}`,
  },
});

if (!response.ok) {
  const message = await response.text();
  console.error(
    `Eventbrite request failed (${response.status}): ${message || "Unknown error"}`,
  );
  process.exit(1);
}

const data = (await response.json()) as EventbriteResponse;
const events =
  data.events?.map((event) => ({
    id: event.id,
    name: event.name?.text ?? "Untitled Event",
    start: event.start?.local ?? null,
    end: event.end?.local ?? null,
    url: event.url ?? null,
    summary: event.summary ?? "More details available on Eventbrite.",
    imageUrl: event.logo?.url ?? null,
    venue: event.venue
      ? {
          name: event.venue.name ?? undefined,
          address: event.venue.address?.address_1 ?? undefined,
          city: event.venue.address?.city ?? undefined,
          region: event.venue.address?.region ?? undefined,
          country: event.venue.address?.country ?? undefined,
        }
      : undefined,
  })) ?? [];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, "../client/src/data/eventbrite-data.ts");

const output = `export const eventbriteShows = ${JSON.stringify(
  {
    updatedAt: new Date().toISOString(),
    events,
  },
  null,
  2,
)} as const;\n`;

fs.writeFileSync(outputPath, output, "utf-8");
console.log(`Wrote ${events.length} events to ${outputPath}`);
