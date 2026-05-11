// Social shim. TikTok videos come from the Keystatic collection, consolidated
// at prebuild. Patreon posts come from the existing generated JSON.

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
};

const TIKTOK_PUBLIC_DIR = "/images/tiktok/";

type RawTikTok = {
  slug?: string;
  url?: string;
  poster?: string;
};

export const tiktokVideos: TikTokVideo[] = (tiktokIndex as RawTikTok[]).map((t) => ({
  url: t.url ?? "",
  title: (t.slug ?? "").replace(/-/g, " "),
  poster: TIKTOK_PUBLIC_DIR + (t.poster ?? ""),
}));

const fromGeneratedPatreon =
  Array.isArray(generatedPatreon) && generatedPatreon.length > 0
    ? (generatedPatreon as PatreonPost[])
    : null;

export const patreonPosts: PatreonPost[] = fromGeneratedPatreon ?? [];
