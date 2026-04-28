// Zod schemas for the social feed JSON files. Imported by the fetch
// scripts (validate output before writing) and by validate-feeds (run
// as a prebuild step to catch hand-edits + drift). NOT imported by
// anything under app/ or components/, so Zod never reaches the client
// bundle.
import { z } from "zod";

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

export const InstagramFeedSchema = z.object({
  ...ManifestBase,
  source: z.literal("instagram"),
  posts: z.array(InstagramPostSchema),
});

export const YouTubeFeedSchema = z.object({
  ...ManifestBase,
  source: z.literal("youtube"),
  videos: z.array(YouTubeVideoSchema),
});

export const FacebookFeedSchema = z.object({
  ...ManifestBase,
  source: z.literal("facebook"),
  posts: z.array(FacebookPostSchema),
});

export function parseOrThrow<T>(
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
