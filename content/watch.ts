export const watchCopy = {
  heading: "Media & Clips",
  subhead: "Watch clips, reels, and full sets from Stoned Goose Productions.",
  emptyClipsLine:
    "No videos available yet. Check out our channel for the latest uploads.",
};

export type YouTubeVideoLink = {
  // Accepts a full YouTube URL (watch, share, or embed) or a bare 11-char ID.
  url: string;
  title: string;
};

// Top 5 YouTube videos featured on /watch. Owner-editable. Add or replace
// entries as new uploads land. Leave the array empty to hide the section.
export const youtubeVideos: YouTubeVideoLink[] = [];
