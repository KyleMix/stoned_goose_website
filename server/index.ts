import express from "express";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
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

loadEnv(path.join(rootDir, ".env"));
loadEnv(path.join(rootDir, ".env.local"));

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

function normalizeStorefrontApiUrl(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`;
}

const EVENTBRITE_TOKEN =
  process.env.EVENTBRITE_TOKEN ?? process.env.VITE_EVENTBRITE_TOKEN;
const EVENTBRITE_ORGANIZER_ID =
  process.env.EVENTBRITE_ORGANIZER_ID ?? process.env.VITE_EVENTBRITE_ORGANIZER_ID;
const FOURTHWALL_API_USERNAME =
  process.env.FOURTHWALL_API_USERNAME ?? process.env.VITE_FOURTHWALL_API_USERNAME;
const FOURTHWALL_API_PASSWORD =
  process.env.FOURTHWALL_API_PASSWORD ?? process.env.VITE_FOURTHWALL_API_PASSWORD;
const FOURTHWALL_API_BASE_URL =
  process.env.FOURTHWALL_API_BASE_URL ?? "https://api.fourthwall.com/open-api/v1";
const FOURTHWALL_STOREFRONT_TOKEN =
  process.env.FOURTHWALL_STOREFRONT_TOKEN ?? process.env.VITE_FOURTHWALL_STOREFRONT_TOKEN;
const FOURTHWALL_STOREFRONT_API_BASE_URL = normalizeStorefrontApiUrl(
  process.env.NEXT_PUBLIC_FW_API_URL ??
    process.env.FOURTHWALL_STOREFRONT_API_BASE_URL ??
    "https://storefront-api.fourthwall.com/v1",
);
const FOURTHWALL_PRODUCT_LIMIT = Number(process.env.FOURTHWALL_PRODUCT_LIMIT ?? 24);
const FOURTHWALL_COLLECTION_URL =
  "https://stoned-goose-productions-zgm-shop.fourthwall.com/collections/all/products.json";
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@stonedgooseproductions";

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

interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt?: string;
}

type YouTubeSearchResponse = {
  items?: {
    id?: { videoId?: string | null };
    snippet?: {
      title?: string | null;
      publishedAt?: string | null;
      thumbnails?: {
        high?: { url?: string | null } | null;
        medium?: { url?: string | null } | null;
        default?: { url?: string | null } | null;
      } | null;
    } | null;
  }[];
};

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY ?? process.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID =
  process.env.YOUTUBE_CHANNEL_ID ?? process.env.VITE_YOUTUBE_CHANNEL_ID;
const YOUTUBE_CHANNEL_HANDLE =
  process.env.YOUTUBE_CHANNEL_HANDLE ??
  process.env.VITE_YOUTUBE_CHANNEL_HANDLE ??
  "stonedgooseproductions";
const YOUTUBE_MAX_RESULTS = Number(
  process.env.YOUTUBE_MAX_RESULTS ?? process.env.VITE_YOUTUBE_MAX_RESULTS ?? 6,
);

let cachedYouTubeVideos: { timestamp: number; videos: YouTubeVideo[] } = {
  timestamp: 0,
  videos: [],
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
    hostname.endsWith(".fourthwall.com") ||
    hostname.endsWith(".fourthwallcdn.com")
  );
}

function getFourthwallAuthHeader() {
  if (!FOURTHWALL_API_USERNAME || !FOURTHWALL_API_PASSWORD) return null;
  const token = Buffer.from(
    `${FOURTHWALL_API_USERNAME}:${FOURTHWALL_API_PASSWORD}`,
  ).toString("base64");
  return `Basic ${token}`;
}

function getStorefrontHeaders() {
  return {
    Accept: "application/json",
  };
}

async function fetchStorefrontJson(
  path: string,
  signal: AbortSignal,
  params: URLSearchParams,
) {
  const response = await fetch(
    `${FOURTHWALL_STOREFRONT_API_BASE_URL}${path}?${params.toString()}`,
    {
      headers: getStorefrontHeaders(),
      signal,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Fourthwall storefront request failed: ${response.status} ${text}`,
    );
  }

  return await response.json();
}

