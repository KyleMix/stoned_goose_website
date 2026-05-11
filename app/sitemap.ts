import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { services } from "@/content/services";
import { upcomingShows } from "@/content/shows";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const lastModified = new Date();

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
  // Hash anchors point at the same /shows page; weekly changeFrequency keeps
  // them in the discovery loop without inflating priority.
  const showAnchors = upcomingShows.map((s) => `/shows#${s.id}`);

  return [...staticRoutes, ...serviceRoutes, ...showAnchors].map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency:
      path === "" || path.startsWith("/shows") ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.includes("#") ? 0.5 : 0.7,
  }));
}
