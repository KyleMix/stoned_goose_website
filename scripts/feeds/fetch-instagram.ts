// Instagram feed -> content/feeds/instagram.json
// Uses Instagram Graph API (graph.instagram.com) for Business/Creator accounts.
// Long-lived user token (~60 day expiry). Refresh via npm run refresh:instagram-token.
//
// Required env:
//   INSTAGRAM_ACCESS_TOKEN
import type { InstagramFeed, InstagramPost } from "../../content/feeds/types";
import { logFailure, writeFeed } from "./_helpers";
import { InstagramFeedSchema, parseOrThrow } from "./schema";

const SOURCE = "instagram" as const;
const LIMIT = 12;

type GraphMediaItem = {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  // graph.instagram.com returns "media_product_type" with values like
  // "REELS" / "FEED" / "STORY". We use it to discriminate REEL from VIDEO.
  media_product_type?: "REELS" | "FEED" | "STORY" | "AD";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
};

type GraphResponse = { data: GraphMediaItem[] };

function normalize(item: GraphMediaItem): InstagramPost {
  const isReel =
    item.media_type === "VIDEO" && item.media_product_type === "REELS";
  return {
    id: item.id,
    permalink: item.permalink,
    mediaType: isReel ? "REEL" : item.media_type,
    mediaUrl: item.media_url ?? "",
    thumbnailUrl: item.thumbnail_url ?? null,
    caption: item.caption ?? null,
    timestamp: item.timestamp,
  };
}

async function main() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    console.log("[feeds:instagram] skipping. missing INSTAGRAM_ACCESS_TOKEN.");
    return;
  }

  const params = new URLSearchParams({
    fields:
      "id,media_type,media_product_type,media_url,thumbnail_url,permalink,caption,timestamp",
    limit: String(LIMIT),
    access_token: token,
  });
  const url = `https://graph.instagram.com/me/media?${params.toString()}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    logFailure(SOURCE, `network error: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logFailure(SOURCE, `${res.status} ${res.statusText} ${body.slice(0, 240)}`);
    return;
  }

  let data: GraphResponse;
  try {
    data = (await res.json()) as GraphResponse;
  } catch (err) {
    logFailure(SOURCE, `bad JSON: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }

  const posts: InstagramPost[] = (data.data ?? []).slice(0, LIMIT).map(normalize);

  const feed: InstagramFeed = {
    fetchedAt: new Date().toISOString(),
    source: SOURCE,
    status: "ok",
    errorMessage: null,
    posts,
  };

  parseOrThrow(InstagramFeedSchema, feed, "instagram fetch output");
  writeFeed(SOURCE, feed);
  console.log(`[feeds:instagram] wrote ${posts.length} posts`);
}

main();
