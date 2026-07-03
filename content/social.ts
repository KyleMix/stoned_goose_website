// Social shim. TikTok videos come from the CMS collection, consolidated
// at prebuild. Patreon posts come from the existing generated JSON. TikTok
// entries flagged as draft are filtered out so unpublished posters stay off
// /watch.

import generatedPatreon from "./.generated/patreon.json";
import tiktokIndex from "./.generated/tiktok-index.json";

export type PatreonPost = {
  title: string;
  link: string;
  pubDate: string;
};

export type TikTokVideo = {
  url: string;
  title: string;
  poster: string;
  posterAlt: string;
};

const TIKTOK_PUBLIC_DIR = "/images/tiktok/";

// Optional CMS fields are null when the editor leaves them empty.
type RawTikTok = {
  slug?: string | null;
  title?: string | null;
  url?: string | null;
  poster?: string | null;
  posterAlt?: string | null;
  draft?: boolean | null;
};

export const tiktokVideos: TikTokVideo[] = (tiktokIndex as unknown as RawTikTok[])
  .filter((t) => t.draft !== true)
  .map((t) => {
    // Prefer the title the editor typed; fall back to de-slugging the folder
    // name for entries created before the title field existed.
    const title = t.title && t.title.length > 0 ? t.title : (t.slug ?? "").replace(/-/g, " ");
    return {
      url: t.url ?? "",
      title,
      poster: TIKTOK_PUBLIC_DIR + (t.poster ?? ""),
      posterAlt:
        t.posterAlt && t.posterAlt.length > 0
          ? t.posterAlt
          : title || "TikTok video poster",
    };
  });

const fromGeneratedPatreon =
  Array.isArray(generatedPatreon) && generatedPatreon.length > 0
    ? (generatedPatreon as PatreonPost[])
    : null;

export const patreonPosts: PatreonPost[] = fromGeneratedPatreon ?? [];
