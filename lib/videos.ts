// One normalized shape for a featured YouTube clip, plus adapters from the two
// sources the site has: the owner-curated list (content/watch.ts) and the
// auto-synced channel feed (content/feeds). Everything downstream (the watch
// grid, VideoObject JSON-LD, the video sitemap) reads this shape so a clip is
// described the same way everywhere.
//
// Only real, derivable data goes in here. YouTube thumbnails and embed URLs are
// deterministic functions of the video id, so they are honest to derive. Upload
// date is the one field we cannot invent: it is carried through when a source
// provides it and left off otherwise.

import type { YouTubeVideoLink } from "@/content/watch";
import type { YouTubeVideo } from "@/content/feeds/types";
import { extractYouTubeId } from "@/lib/youtube";

export type NormalizedVideo = {
  id: string;
  title: string;
  description: string;
  watchUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  // ISO date. Present only when the source actually knows it. Full video rich
  // results in Google require this; without it the markup is still valid and
  // still aids entity understanding, it just is not eligible for the rich card.
  uploadDate?: string;
};

function thumbnailFor(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function embedFor(id: string): string {
  return `https://www.youtube.com/embed/${id}`;
}

function watchFor(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

// Adapt one owner-curated link. Returns null when the URL has no extractable
// video id, so callers can filter cleanly.
export function normalizeCuratedVideo(
  link: YouTubeVideoLink,
): NormalizedVideo | null {
  const id = extractYouTubeId(link.url);
  if (!id) return null;
  const title = link.title.trim();
  const description = link.description?.trim();
  return {
    id,
    title,
    // Fall back to the title when no separate blurb exists. The title truthfully
    // describes the clip; it does not assert anything the page does not show.
    description: description && description.length > 0 ? description : title,
    watchUrl: link.url.startsWith("http") ? link.url : watchFor(id),
    embedUrl: embedFor(id),
    thumbnailUrl: thumbnailFor(id),
    ...(link.publishedAt && link.publishedAt.length > 0
      ? { uploadDate: link.publishedAt }
      : {}),
  };
}

export function normalizeCuratedVideos(
  links: YouTubeVideoLink[],
): NormalizedVideo[] {
  return links
    .map(normalizeCuratedVideo)
    .filter((v): v is NormalizedVideo => v !== null);
}

// Adapt one synced-feed video. The feed always carries a real thumbnail and
// publish date, so these are used directly.
export function normalizeFeedVideo(video: YouTubeVideo): NormalizedVideo {
  return {
    id: video.id,
    title: video.title,
    description: video.title,
    watchUrl: video.url,
    embedUrl: embedFor(video.id),
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.publishedAt,
  };
}
