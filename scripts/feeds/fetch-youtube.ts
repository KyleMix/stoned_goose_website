// YouTube feed -> content/feeds/youtube.json
// Uses YouTube Data API v3. Two-call pattern: search.list for the latest IDs,
// then videos.list for durations and best-available thumbnails.
//
// Required env:
//   YOUTUBE_API_KEY
// Reads channel ID from content/site.ts site.social.youtubeChannelId.
import { site } from "../../content/site";
import type { YouTubeFeed, YouTubeVideo } from "../../content/feeds/types";
import { logFailure, writeFeed } from "./_helpers";

const SOURCE = "youtube" as const;
const LIMIT = 12;

type SearchListResponse = {
  items: Array<{
    id: { videoId?: string };
    snippet: { publishedAt: string; title: string; description?: string };
  }>;
};

type VideosListResponse = {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description?: string;
      publishedAt: string;
      thumbnails?: Record<string, { url: string }>;
    };
    contentDetails: { duration: string };
  }>;
};

// Parse ISO 8601 duration ("PT4M13S", "PT1H2M", "PT45S") to total seconds.
function parseDuration(iso: string): number | null {
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return null;
  const [, h, m, s] = match;
  return (
    (h ? parseInt(h, 10) * 3600 : 0) +
    (m ? parseInt(m, 10) * 60 : 0) +
    (s ? parseInt(s, 10) : 0)
  );
}

function pickThumbnail(
  thumbnails: Record<string, { url: string }> | undefined,
  fallbackId: string,
): string {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    `https://i.ytimg.com/vi/${fallbackId}/hqdefault.jpg`
  );
}

async function safeFetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      logFailure(SOURCE, `${res.status} ${res.statusText} ${body.slice(0, 240)}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    logFailure(SOURCE, `network error: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = site.social.youtubeChannelId;

  if (!apiKey) {
    console.log("[feeds:youtube] skipping. missing YOUTUBE_API_KEY.");
    return;
  }
  if (!channelId) {
    console.log(
      "[feeds:youtube] skipping. site.social.youtubeChannelId is empty.",
    );
    return;
  }

  const searchParams = new URLSearchParams({
    key: apiKey,
    channelId,
    part: "snippet",
    type: "video",
    order: "date",
    maxResults: String(LIMIT),
  });
  const search = await safeFetchJson<SearchListResponse>(
    `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`,
  );
  if (!search) return;

  const ids = search.items.map((it) => it.id.videoId).filter((v): v is string => Boolean(v));
  if (ids.length === 0) {
    const feed: YouTubeFeed = {
      fetchedAt: new Date().toISOString(),
      source: SOURCE,
      status: "ok",
      errorMessage: null,
      videos: [],
    };
    writeFeed(SOURCE, feed);
    console.log("[feeds:youtube] wrote 0 videos");
    return;
  }

  const detailParams = new URLSearchParams({
    key: apiKey,
    id: ids.join(","),
    part: "snippet,contentDetails",
  });
  const details = await safeFetchJson<VideosListResponse>(
    `https://www.googleapis.com/youtube/v3/videos?${detailParams.toString()}`,
  );
  if (!details) return;

  const videos: YouTubeVideo[] = details.items.map((v) => ({
    id: v.id,
    title: v.snippet.title,
    description: v.snippet.description ?? "",
    thumbnailUrl: pickThumbnail(v.snippet.thumbnails, v.id),
    publishedAt: v.snippet.publishedAt,
    durationSeconds: parseDuration(v.contentDetails.duration),
  }));

  const feed: YouTubeFeed = {
    fetchedAt: new Date().toISOString(),
    source: SOURCE,
    status: "ok",
    errorMessage: null,
    videos,
  };
  writeFeed(SOURCE, feed);
  console.log(`[feeds:youtube] wrote ${videos.length} videos`);
}

main();
