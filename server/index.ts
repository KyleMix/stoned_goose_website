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
const FOURTHWALL_STORE_BASE =
  "https://stoned-goose-productions-zgm-shop.fourthwall.com";

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

const cachedFourthwallStoreHtml: Record<
  string,
  { timestamp: number; html: string; headers: Record<string, string> }
> = {};

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

function getStoreProxyHeaders(headers: Headers) {
  const passthroughHeaders: Record<string, string> = {};
  const cacheControl = headers.get("cache-control");
  const etag = headers.get("etag");
  const lastModified = headers.get("last-modified");

  if (cacheControl) passthroughHeaders["cache-control"] = cacheControl;
  if (etag) passthroughHeaders.etag = etag;
  if (lastModified) passthroughHeaders["last-modified"] = lastModified;

  return passthroughHeaders;
}

function rewriteStoreHtml(html: string) {
  const storeOrigin = new URL(FOURTHWALL_STORE_BASE).origin;
  return html.replaceAll(storeOrigin, "/merch/store");
}

function isAllowedImageHost(hostname: string) {
  return (
    hostname === "cdn.fourthwall.com" ||
    hostname === "images.fourthwall.com" ||
    hostname.endsWith(".fourthwall.com") ||
    hostname.endsWith(".fourthwallcdn.com")
  );
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

      const simplifiedEvent: SimplifiedEvent = {
        id: event.id,
        name: event.name?.text ?? "Untitled Event",
        start: event.start?.local ?? null,
        end: event.end?.local ?? null,
        url: event.url ?? null,
        summary: event.summary ?? "More details available on Eventbrite.",
        imageUrl: event.logo?.url ?? null,
        venue,
      };

      return simplifiedEvent;
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

    const contentType = response.headers.get("content-type") ?? "";
    const rawBody = await response.text();

    if (!contentType.includes("application/json")) {
      throw new Error(
        `Fourthwall returned unexpected content-type: ${contentType || "unknown"}. Body: ${rawBody.slice(0, 200)}`,
      );
    }

    let data: unknown;
    try {
      data = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("Fourthwall JSON parse error", parseError, rawBody.slice(0, 200));
      throw new Error("Received malformed JSON from Fourthwall");
    }

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

async function handleFourthwallStoreProxy(req: express.Request, res: express.Response) {
  if (isRateLimited()) {
    return res
      .status(429)
      .send("Too many requests. Please try again soon.");
  }

  const storePath = req.path === "/merch/store" ? "/" : req.path.replace("/merch/store", "");
  const incomingUrl = new URL(req.originalUrl, "http://localhost");
  const upstreamUrl = new URL(`${FOURTHWALL_STORE_BASE}${storePath}`);
  upstreamUrl.search = incomingUrl.search;

  const cacheKey = `${storePath}${incomingUrl.search}`;
  const cached = cachedFourthwallStoreHtml[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    res.set(cached.headers);
    res.set("content-type", "text/html; charset=utf-8");
    return res.send(cached.html);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(upstreamUrl.toString(), {
      headers: { Accept: "text/html" },
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const contentType = response.headers.get("content-type") ?? "text/html";
    const passthroughHeaders = getStoreProxyHeaders(response.headers);

    if (contentType.includes("text/html")) {
      const rawHtml = await response.text();
      const rewrittenHtml = rewriteStoreHtml(rawHtml);
      cachedFourthwallStoreHtml[cacheKey] = {
        timestamp: Date.now(),
        html: rewrittenHtml,
        headers: passthroughHeaders,
      };
      res.set(passthroughHeaders);
      res.set("content-type", "text/html; charset=utf-8");
      return res.send(rewrittenHtml);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.set(passthroughHeaders);
    res.set("content-type", contentType);
    return res.send(buffer);
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    console.error("Fourthwall store proxy error", error);
    return res
      .status(isAbort ? 504 : 502)
      .send("Unable to reach the Fourthwall store right now.");
  } finally {
    clearTimeout(timeout);
  }
}

app.get("/merch/store", handleFourthwallStoreProxy);
app.get("/merch/store/*", handleFourthwallStoreProxy);

app.get("/api/fourthwall/image", async (req, res) => {
  if (isRateLimited()) {
    return res
      .status(429)
      .json({ error: "Too many requests. Please try again soon." });
  }

  const rawUrl = typeof req.query.url === "string" ? req.query.url : "";
  if (!rawUrl) {
    return res.status(400).json({ error: "Missing url parameter." });
  }

  let imageUrl: URL;
  try {
    imageUrl = new URL(rawUrl);
  } catch (error) {
    return res.status(400).json({ error: "Invalid image URL." });
  }

  if (!["http:", "https:"].includes(imageUrl.protocol)) {
    return res.status(400).json({ error: "Invalid image URL protocol." });
  }

  if (!isAllowedImageHost(imageUrl.hostname)) {
    return res.status(403).json({ error: "Image host is not allowed." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(imageUrl.toString(), {
      headers: { Accept: "image/*" },
      signal: controller.signal,
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Unable to fetch image." });
    }

    const contentType = response.headers.get("content-type") ?? "image/*";
    const passthroughHeaders = getStoreProxyHeaders(response.headers);
    const buffer = Buffer.from(await response.arrayBuffer());

    res.set(passthroughHeaders);
    res.set("content-type", contentType);
    return res.send(buffer);
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    console.error("Fourthwall image proxy error", error);
    return res
      .status(isAbort ? 504 : 502)
      .json({ error: "Unable to reach the image host right now." });
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
