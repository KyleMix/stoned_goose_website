const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@stonedgooseproductions";
const YOUTUBE_FEED_BASE = "https://www.youtube.com/feeds/videos.xml";
const CACHE_TTL_MS = 10 * 60 * 1000;

export type YouTubeVideo = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt: string | null;
};

type CacheEntry = {
  data: YouTubeVideo[];
  fetchedAt: number;
};

let cachedVideos: CacheEntry | null = null;
let cachedChannelId: string | null = null;

function stripCdata(value: string): string {
  return value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}

function parseXmlTag(block: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = block.match(regex);
  if (!match?.[1]) return null;
  return stripCdata(match[1]);
}

function parseAttr(block: string, tag: string, attr: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*${attr}=[\"']([^\"']+)[\"'][^>]*>`, "i");
  const match = block.match(regex);
  return match?.[1] ?? null;
}

function parseYouTubeFeed(xml: string): YouTubeVideo[] {
  const entries = xml.match(/<entry>[\\s\\S]*?<\\/entry>/gi) ?? [];
  return entries.map((entry) => {
    const id = parseXmlTag(entry, "yt:videoId") ?? "";
    const title = parseXmlTag(entry, "title") ?? "Untitled Video";
    const url = parseAttr(entry, "link", "href") ?? `https://youtu.be/${id}`;
    const thumbnail = parseAttr(entry, "media:thumbnail", "url") ?? "";
    const publishedAt = parseXmlTag(entry, "published");
    return { id, title, url, thumbnail, publishedAt };
  });
}

async function fetchChannelId(): Promise<string | null> {
  if (cachedChannelId) return cachedChannelId;
  const response = await fetch(YOUTUBE_CHANNEL_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (YouTube Scraper)",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) return null;

  const html = await response.text();
  const channelIdMatch =
    html.match(/\"channelId\":\"(UC[^\"]+)\"/) ??
    html.match(/\"browseId\":\"(UC[^\"]+)\"/);
  const channelId = channelIdMatch?.[1] ?? null;
  if (channelId) cachedChannelId = channelId;
  return channelId;
}

export async function getYouTubeVideos(maxResults = 6): Promise<YouTubeVideo[]> {
  const now = Date.now();
  if (cachedVideos && now - cachedVideos.fetchedAt < CACHE_TTL_MS) {
    return cachedVideos.data.slice(0, maxResults);
  }

  const channelId = await fetchChannelId();
  if (!channelId) return [];

  const response = await fetch(`${YOUTUBE_FEED_BASE}?channel_id=${channelId}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (YouTube Scraper)",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) return [];

  const xml = await response.text();
  const videos = parseYouTubeFeed(xml).filter((video) => video.id);
  cachedVideos = { data: videos, fetchedAt: now };
  return videos.slice(0, maxResults);
}
