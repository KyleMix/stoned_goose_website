import { z } from "zod";
import instagramRaw from "@/content/feeds/instagram.json";
import youtubeRaw from "@/content/feeds/youtube.json";
import facebookRaw from "@/content/feeds/facebook.json";
import type {
  FacebookFeed,
  InstagramFeed,
  YouTubeFeed,
} from "@/content/feeds/types";

const FeedStatusSchema = z.enum(["ok", "stale", "error"]);

const ManifestBase = {
  fetchedAt: z.string(),
  status: FeedStatusSchema,
  errorMessage: z.string().nullable(),
};

const InstagramPostSchema = z.object({
  id: z.string(),
  permalink: z.string(),
  mediaType: z.enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM", "REEL"]),
  mediaUrl: z.string(),
  thumbnailUrl: z.string().nullable(),
  caption: z.string().nullable(),
  timestamp: z.string(),
});

const YouTubeVideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnailUrl: z.string(),
  publishedAt: z.string(),
  durationSeconds: z.number().nullable(),
});

const FacebookPostSchema = z.object({
  id: z.string(),
  permalink: z.string(),
  message: z.string().nullable(),
  createdAt: z.string(),
  attachmentImageUrl: z.string().nullable(),
});

const InstagramFeedSchema = z.object({
  ...ManifestBase,
  source: z.literal("instagram"),
  posts: z.array(InstagramPostSchema),
});

const YouTubeFeedSchema = z.object({
  ...ManifestBase,
  source: z.literal("youtube"),
  videos: z.array(YouTubeVideoSchema),
});

const FacebookFeedSchema = z.object({
  ...ManifestBase,
  source: z.literal("facebook"),
  posts: z.array(FacebookPostSchema),
});

// Validate at module load. A malformed feed file fails the build with a
// clear stack and the offending field path. Catches API drift early.
function parseOrThrow<T>(
  schema: z.ZodType<T>,
  raw: unknown,
  label: string,
): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`[feeds] invalid ${label}: ${issues}`);
  }
  return result.data;
}

export const instagramFeed: InstagramFeed = parseOrThrow(
  InstagramFeedSchema,
  instagramRaw,
  "content/feeds/instagram.json",
);
export const youtubeFeed: YouTubeFeed = parseOrThrow(
  YouTubeFeedSchema,
  youtubeRaw,
  "content/feeds/youtube.json",
);
export const facebookFeed: FacebookFeed = parseOrThrow(
  FacebookFeedSchema,
  facebookRaw,
  "content/feeds/facebook.json",
);

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
