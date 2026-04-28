// Typed schema for build-time social feeds. Each platform has its own item
// shape and a manifest wrapper carrying freshness metadata. The manifest is
// what the site reads to decide whether to render content, render an empty
// state, or fire a "Feed Stale Render" analytics event.

export type InstagramPost = {
  id: string;
  permalink: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REEL";
  mediaUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  timestamp: string;
};

export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  durationSeconds: number | null;
};

export type FacebookPost = {
  id: string;
  permalink: string;
  message: string | null;
  createdAt: string;
  attachmentImageUrl: string | null;
};

export type FeedSource = "instagram" | "youtube" | "facebook";
export type FeedStatus = "ok" | "stale" | "error";

export type FeedManifest = {
  fetchedAt: string;
  source: FeedSource;
  status: FeedStatus;
  errorMessage: string | null;
};

export type InstagramFeed = FeedManifest & {
  source: "instagram";
  posts: InstagramPost[];
};

export type YouTubeFeed = FeedManifest & {
  source: "youtube";
  videos: YouTubeVideo[];
};

export type FacebookFeed = FeedManifest & {
  source: "facebook";
  posts: FacebookPost[];
};
