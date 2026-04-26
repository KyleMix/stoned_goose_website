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
    "/members",
    "/comedians",
    "/watch",
    "/services",
    "/shop",
    "/sponsor",
    "/submit",
    "/contact",
  ];

  const serviceRoutes = services.map((s) => `/services/${s.slug}`);

  return [...staticRoutes, ...serviceRoutes].map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