function resolveStorefrontCollections(data: any) {
  if (Array.isArray(data?.collections)) return data.collections;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

async function fetchStorefrontProducts(signal: AbortSignal) {
  if (!FOURTHWALL_STOREFRONT_TOKEN) return null;

  const params = new URLSearchParams({
    limit: String(FOURTHWALL_PRODUCT_LIMIT),
    storefront_token: FOURTHWALL_STOREFRONT_TOKEN,
  });

  try {
    return await fetchStorefrontJson("/products", signal, params);
  } catch (error) {
    console.warn("Fourthwall storefront products fetch failed", error);
  }

  const collections = await fetchStorefrontJson("/collections", signal, params);
  const collectionList = resolveStorefrontCollections(collections);
  const fallbackCollection = collectionList.find((collection: any) => {
    const handle = collection?.handle ?? collection?.slug ?? "";
    const title = collection?.title ?? collection?.name ?? "";
    return handle.toLowerCase() === "all" || title.toLowerCase() === "all";
  });
  const selectedCollection = fallbackCollection ?? collectionList[0];
  const collectionProducts =
    selectedCollection?.products ??
    selectedCollection?.items ??
    selectedCollection?.data;

  if (Array.isArray(collectionProducts) && collectionProducts.length) {
    return { products: collectionProducts };
  }

  const collectionId =
    selectedCollection?.id ??
    selectedCollection?.handle ??
    selectedCollection?.slug ??
    selectedCollection?.collection_id;

  if (collectionId) {
    try {
      return await fetchStorefrontJson(
        `/collections/${collectionId}/products`,
        signal,
        params,
      );
    } catch (error) {
      console.warn("Fourthwall storefront collection fetch failed", error);
    }
  }

  return collections;
}

async function fetchFourthwallProducts() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    try {
      const collectionResponse = await fetch(FOURTHWALL_COLLECTION_URL, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      if (!collectionResponse.ok) {
        const text = await collectionResponse.text();
        throw new Error(
          `Fourthwall collection request failed: ${collectionResponse.status} ${text}`,
        );
      }

      return await collectionResponse.json();
    } catch (error) {
      console.warn("Fourthwall collection fetch failed, falling back", error);
    }

    if (FOURTHWALL_STOREFRONT_TOKEN) {
      try {
        const storefrontData = await fetchStorefrontProducts(controller.signal);
        if (storefrontData) return storefrontData;
      } catch (error) {
        console.warn("Fourthwall storefront fetch failed, falling back", error);
      }
    }

    const authHeader = getFourthwallAuthHeader();
    if (authHeader) {
      const params = new URLSearchParams({ limit: String(FOURTHWALL_PRODUCT_LIMIT) });
      const response = await fetch(
        `${FOURTHWALL_API_BASE_URL}/products?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: authHeader,
          },
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Fourthwall API request failed: ${response.status} ${text}`,
        );
      }

      return await response.json();
    }

    const response = await fetch(FOURTHWALL_COLLECTION_URL, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Fourthwall request failed: ${response.status} ${text}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function resolveFourthwallHandle(product: any) {
  return (
    product?.handle ??
    product?.slug ??
    product?.product_id ??
    product?.productId ??
    product?.id
  );
}

function resolveFourthwallImage(product: any) {
  const directImage = typeof product?.image === "string" ? product.image : null;
  const imageList = Array.isArray(product?.images) ? product.images : [];
  const firstImage = imageList[0];
  const listImage = typeof firstImage === "string" ? firstImage : null;
  return (
    directImage ??
    product?.image?.transformedUrl ??
    product?.image?.transformed_url ??
    product?.image?.url ??
    product?.primary_image?.url ??
    product?.preview_image?.url ??
    product?.primary_image?.src ??
    product?.featured_image?.src ??
    product?.featured_media?.src ??
    listImage ??
    product?.images?.[0]?.src ??
    product?.images?.[0]?.url ??
    product?.media?.[0]?.src ??
    product?.media?.[0]?.url
  );
}

function resolveFourthwallPrice(product: any) {
  const unitPrice =
    product?.variants?.[0]?.unitPrice ??
    product?.variants?.[0]?.unit_price ??
    product?.variants?.[0]?.price;
  const amount =
    product?.price?.amount ??
    product?.price?.value ??
    unitPrice?.amount ??
    unitPrice?.value ??
    product?.default_price?.amount ??
    product?.default_price?.price ??
    product?.pricing?.price ??
    product?.price ??
    product?.prices?.[0]?.amount ??
    product?.price_range?.minimum_price?.amount ??
    product?.price_range?.minimum_price?.price ??
    product?.price_range?.min?.amount ??
    product?.min_price?.amount ??
    product?.min_price;
  const currencyCode =
    product?.price?.currencyCode ??
    product?.price?.currency ??
    unitPrice?.currencyCode ??
    unitPrice?.currency ??
    product?.default_price?.currency ??
    product?.price_range?.minimum_price?.currency ??
    product?.min_price?.currency ??
    product?.currency;

  if (amount === undefined || amount === null) return null;

  return { amount, currencyCode };
}

function normalizeFourthwallProducts(data: any) {
  const products = Array.isArray(data?.products)
    ? data.products
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.items)
        ? data.items
        : [];
  const checkoutBase = process.env.NEXT_PUBLIC_FW_CHECKOUT;
  const normalized = products
    .map((product: any) => {
      const handle = resolveFourthwallHandle(product);
      const price = resolveFourthwallPrice(product);
      const image = resolveFourthwallImage(product);
      const link =
        (checkoutBase && handle
          ? `${checkoutBase.replace(/\/+$/, "")}/products/${handle}`
          : null) ??
        product?.link ??
        product?.url ??
        product?.storefront_url ??
        product?.storefrontUrl ??
        product?.permalink ??
        product?.links?.storefront;

      if (!handle || !price || !image || !link) return null;

      return {
        id: String(product?.id ?? handle),
        name: product?.title ?? product?.name ?? "Product",
        price: {
          amount: price.amount,
          currencyCode: price.currencyCode ?? "USD",
        },
        image,
        link,
      };
    })
    .filter(Boolean);

  return normalized as Array<{
    id: string;
    name: string;
    price: { amount: number | string; currencyCode: string };
    image: string;
    link: string;
  }>;
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

function mapSearchItemsToVideos(items: YouTubeSearchResponse["items"]): YouTubeVideo[] {
  if (!items?.length) return [];

  return items
    .map((item) => {
      const id = item.id?.videoId ?? undefined;
      const title = item.snippet?.title ?? "Untitled video";
      const thumbnail =
        item.snippet?.thumbnails?.high?.url ??
        item.snippet?.thumbnails?.medium?.url ??
        item.snippet?.thumbnails?.default?.url ??
        (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "");

      if (!id) return null;

      return {
        id,
        title,
        url: `https://www.youtube.com/watch?v=${id}`,
        thumbnail,
        publishedAt: item.snippet?.publishedAt ?? undefined,
      } satisfies YouTubeVideo;
    })
    .filter(Boolean) as YouTubeVideo[];
}

function parseRssFeed(xml: string): YouTubeVideo[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  const videos = entries
    .slice(0, YOUTUBE_MAX_RESULTS)
    .map((entry) => {
      const videoIdMatch =
        entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) ??
        entry.match(/<videoId>([^<]+)<\/videoId>/);
      const id = videoIdMatch?.[1]?.trim();
      const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
      const title = titleMatch?.[1]?.trim() ?? "Untitled video";
      const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);
      const publishedAt = publishedMatch?.[1]?.trim();
      const linkMatch = entry.match(/<link[^>]*href="([^"]+)"[^>]*>/);
      const url =
        linkMatch?.[1]?.trim() ?? (id ? `https://www.youtube.com/watch?v=${id}` : "");

      if (!id) return null;

      return {
        id,
        title,
        url: url || YOUTUBE_CHANNEL_URL,
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        publishedAt,
      } satisfies YouTubeVideo;
    })
    .filter(Boolean) as YouTubeVideo[];

  return videos;
}

