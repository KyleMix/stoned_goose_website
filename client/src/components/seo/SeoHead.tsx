import { useEffect } from "react";
import { SITE_URL } from "@/data/seo";

type SeoHeadProps = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
};

const DEFAULT_IMAGE = "/opengraph.jpg";

const upsertMetaTag = (
  attr: "name" | "property",
  key: string,
  content: string,
) => {
  const selector = `meta[${attr}="${key}"]`;
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

const upsertLinkTag = (rel: string, href: string) => {
  let element = document.head.querySelector(
    `link[rel="${rel}"]`,
  ) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
};

export default function SeoHead({
  title,
  description,
  path,
  image,
  type = "website",
}: SeoHeadProps) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    const ogImage = image ?? DEFAULT_IMAGE;

    document.title = title;

    upsertMetaTag("name", "description", description);
    upsertMetaTag("property", "og:title", title);
    upsertMetaTag("property", "og:description", description);
    upsertMetaTag("property", "og:type", type);
    upsertMetaTag("property", "og:url", url);
    upsertMetaTag("property", "og:image", ogImage);
    upsertMetaTag("name", "twitter:card", "summary_large_image");
    upsertMetaTag("name", "twitter:title", title);
    upsertMetaTag("name", "twitter:description", description);
    upsertMetaTag("name", "twitter:image", ogImage);

    upsertLinkTag("canonical", url);
  }, [title, description, path, image, type]);

  return null;
}
