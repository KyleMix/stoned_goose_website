import generatedPatreon from "./.generated/patreon.json";

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

// Hand-edited TikTok list. TikTok for Developers requires app approval that
// isn't worth it for a small site, so we paste video URLs and posters by
// hand. Click-to-load embeds load tiktok.com/embed.js once on first click.
export const tiktokVideos: TikTokVideo[] = [];

const fromGeneratedPatreon =
  Array.isArray(generatedPatreon) && generatedPatreon.length > 0
    ? (generatedPatreon as PatreonPost[])
    : null;

export const patreonPosts: PatreonPost[] = fromGeneratedPatreon ?? [];
