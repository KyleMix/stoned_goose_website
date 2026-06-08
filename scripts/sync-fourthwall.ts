// Fourthwall -> content/.generated/products.json
//
// Primary: the Storefront API (rich product detail + variant ids the on-site
// cart needs), authenticated with the public NEXT_PUBLIC_FW_STOREFRONT_TOKEN.
// Fallback: the Open API (basic name/price/image), so /shop keeps a live
// catalog even before the storefront token is configured. Both fall back
// silently to the committed JSON / manual list when unavailable.
//
// Docs: https://docs.fourthwall.com/storefront/overview
import { join } from "node:path";
import type { Product, ProductVariant } from "../content/shop";
import { requireEnv, safeFetch, writeJson } from "./_sync-helpers";

const OUT_PATH = join(process.cwd(), "content", ".generated", "products.json");
const CURRENCY = "USD";

function formatPrice(value: number, currency: string): string {
  if (currency === "USD") return `$${value.toFixed(2)}`;
  return `${value.toFixed(2)} ${currency}`;
}

function storeBase(): string {
  return (
    process.env.NEXT_PUBLIC_FW_STORE_URL ??
    "https://stoned-goose-productions-zgm-shop.fourthwall.com"
  );
}

// ---------------------------------------------------------------- Storefront

type SfMoney = { value: number; currency: string };
type SfImage = { url: string; width?: number; height?: number };
type SfVariant = {
  id: string;
  name: string;
  unitPrice?: SfMoney;
  images?: SfImage[];
  stock?: { type?: string; inStock?: number };
  attributes?: { color?: { name?: string }; size?: { name?: string } };
};
type SfProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images?: SfImage[];
  variants?: SfVariant[];
};
type SfList<T> = { results?: T[]; paging?: { hasNextPage?: boolean } };

function variantAvailable(v: SfVariant): boolean {
  if (!v.stock?.type) return true;
  if (v.stock.type === "UNLIMITED") return true;
  return (v.stock.inStock ?? 0) > 0;
}

function toProduct(p: SfProduct): Product {
  const variants: ProductVariant[] = (p.variants ?? []).map((v) => ({
    id: v.id,
    name: v.name,
    price: v.unitPrice ? formatPrice(v.unitPrice.value, v.unitPrice.currency) : "",
    size: v.attributes?.size?.name,
    color: v.attributes?.color?.name,
    available: variantAvailable(v),
  }));
  const prices = (p.variants ?? [])
    .map((v) => v.unitPrice)
    .filter((m): m is SfMoney => Boolean(m));
  const lowest = prices.reduce<SfMoney | null>(
    (min, m) => (!min || m.value < min.value ? m : min),
    null,
  );
  const images = (p.images ?? []).map((i) => ({
    url: i.url,
    width: i.width,
    height: i.height,
  }));
  return {
    name: p.name,
    slug: p.slug,
    price: lowest ? formatPrice(lowest.value, lowest.currency) : "",
    url: `${storeBase()}/products/${p.slug}`,
    image: images[0]?.url ?? "",
    imageAlt: p.name,
    images: images.length > 0 ? images : undefined,
    description: p.description,
    variants: variants.length > 0 ? variants : undefined,
  };
}

async function syncStorefront(token: string): Promise<boolean> {
  const base = (
    process.env.NEXT_PUBLIC_FW_API_URL ??
    "https://storefront-api.fourthwall.com/v1"
  ).replace(/\/$/, "");
  const q = `storefront_token=${encodeURIComponent(token)}`;

  const collections = (await safeFetch(
    `${base}/collections?${q}`,
  )) as SfList<{ slug: string }> | null;
  if (!collections) {
    console.log("[sync:fourthwall] storefront request failed. keeping existing JSON.");
    return false;
  }

  const byId = new Map<string, SfProduct>();
  for (const c of collections.results ?? []) {
    if (!c.slug) continue;
    for (let page = 0; page < 20; page += 1) {
      const url = `${base}/collections/${encodeURIComponent(c.slug)}/products?currency=${CURRENCY}&page=${page}&size=50&${q}`;
      const data = (await safeFetch(url)) as SfList<SfProduct> | null;
      if (!data) break;
      const results = data.results ?? [];
      for (const p of results) byId.set(p.id, p);
      const hasNext = data.paging?.hasNextPage;
      if (hasNext === false) break;
      if (hasNext === undefined && results.length < 50) break;
    }
  }

  const products = Array.from(byId.values())
    .map(toProduct)
    .filter((p) => Boolean(p.image));
  writeJson(OUT_PATH, products);
  console.log(`[sync:fourthwall] wrote ${products.length} products (storefront)`);
  return true;
}

// ------------------------------------------------------------------ Open API

type OaImage = { url: string };
type OaProduct = {
  id: string;
  name: string;
  slug: string;
  state?: { type?: string };
  status?: string;
  variants?: Array<{ unitPrice?: SfMoney; images?: OaImage[] }>;
  images?: OaImage[];
};

function oaImage(p: OaProduct): string {
  if (p.images?.[0]?.url) return p.images[0].url;
  for (const v of p.variants ?? []) if (v.images?.[0]?.url) return v.images[0].url;
  return "";
}

function oaAvailable(p: OaProduct): boolean {
  if (p.state?.type) return p.state.type === "AVAILABLE";
  if (p.status) return p.status.toUpperCase() === "AVAILABLE";
  return true;
}

async function syncOpenApi(env: Record<string, string>): Promise<boolean> {
  const auth = Buffer.from(
    `${env.FOURTHWALL_API_USERNAME}:${env.FOURTHWALL_API_PASSWORD}`,
  ).toString("base64");
  const apiBase = env.FOURTHWALL_API_BASE_URL.replace(/\/$/, "").replace(
    /\/open-api\/v1$/,
    "/open-api/v1.0",
  );

  const byId = new Map<string, OaProduct>();
  for (let page = 0; page < 50; page += 1) {
    const url = `${apiBase}/products?page=${page}&size=20`;
    const data = (await safeFetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    })) as SfList<OaProduct> | null;
    if (!data) {
      if (page === 0) {
        console.log("[sync:fourthwall] open-api request failed. keeping existing JSON.");
        return false;
      }
      break;
    }
    const results = data.results ?? [];
    const before = byId.size;
    for (const p of results) byId.set(p.id, p);
    const hasNext = data.paging?.hasNextPage;
    if (hasNext === false) break;
    if (hasNext === undefined && (results.length < 20 || byId.size === before)) break;
  }

  const products: Product[] = Array.from(byId.values())
    .filter(oaAvailable)
    .filter((p) => Boolean(oaImage(p)))
    .map((p) => {
      const price = p.variants?.[0]?.unitPrice;
      return {
        name: p.name,
        slug: p.slug,
        price: price ? formatPrice(price.value, price.currency) : "",
        url: `${storeBase()}/products/${p.slug}`,
        image: oaImage(p),
        imageAlt: p.name,
      };
    });
  writeJson(OUT_PATH, products);
  console.log(`[sync:fourthwall] wrote ${products.length} products (open-api)`);
  return true;
}

async function main() {
  const token = process.env.NEXT_PUBLIC_FW_STOREFRONT_TOKEN;
  if (token && token.length > 0) {
    await syncStorefront(token);
    return;
  }
  const env = requireEnv(
    "FOURTHWALL_API_USERNAME",
    "FOURTHWALL_API_PASSWORD",
    "FOURTHWALL_API_BASE_URL",
  );
  if (!env) return;
  await syncOpenApi(env);
}

main();
