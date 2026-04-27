// Instagram Graph API -> content/.generated/instagram.json
// Requires INSTAGRAM_ACCESS_TOKEN (long-lived, ~60-day expiry) and
// INSTAGRAM_BUSINESS_ACCOUNT_ID. Use refresh-instagram-token to swap for a
// fresh token before expiry. Falls back silently when env vars are unset.
import { join } from "node:path";
import { requireEnv, safeFetch, writeJson } from "./_sync-helpers";

const OUT_PATH = join(process.cwd(), "content", ".generated", "instagram.json");

type GraphMediaItem = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

type GraphResponse = { data: GraphMediaItem[] };

export type InstagramPost = {
  id: string;
  caption: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  permalink: string;
  thumbnailUrl: string;
  timestamp: string;
};

async function main() {
  const env = requireEnv("INSTAGRAM_ACCESS_TOKEN", "INSTAGRAM_BUSINESS_ACCOUNT_ID");
  if (!env) return;

  const max = Math.min(
    Math.max(parseInt(process.env.INSTAGRAM_MAX_RESULTS ?? "9", 10), 1),
    25,
  );

  const params = new URLSearchParams({
    fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
    limit: String(max),
    access_token: env.INSTAGRAM_ACCESS_TOKEN,
  });
  const url = `https://graph.facebook.com/v21.0/${env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media?${params.toString()}`;

  const data = (await safeFetch(url)) as GraphResponse | null;
  if (!data) {
    console.log("[sync:instagram] request failed. keeping existing JSON.");
    return;
  }

  const posts: InstagramPost[] = data.data.map((item) => ({
    id: item.id,
    caption: item.caption ?? "",
    mediaType: item.media_type,
    permalink: item.permalink,
    // Reels expose thumbnail_url, images use media_url. Either is poster-only.
    thumbnailUrl: item.thumbnail_url ?? item.media_url ?? "",
    timestamp: item.timestamp,
  }));

  writeJson(OUT_PATH, posts);
  console.log(`[sync:instagram] wrote ${posts.length} posts`);
}

main();
