// Watch shim. Reads the Keystatic-managed singleton for copy plus the
// hand-picked top-videos list. Owner edits both at /admin.

import watchData from "./watch-copy/index.json";

type WatchCopy = {
  heading: string;
  subhead: string;
  emptyClipsLine: string;
  youtubeVideos?: { url: string; title: string }[];
};

export type YouTubeVideoLink = {
  // Accepts a full YouTube URL (watch, share, or embed) or a bare 11-char ID.
  url: string;
  title: string;
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
