import { instagramFeed } from "@/lib/feeds";
import { tiktokVideos } from "@/content/social";
import { news } from "@/content/news";
import type { NewsItem } from "@/components/news-card";

// Builds a unified news feed by interleaving curated posts (content/news.ts)
// with auto-synced Instagram + manually-curated TikTok. Sorted newest first.
// Used by /watch and the home Latest strip.
//
// TikTok lacks a date field in content/social.ts, so it falls back to "now".
// That's good enough for ordering since Instagram provides real timestamps.

export function buildNewsFeed(): NewsItem[] {
  const items: NewsItem[] = [];

  for (const post of news) {
    items.push({
      kind: "post",
      id: post.slug,
      title: post.title,
      summary: post.summary,
      poster: post.image,
      posterAlt: post.imageAlt,
      date: post.date,
    });
  }

  for (const post of instagramFeed.posts) {
    items.push({
      kind: "instagram",
      id: post.id,
      title: post.caption?.split("\n")[0]?.slice(0, 80) || "Instagram post",
      poster: post.thumbnailUrl ?? post.mediaUrl ?? null,
      href: post.permalink,
      isVideo: post.mediaType === "REEL" || post.mediaType === "VIDEO",
      date: post.timestamp,
    });
  }

  const tiktokFallback = new Date().toISOString();
  tiktokVideos.forEach((v, i) => {
    items.push({
      kind: "tiktok",
      id: `tiktok-${i}`,
      title: v.title,
      poster: v.poster,
      posterAlt: v.posterAlt,
      href: v.url,
      date: tiktokFallback,
    });
  });

  return items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
