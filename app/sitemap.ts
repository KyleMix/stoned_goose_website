import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { services } from "@/content/services";

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

  return [...staticRoutes, ...serviceRoutes].map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
