// Watch shim. Reads the CMS-managed singleton for copy plus the
// hand-picked top-videos list. Owner edits both at /admin.

import watchData from "./watch-copy/index.json";
import { normaliseBlocks, type Block } from "@/lib/blocks";

type WatchCopy = {
  heading: string;
  subhead: string;
  emptyClipsLine: string;
  youtubeVideos?: {
    url: string;
    title: string;
    description?: string;
    publishedAt?: string;
  }[];
  topSections?: unknown;
  bottomSections?: unknown;
};

export type YouTubeVideoLink = {
  // Accepts a full YouTube URL (watch, share, or embed) or a bare 11-char ID.
  url: string;
  title: string;
  // Optional. A one-line blurb for search and video markup. Falls back to the
  // title when absent.
  description?: string;
  // Optional ISO date (e.g. "2026-05-01"). Supplying it makes the clip eligible
  // for Google video rich results. Left off until a real date is known.
  publishedAt?: string;
};

const raw = watchData as WatchCopy;

export const watchCopy = {
  heading: raw.heading,
  subhead: raw.subhead,
  emptyClipsLine: raw.emptyClipsLine,
};

// Top 5 YouTube videos featured on /watch. CMS-editable through the watch
// copy singleton. Leave empty to hide the grid section.
export const youtubeVideos: YouTubeVideoLink[] = raw.youtubeVideos ?? [];

export const watchTopSections: Block[] = normaliseBlocks(raw.topSections);
export const watchBottomSections: Block[] = normaliseBlocks(raw.bottomSections);
