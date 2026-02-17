// server/index.ts
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// server/eventbrite.ts
var EVENTBRITE_ORGANIZER_URL = "https://www.eventbrite.com/o/stoned-goose-productions-107337391771";
var CACHE_TTL_MS = 10 * 60 * 1e3;
var cachedShows = null;
function sanitizeText(value) {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function extractJsonLd(html) {
  const results = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match = null;
  while (match = regex.exec(html)) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      results.push(parsed);
    } catch {
      continue;
    }
  }
  return results;
}
function isEventType(value) {
  if (!value) return false;
  if (Array.isArray(value)) {
    return value.includes("Event");
  }
  return value === "Event";
}
function collectEvents(value, events) {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((entry) => collectEvents(entry, events));
    return;
  }
  if (typeof value !== "object") return;
  const record = value;
  const typeValue = record["@type"];
  if (isEventType(typeValue)) {
    events.push(record);
    return;
  }
  if (record.itemListElement) {
    collectEvents(record.itemListElement, events);
  }
  for (const key of Object.keys(record)) {
    collectEvents(record[key], events);
  }
}
function resolveId(event, index) {
  const url = event["@id"] ?? event.url ?? "";
  if (url) {
    const match = url.match(/-(\d+)(?:\b|\/|\?|#)/);
    if (match?.[1]) return match[1];
    return url;
  }
  return `event-${index}`;
}
function mapEvent(event, index) {
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
    venue: event.location ? {
      name: event.location.name ?? void 0,
      address: address?.streetAddress ?? void 0,
      city: address?.addressLocality ?? void 0,
      region: address?.addressRegion ?? void 0,
      country: address?.addressCountry ?? void 0
    } : void 0
  };
}
function parseEventbriteShows(html) {
  const jsonLd = extractJsonLd(html);
  const events = [];
  jsonLd.forEach((entry) => collectEvents(entry, events));
  const mapped = events.map(mapEvent).filter((event) => Boolean(event.name));
  const uniqueEvents = /* @__PURE__ */ new Map();
  mapped.forEach((event) => {
    if (!uniqueEvents.has(event.id)) {
      uniqueEvents.set(event.id, event);
    }
  });
  const now = Date.now();
  const upcoming = Array.from(uniqueEvents.values()).filter((event) => {
    if (!event.start) return false;
    const startTime = Date.parse(event.start);
    if (Number.isNaN(startTime)) return false;
    return startTime >= now;
  }).sort((a, b) => {
    const aTime = a.start ? Date.parse(a.start) : 0;
    const bTime = b.start ? Date.parse(b.start) : 0;
    return aTime - bTime;
  });
  return {
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    events: upcoming
  };
}
async function getEventbriteShows() {
  const now = Date.now();
  if (cachedShows && now - cachedShows.fetchedAt < CACHE_TTL_MS) {
    return cachedShows.data;
  }
  const response = await fetch(EVENTBRITE_ORGANIZER_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Eventbrite Scraper)",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });
  if (!response.ok) {
    throw new Error(`Eventbrite request failed (${response.status})`);
  }
  const html = await response.text();
  const data = parseEventbriteShows(html);
  cachedShows = { data, fetchedAt: now };
  return data;
}

// server/youtube.ts
var YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@stonedgooseproductions";
var YOUTUBE_FEED_BASE = "https://www.youtube.com/feeds/videos.xml";
var CACHE_TTL_MS2 = 10 * 60 * 1e3;
var cachedVideos = null;
var cachedChannelId = null;
function stripCdata(value) {
  return value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}
function parseXmlTag(block, tag) {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = block.match(regex);
  if (!match?.[1]) return null;
  return stripCdata(match[1]);
}
function parseAttr(block, tag, attr) {
  const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["'][^>]*>`, "i");
  const match = block.match(regex);
  return match?.[1] ?? null;
}
function parseYouTubeFeed(xml) {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) ?? [];
  return entries.map((entry) => {
    const id = parseXmlTag(entry, "yt:videoId") ?? "";
    const title = parseXmlTag(entry, "title") ?? "Untitled Video";
    const url = parseAttr(entry, "link", "href") ?? `https://youtu.be/${id}`;
    const thumbnail = parseAttr(entry, "media:thumbnail", "url") ?? "";
    const publishedAt = parseXmlTag(entry, "published");
    return { id, title, url, thumbnail, publishedAt };
  });
}
async function fetchChannelId() {
  if (cachedChannelId) return cachedChannelId;
  const response = await fetch(YOUTUBE_CHANNEL_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (YouTube Scraper)",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });
  if (!response.ok) return null;
  const html = await response.text();
  const channelIdMatch = html.match(/\"channelId\":\"(UC[^\"]+)\"/) ?? html.match(/\"browseId\":\"(UC[^\"]+)\"/);
  const channelId = channelIdMatch?.[1] ?? null;
  if (channelId) cachedChannelId = channelId;
  return channelId;
}
async function getYouTubeVideos(maxResults = 6) {
  const now = Date.now();
  if (cachedVideos && now - cachedVideos.fetchedAt < CACHE_TTL_MS2) {
    return cachedVideos.data.slice(0, maxResults);
  }
  const channelId = await fetchChannelId();
  if (!channelId) return [];
  const response = await fetch(`${YOUTUBE_FEED_BASE}?channel_id=${channelId}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (YouTube Scraper)",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });
  if (!response.ok) return [];
  const xml = await response.text();
  const videos = parseYouTubeFeed(xml).filter((video) => video.id);
  cachedVideos = { data: videos, fetchedAt: now };
  return videos.slice(0, maxResults);
}

// server/index.ts
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!key || process.env[key] !== void 0) continue;
    process.env[key] = rest.join("=");
  }
}
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var rootDir = path.join(__dirname, "..");
loadEnv(path.join(rootDir, ".env"));
loadEnv(path.join(rootDir, ".env.local"));
var app = express();
var PORT = process.env.PORT ? Number(process.env.PORT) : 3e3;
var publicDir = path.join(__dirname, "../dist/public");
var api = express.Router();
api.get("/eventbrite", async (_req, res) => {
  try {
    const data = await getEventbriteShows();
    res.json(data);
  } catch (error) {
    console.error("Eventbrite fetch failed", error);
    res.status(502).json({
      updatedAt: null,
      events: [],
      error: "Unable to load Eventbrite shows."
    });
  }
});
api.get("/youtube", async (_req, res) => {
  try {
    const videos = await getYouTubeVideos();
    res.json({ videos });
  } catch (error) {
    console.error("YouTube fetch failed", error);
    res.status(502).json({ videos: [] });
  }
});
app.use("/api", api);
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
  if (process.env.DEBUG_KEEP_ALIVE !== "false") {
    console.log("Debug: keeping process alive (process.stdin.resume())");
    process.stdin.resume();
  }
});
//# sourceMappingURL=index.js.map
