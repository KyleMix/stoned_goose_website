import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { services } from "@/content/services";
import { products } from "@/content/shop";
import { pages } from "@/content/pages";
import { epkComedians } from "@/content/comedians";
import { youtubeVideos } from "@/content/watch";
import { normalizeCuratedVideos } from "@/lib/videos";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const lastModified = new Date();

  // Video sitemap entries for the clips featured on /watch. Helps Google
  // discover and index the videos embedded on the page (thumbnail, title,
  // description, and the YouTube player URL). No upload date is asserted here.
  const watchVideos = normalizeCuratedVideos(youtubeVideos).map((v) => ({
    title: v.title,
    thumbnail_loc: v.thumbnailUrl,
    description: v.description,
    player_loc: v.embedUrl,
  }));

  const staticRoutes = [
    "",
    "/shows",
    "/open-mics",
    "/watch",
    "/roster",
    "/book",
    "/shop",
    "/contact",
  ];

  const serviceRoutes = services.map((s) => `/book/${s.slug}`);
  const productRoutes = products.map((p) => `/shop/${p.slug}`);
  const pageRoutes = pages.map((p) => `/${p.slug}`);
  const epkRoutes = epkComedians.map((c) => `/roster/${c.slug}`);
  // No fragment entries: crawlers collapse /shows#id to /shows, so anchors
  // would only add noise to the URL set.

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...productRoutes,
    ...pageRoutes,
    ...epkRoutes,
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency:
      path === "" || path.startsWith("/shows") ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
    ...(path === "/watch" && watchVideos.length > 0
      ? { videos: watchVideos }
      : {}),
  }));
}
