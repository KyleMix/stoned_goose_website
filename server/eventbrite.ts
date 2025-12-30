const EVENTBRITE_ORGANIZER_URL =
  "https://www.eventbrite.com/o/stoned-goose-productions-107337391771";

const CACHE_TTL_MS = 10 * 60 * 1000;

type JsonValue =
  | null
  | string
  | number
  | boolean
  | JsonValue[]
  | { [key: string]: JsonValue };

export type EventbriteShow = {
  id: string;
  name: string;
  start: string | null;
  end: string | null;
  url: string | null;
  summary: string;
  imageUrl?: string | null;
  venue?: {
    name?: string;
    address?: string;
    city?: string;
    region?: string;
    country?: string;
  };
};

export type EventbriteShowData = {
  updatedAt: string | null;
  events: EventbriteShow[];
};

type EventbriteRawEvent = {
  "@type"?: string | string[];
  "@id"?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  url?: string;
  description?: string;
  image?: string | string[];
  location?: {
    name?: string;
    address?: {
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      addressCountry?: string;
    };
  };
};

type CacheEntry = {
  data: EventbriteShowData;
  fetchedAt: number;
};

let cachedShows: CacheEntry | null = null;

function sanitizeText(value: string | undefined): string {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function extractJsonLd(html: string): JsonValue[] {
  const results: JsonValue[] = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null = null;

  while ((match = regex.exec(html))) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as JsonValue;
      results.push(parsed);
    } catch {
      continue;
    }
  }

  return results;
}

function isEventType(value?: string | string[]): boolean {
  if (!value) return false;
  if (Array.isArray(value)) {
    return value.includes("Event");
  }
  return value === "Event";
}

function collectEvents(value: JsonValue, events: EventbriteRawEvent[]) {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((entry) => collectEvents(entry, events));
    return;
  }
  if (typeof value !== "object") return;

  const record = value as Record<string, JsonValue>;
  const typeValue = record["@type"] as string | string[] | undefined;
  if (isEventType(typeValue)) {
    events.push(record as unknown as EventbriteRawEvent);
    return;
  }

  if (record.itemListElement) {
    collectEvents(record.itemListElement, events);
  }

  for (const key of Object.keys(record)) {
    collectEvents(record[key], events);
  }
}

function resolveId(event: EventbriteRawEvent, index: number): string {
  const url = event["@id"] ?? event.url ?? "";
  if (url) {
    const match = url.match(/-(\d+)(?:\b|\/|\?|#)/);
    if (match?.[1]) return match[1];
    return url;
  }
  return `event-${index}`;
}

function mapEvent(event: EventbriteRawEvent, index: number): EventbriteShow {
  const address = event.location?.address;
  const image = Array.isArray(event.image) ? event.image[0] : event.image;
  const summary = sanitizeText(event.description) || "More details available on Eventbrite.";

  return {
    id: resolveId(event, index),
    name: event.name ?? "Untitled Event",
    start: event.startDate ?? null,
    end: event.endDate ?? null,
    url: event.url ?? null,
    summary,
    imageUrl: image ?? null,
    venue: event.location
      ? {
          name: event.location.name ?? undefined,
          address: address?.streetAddress ?? undefined,
          city: address?.addressLocality ?? undefined,
          region: address?.addressRegion ?? undefined,
          country: address?.addressCountry ?? undefined,
        }
      : undefined,
  };
}

function parseEventbriteShows(html: string): EventbriteShowData {
  const jsonLd = extractJsonLd(html);
  const events: EventbriteRawEvent[] = [];
  jsonLd.forEach((entry) => collectEvents(entry, events));

  const mapped = events.map(mapEvent).filter((event) => Boolean(event.name));
  const uniqueEvents = new Map<string, EventbriteShow>();
  mapped.forEach((event) => {
    if (!uniqueEvents.has(event.id)) {
      uniqueEvents.set(event.id, event);
    }
  });
  const now = Date.now();
  const upcoming = Array.from(uniqueEvents.values())
    .filter((event) => {
      if (!event.start) return false;
      const startTime = Date.parse(event.start);
      if (Number.isNaN(startTime)) return false;
      return startTime >= now;
    })
    .sort((a, b) => {
      const aTime = a.start ? Date.parse(a.start) : 0;
      const bTime = b.start ? Date.parse(b.start) : 0;
      return aTime - bTime;
    });

  return {
    updatedAt: new Date().toISOString(),
    events: upcoming,
  };
}

export async function getEventbriteShows(): Promise<EventbriteShowData> {
  const now = Date.now();
  if (cachedShows && now - cachedShows.fetchedAt < CACHE_TTL_MS) {
    return cachedShows.data;
  }

  const response = await fetch(EVENTBRITE_ORGANIZER_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Eventbrite Scraper)",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Eventbrite request failed (${response.status})`);
  }

  const html = await response.text();
  const data = parseEventbriteShows(html);
  cachedShows = { data, fetchedAt: now };
  return data;
}
