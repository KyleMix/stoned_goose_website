// YouTube feed -> content/feeds/youtube.json
// Uses the channel's public RSS/Atom feed. No API key or quota required.
//   https://www.youtube.com/feeds/videos.xml?channel_id=<id>
//
// Channel id comes from YOUTUBE_CHANNEL_ID, falling back to the id stored in
// content/site/index.json (social.youtubeChannelId) so there is a single
// source of truth.
import siteData from "../../content/site/index.json";
import type { YouTubeFeed, YouTubeVideo } from "../../content/feeds/types";
import { logFailure, writeFeed } from "./_helpers";
import { YouTubeFeedSchema, parseOrThrow } from "./schema";

const SOURCE = "youtube" as const;
const LIMIT = 12;

// Decode the handful of XML/HTML entities YouTube titles actually contain.
function decodeEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function matchOne(block: string, re: RegExp): string | null {
  const m = block.match(re);
  return m ? m[1] : null;
}

// Parse the Atom feed into videos. Each <entry> carries <yt:videoId>, <title>,
// and <published>. We derive the thumbnail and watch URL from the id, matching
// the convention TopVideosGrid already uses.
function parseEntries(xml: string): YouTubeVideo[] {
  const videos: YouTubeVideo[] = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;
  while ((match = entryRe.exec(xml)) !== null) {
    const block = match[1];
    const id = matchOne(block, /<yt:videoId>([^<]+)<\/yt:videoId>/);
    if (!id) continue;
    const rawTitle = matchOne(block, /<title>([\s\S]*?)<\/title>/) ?? "";
    const published = matchOne(block, /<published>([^<]+)<\/published>/) ?? "";
    videos.push({
      id,
      title: decodeEntities(rawTitle.trim()) || "YouTube video",
      url: `https://www.youtube.com/watch?v=${id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      publishedAt: published,
    });
  }
  return videos;
}

async function main() {
  const channelId =
    process.env.YOUTUBE_CHANNEL_ID || siteData.social?.youtubeChannelId;
  if (!channelId) {
    console.log("[feeds:youtube] skipping. missing channel id.");
    return;
  }

  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

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

  let xml: string;
  try {
    xml = await res.text();
  } catch (err) {
    logFailure(SOURCE, `read error: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }

  const videos = parseEntries(xml).slice(0, LIMIT);
  if (videos.length === 0) {
    logFailure(SOURCE, "no entries parsed from feed.");
    return;
  }

  const feed: YouTubeFeed = {
    fetchedAt: new Date().toISOString(),
    source: SOURCE,
    status: "ok",
    errorMessage: null,
    videos,
  };

  parseOrThrow(YouTubeFeedSchema, feed, "youtube fetch output");
  writeFeed(SOURCE, feed);
  console.log(`[feeds:youtube] wrote ${videos.length} videos`);
}

main();
