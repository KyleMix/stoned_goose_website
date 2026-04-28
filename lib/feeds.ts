import instagramRaw from "@/content/feeds/instagram.json";
import youtubeRaw from "@/content/feeds/youtube.json";
import facebookRaw from "@/content/feeds/facebook.json";
import type {
  FacebookFeed,
  InstagramFeed,
  YouTubeFeed,
} from "@/content/feeds/types";

export const instagramFeed = instagramRaw as InstagramFeed;
export const youtubeFeed = youtubeRaw as YouTubeFeed;
export const facebookFeed = facebookRaw as FacebookFeed;

export function isFresh(
  feed: { fetchedAt: string },
  maxAgeHours = 24,
): boolean {
  const age = Date.now() - new Date(feed.fetchedAt).getTime();
  return age < maxAgeHours * 60 * 60 * 1000;
}

export function relativeAge(fetchedAt: string): string {
  const ms = Date.now() - new Date(fetchedAt).getTime();
  if (Number.isNaN(ms) || ms < 0) return "unknown";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours < 1) return "less than an hour ago";
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return "over a month ago";
}
