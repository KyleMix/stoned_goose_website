import generatedInstagram from "./.generated/instagram.json";
import generatedFacebook from "./.generated/facebook.json";
import generatedPatreon from "./.generated/patreon.json";

export type InstagramPost = {
  id: string;
  caption: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  permalink: string;
  thumbnailUrl: string;
  timestamp: string;
};

export type FacebookPost = {
  id: string;
  message: string;
  permalink: string;
  createdAt: string;
  fullPicture: string | null;
};

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

const fromGeneratedInstagram =
  Array.isArray(generatedInstagram) && generatedInstagram.length > 0
    ? (generatedInstagram as InstagramPost[])
    : null;

const fromGeneratedFacebook =
  Array.isArray(generatedFacebook) && generatedFacebook.length > 0
    ? (generatedFacebook as FacebookPost[])
    : null;

const fromGeneratedPatreon =
  Array.isArray(generatedPatreon) && generatedPatreon.length > 0
    ? (generatedPatreon as PatreonPost[])
    : null;

export const instagramPosts: InstagramPost[] = fromGeneratedInstagram ?? [];
export const facebookPosts: FacebookPost[] = fromGeneratedFacebook ?? [];
export const patreonPosts: PatreonPost[] = fromGeneratedPatreon ?? [];