function getYouTubeFeedUrl() {
  if (YOUTUBE_CHANNEL_ID) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(YOUTUBE_CHANNEL_ID)}`;
  }

  const handle = YOUTUBE_CHANNEL_HANDLE?.replace(/^@/, "");
  if (!handle) return null;

  return `https://www.youtube.com/feeds/videos.xml?user=${encodeURIComponent(handle)}`;
}

async function fetchYouTubeVideos(): Promise<YouTubeVideo[]> {
  if (YOUTUBE_API_KEY && YOUTUBE_CHANNEL_ID) {
    const params = new URLSearchParams({
      key: YOUTUBE_API_KEY,
      channelId: YOUTUBE_CHANNEL_ID,
      part: "snippet",
      order: "date",
      maxResults: String(YOUTUBE_MAX_RESULTS),
      type: "video",
    });

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          `YouTube API request failed (${response.status}): ${
            message || "Unknown error fetching videos."
          }`,
        );
      }

      const data = (await response.json()) as YouTubeSearchResponse;
      const videos = mapSearchItemsToVideos(data.items);
      if (videos.length) return videos;
    } catch (error) {
      console.error("YouTube API fetch error", error);
    }
  }

  const feedUrl = getYouTubeFeedUrl();
  if (feedUrl) {
    const feedResponse = await fetch(feedUrl);
    if (!feedResponse.ok) {
      const message = await feedResponse.text();
      throw new Error(
        `YouTube RSS feed request failed (${feedResponse.status}): ${
          message || "Unable to load feed."
        }`,
      );
    }

    const xml = await feedResponse.text();
    const videos = parseRssFeed(xml);
    if (videos.length) return videos;
  }

  throw new Error("YouTube channel configuration is missing or returned no videos.");
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

  try {
    const data = await fetchFourthwallProducts();
    const products = normalizeFourthwallProducts(data);

    cachedFourthwallProducts = { products, timestamp: Date.now() };
    return res.json({ products });
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    console.error("Fourthwall proxy error", error);
    const isStorefrontUnconfigured = !FOURTHWALL_STOREFRONT_TOKEN;
    const operatorHint = isStorefrontUnconfigured
      ? " Configure FOURTHWALL_STOREFRONT_TOKEN (or VITE_FOURTHWALL_STOREFRONT_TOKEN) to enable the storefront API fallback."
      : "";
    return res
      .status(isAbort ? 504 : 502)
      .json({
        error: `Unable to reach the Fourthwall store right now.${operatorHint}`,
      });
  }
});

