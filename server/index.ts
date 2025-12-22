import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function loadEnv(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!key || process.env[key] !== undefined) continue;
    process.env[key] = rest.join("=");
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

loadEnv(path.join(rootDir, ".env.local"));
loadEnv(path.join(rootDir, ".env"));

const app = express();
app.use(express.json());

// Global error handlers to capture unexpected crashes for easier debugging
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // keep the process alive long enough for logs to be written
  setTimeout(() => process.exit(1), 100);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  setTimeout(() => process.exit(1), 100);
});

// Simple health endpoint for quick readiness checks
app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const EVENTBRITE_TOKEN = process.env.EVENTBRITE_TOKEN;
const EVENTBRITE_ORGANIZER_ID = process.env.EVENTBRITE_ORGANIZER_ID;
const FOURTHWALL_COLLECTION_URL =
  "https://stoned-goose-productions-zgm-shop.fourthwall.com/collections/all/products.json";

const CACHE_TTL_MS = 60_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;

interface EventbriteEvent {
  id: string;
  name?: { text?: string };
  start?: { local?: string };
  end?: { local?: string };
  url?: string;
  summary?: string | null;
  logo?: { url?: string | null } | null;
  venue_id?: string | null;
}

interface EventbriteVenue {
  id: string;
  name?: string;
  address?: {
    address_1?: string;
    city?: string;
    region?: string;
    country?: string;
  };
}

interface SimplifiedEvent {
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
}

let cachedEvents: { timestamp: number; events: SimplifiedEvent[] } = {
  timestamp: 0,
  events: [],
};

let cachedFourthwallProducts: { timestamp: number; products: unknown[] } = {
  timestamp: 0,
  products: [],
};

const requestLog: number[] = [];

function isRateLimited() {
  const now = Date.now();
  while (requestLog.length && now - requestLog[0] > RATE_LIMIT_WINDOW_MS) {
    requestLog.shift();
  }

  if (requestLog.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  requestLog.push(now);
  return false;
}

async function fetchFromEventbrite<T>(url: string): Promise<T> {
  if (!EVENTBRITE_TOKEN) {
    throw new Error("EVENTBRITE_TOKEN is not configured");
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${EVENTBRITE_TOKEN}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Eventbrite request failed: ${res.status} ${text}`);
  }

  return (await res.json()) as T;
}

async function fetchVenue(venueId: string | null | undefined): Promise<
  SimplifiedEvent["venue"]
> {
  if (!venueId) return undefined;

  const venue = await fetchFromEventbrite<EventbriteVenue>(
    `https://www.eventbriteapi.com/v3/venues/${venueId}/`,
  );

  return {
    name: venue.name,
    address: venue.address?.address_1,
    city: venue.address?.city,
    region: venue.address?.region,
    country: venue.address?.country,
  };
}

async function fetchEvents(): Promise<SimplifiedEvent[]> {
  if (!EVENTBRITE_ORGANIZER_ID) {
    throw new Error("EVENTBRITE_ORGANIZER_ID is not configured");
  }

  const { events = [] } = await fetchFromEventbrite<{ events?: EventbriteEvent[] }>(
    `https://www.eventbriteapi.com/v3/organizers/${EVENTBRITE_ORGANIZER_ID}/events/?status=live&order_by=start_desc&expand=logo`,
  );

  const simplified = await Promise.all(
    events.map(async (event) => {
      const venue = await fetchVenue(event.venue_id);

      return {
        id: event.id,
        name: event.name?.text ?? "Untitled Event",
        start: event.start?.local ?? null,
        end: event.end?.local ?? null,
        url: event.url ?? null,
        summary: event.summary ?? "More details available on Eventbrite.",
        imageUrl: event.logo?.url ?? null,
        venue,
      } satisfies SimplifiedEvent;
    }),
  );

  return simplified;
}

app.get("/api/eventbrite", async (_req, res) => {
  if (isRateLimited()) {
    return res.status(429).json({ error: "Too many requests. Please try again soon." });
  }

  if (Date.now() - cachedEvents.timestamp < CACHE_TTL_MS) {
    return res.json({ events: cachedEvents.events, cached: true });
  }

  try {
    const events = await fetchEvents();
    cachedEvents = { events, timestamp: Date.now() };
    return res.json({ events });
  } catch (error) {
    console.error("Eventbrite proxy error", error);
    return res.status(500).json({ error: "Unable to fetch events" });
  }
});

app.get("/api/fourthwall/products", async (_req, res) => {
  if (isRateLimited()) {
    return res
      .status(429)
      .json({ error: "Too many requests. Please try again soon." });
  }

  if (Date.now() - cachedFourthwallProducts.timestamp < CACHE_TTL_MS) {
    return res.json({ products: cachedFourthwallProducts.products, cached: true });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(FOURTHWALL_COLLECTION_URL, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Fourthwall request failed: ${response.status} ${text}`);
    }

    const data = await response.json();
    const products = Array.isArray((data as any)?.products) ? (data as any).products : [];

    cachedFourthwallProducts = { products, timestamp: Date.now() };
    return res.json({ products });
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    console.error("Fourthwall proxy error", error);
    return res
      .status(isAbort ? 504 : 502)
      .json({ error: "Unable to reach the Fourthwall store right now." });
  } finally {
    clearTimeout(timeout);
  }
});

const publicDir = path.join(__dirname, "../dist/public");
app.use(express.static(publicDir));
app.get("*", (_req, res, next) => {
  if (publicDir && !publicDir.includes("dist")) return next();
  return res.sendFile(path.join(publicDir, "index.html"), (err) => {
    if (err) {
      next();
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  // Debugging helper: ensure the process doesn't exit immediately in some environments
  // (remove this once we've confirmed stability).
  if (process.env.DEBUG_KEEP_ALIVE !== "false") {
    console.log("Debug: keeping process alive (process.stdin.resume())");
    process.stdin.resume();
  }
});
