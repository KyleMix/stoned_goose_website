// Fourthwall product pages -> content/.generated/shop-images.json
//
// The manual product list (content/shop-products/) carries an image URL an
// editor pasted from Fourthwall. Most entries have none, and a pasted
// imgproxy URL dies the moment the photo is replaced on Fourthwall, so /shop
// ends up with letter tiles and broken images whenever the full catalog sync
// (sync:fourthwall) has no credentials.
//
// Every product page is public and names its photo in an og:image tag, so
// this reads that tag at build time and writes { slug: imageUrl }. No token
// needed. content/shop.ts lays it over the manual list.
//
// Same rule as every other writer in content/.generated: a sync never
// replaces something with nothing. A failed fetch or a page with no tag keeps
// the previous URL for that slug.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { writeJson } from "./_sync-helpers";

const OUT_PATH = join(process.cwd(), "content", ".generated", "shop-images.json");
const MANUAL_PATH = join(
  process.cwd(),
  "content",
  ".generated",
  "shop-products-index.json",
);
const GENERATED_PATH = join(process.cwd(), "content", ".generated", "products.json");

export type ShopImages = Record<string, string>;

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#x2F;/gi, "/");
}

// Pull og:image (or twitter:image as a fallback) out of a page. Attribute
// order varies between themes, so match the whole tag and read both halves.
export function extractOgImage(html: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const found: Record<string, string> = {};
  for (const tag of tags) {
    const key = tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1];
    const content = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!key || !content) continue;
    const k = key.toLowerCase();
    if (!(k in found)) found[k] = decodeEntities(content.trim());
  }
  for (const k of ["og:image:secure_url", "og:image", "twitter:image"]) {
    const url = found[k];
    if (url && /^https:\/\/\S+$/.test(url)) return url;
  }
  return null;
}

// Merge a fresh scrape over the previous file. A slug the scrape missed keeps
// its old URL. When three or more pages all returned the same image, that is
// the store's generic share card rather than a product photo, so the whole
// scrape is discarded.
export function mergeImages(
  previous: ShopImages,
  fresh: ShopImages,
): { images: ShopImages; warning: string | null } {
  const urls = Object.values(fresh);
  if (urls.length >= 3 && new Set(urls).size === 1) {
    return {
      images: previous,
      warning: `every page returned the same image (${urls[0]}). keeping previous.`,
    };
  }
  return { images: { ...previous, ...fresh }, warning: null };
}

function readJson<T>(path: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; StonedGooseSiteBuild/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.warn(`[sync:shop-images] ${url} -> ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(
      `[sync:shop-images] ${url} -> ${err instanceof Error ? err.message : err}`,
    );
    return null;
  }
}

async function main() {
  const generated = readJson<unknown[]>(GENERATED_PATH, []);
  if (Array.isArray(generated) && generated.length > 0) {
    console.log("[sync:shop-images] full catalog sync is live. nothing to do.");
    return;
  }

  const manual = readJson<Array<{ slug?: string; url?: string; draft?: boolean }>>(
    MANUAL_PATH,
    [],
  );
  const previous = readJson<ShopImages>(OUT_PATH, {});
  const fresh: ShopImages = {};
  for (const p of manual) {
    if (!p.slug || !p.url || p.draft === true) continue;
    const html = await fetchPage(p.url);
    const image = html ? extractOgImage(html) : null;
    if (image) fresh[p.slug] = image;
  }

  const { images, warning } = mergeImages(previous, fresh);
  if (warning) console.warn(`[sync:shop-images] ${warning}`);
  writeJson(OUT_PATH, images);
  console.log(
    `[sync:shop-images] ${Object.keys(fresh).length}/${manual.length} pages read, ${Object.keys(images).length} images on file`,
  );
}

if (process.argv[1]?.includes("sync-shop-images")) {
  main();
}