app.get("/api/fourthwall/image", async (req, res) => {
  const imageUrl = typeof req.query.url === "string" ? req.query.url : "";

  if (!imageUrl) {
    return res.status(400).json({ error: "Missing image URL." });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch (error) {
    console.error("Invalid image URL", error);
    return res.status(400).json({ error: "Invalid image URL." });
  }

  if (parsedUrl.protocol !== "https:" || !isAllowedImageHost(parsedUrl.hostname)) {
    return res.status(403).json({ error: "Image host not allowed." });
  }

  try {
    const response = await fetch(parsedUrl.toString());

    if (!response.ok) {
      const text = await response.text();
      return res
        .status(response.status)
        .json({ error: `Image fetch failed: ${text || response.status}` });
    }

    const passthroughHeaders = getStoreProxyHeaders(response.headers);
    const contentType =
      response.headers.get("content-type") ?? "application/octet-stream";
    passthroughHeaders["content-type"] = contentType;

    res.set(passthroughHeaders);

    if (!response.body) {
      const buffer = Buffer.from(await response.arrayBuffer());
      return res.send(buffer);
    }

    const stream = Readable.fromWeb(response.body);
    return stream.pipe(res);
  } catch (error) {
    console.error("Fourthwall image proxy error", error);
    return res.status(502).json({ error: "Unable to fetch image." });
  }
});

app.get("/api/youtube/latest", async (_req, res) => {
  if (isRateLimited()) {
    return res.status(429).json({ error: "Too many requests. Please try again soon." });
  }

  if (Date.now() - cachedYouTubeVideos.timestamp < CACHE_TTL_MS) {
    return res.json({ videos: cachedYouTubeVideos.videos, cached: true });
  }

  try {
    const videos = await fetchYouTubeVideos();
    cachedYouTubeVideos = { videos, timestamp: Date.now() };
    return res.json({ videos });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch YouTube videos.";
    console.error("YouTube proxy error", error);
    return res.status(500).json({ error: message });
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
