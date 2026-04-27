// YouTube Data API v3 -> content/.generated/youtube.json
// Fetches the latest N uploads for the configured channel. Capped via
// YOUTUBE_MAX_RESULTS (defaults to 6, hard cap of 50 per the API).
import { join } from "node:path";
import type { YouTubeVideo } from "../content/watch";
import { requireEnv, safeFetch, writeJson } from "./_sync-helpers";

const OUT_PATH = join(process.cwd(), "content", ".generated", "youtube.json");

type SearchListResponse = {
  items: Array<{
    id: { videoId?: string };
    snippet: { title: string; publishedAt: string };
  }>;
};

async function main() {
  const env = requireEnv("YOUTUBE_API_KEY", "YOUTUBE_CHANNEL_ID");
  if (!env) return;

  const max = Math.min(
    Math.max(parseInt(process.env.YOUTUBE_MAX_RESULTS ?? "6", 10), 1),
    50,
  );

  const params = new URLSearchParams({
    key: env.YOUTUBE_API_KEY,
    channelId: env.YOUTUBE_CHANNEL_ID,
    part: "snippet",
    type: "video",
    order: "date",
    maxResults: String(max),
  });
  const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
  const data = (await safeFetch(url)) as SearchListResponse | null;
  if (!data) {
    console.log("[sync:youtube] request failed. keeping existing JSON.");
    return;
  }

  const videos: YouTubeVideo[] = data.items
    .filter((it) => it.id.videoId)
    .map((it) => ({ id: it.id.videoId!, title: it.snippet.title }));

  writeJson(OUT_PATH, videos);
  console.log(`[sync:youtube] wrote ${videos.length} videos`);
}

main();
