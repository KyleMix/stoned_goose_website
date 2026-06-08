// Fourthwall Open API -> content/.generated/products.json
// Pulls the full live catalog at build time so /shop mirrors the storefront
// instead of a hand-maintained list. Falls back silently when env vars or
// network are missing, keeping the previously generated JSON in place.
//
// Endpoint: GET /open-api/v1.0/products (Basic auth with the Open API User
// username/password). Paginated via the `paging.hasNextPage` flag. See
// https://docs.fourthwall.com/open-api/
import { join } from "node:path";
import type { Product } from "../content/shop";
import { requireEnv, safeFetch, writeJson } from "./_sync-helpers";

const OUT_PATH = join(process.cwd(), "content", ".generated", "products.json");

const PAGE_SIZE = 20;
const MAX_PAGES = 50;

type FourthwallImage = { url: string };

type FourthwallProduct = {
  id: string;
  name: string;
  slug: string;
  state?: { type?: string };
  status?: string;
  variants?: Array<{
    unitPrice?: { value: number; currency: string };
    images?: FourthwallImage[];
  }>;
  images?: FourthwallImage[];
};

type FourthwallListResponse = {
  results?: FourthwallProduct[];
  paging?: { hasNextPage?: boolean };
};

function formatPrice(value: number, currency: string): string {
  if (currency === "USD") return `$${value.toFixed(2)}`;
  return `${value.toFixed(2)} ${currency}`;
}

// Image can sit on the product or on a variant depending on the listing.
function firstImage(p: FourthwallProduct): string {
  if (p.images?.[0]?.url) return p.images[0].url;
  for (const v of p.variants ?? []) {
    if (v.images?.[0]?.url) return v.images[0].url;
  }
  return "";
}

// The product is shown unless it is explicitly marked unavailable. We avoid a
// strict allow-list so an unexpected status value never blanks the whole shop.
function isAvailable(p: FourthwallProduct): boolean {
  if (p.state?.type) return p.state.type === "AVAILABLE";
  if (p.status) return p.status.toUpperCase() === "AVAILABLE";
  return true;
}

async function main() {
  const env = requireEnv(
    "FOURTHWALL_API_USERNAME",
    "FOURTHWALL_API_PASSWORD",
    "FOURTHWALL_API_BASE_URL",
  );
  if (!env) return;

  // Optional overall cap. Unset means pull everything.
  const rawCap = process.env.FOURTHWALL_PRODUCT_LIMIT;
  const cap =
    rawCap && Number.isFinite(parseInt(rawCap, 10))
      ? Math.max(parseInt(rawCap, 10), 1)
      : Infinity;

  const auth = Buffer.from(
    `${env.FOURTHWALL_API_USERNAME}:${env.FOURTHWALL_API_PASSWORD}`,
  ).toString("base64");
  // The Open API lives under /open-api/v1.0. Tolerate a base URL that was
  // configured as .../v1 so a stale env var still resolves correctly.
  const apiBase = env.FOURTHWALL_API_BASE_URL.replace(/\/$/, "").replace(
    /\/open-api\/v1$/,
    "/open-api/v1.0",
  );

  // Collect by id so a duplicated page (API ignoring `page`) ends the loop
  // instead of looping forever.
  const byId = new Map<string, FourthwallProduct>();
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const url = `${apiBase}/products?page=${page}&size=${PAGE_SIZE}`;
    const data = (await safeFetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    })) as FourthwallListResponse | null;

    // First page failing means we learned nothing: keep the existing JSON.
    if (!data) {
      if (page === 0) {
        console.log("[sync:fourthwall] request failed. keeping existing JSON.");
        return;
      }
      break;
    }

    const results = data.results ?? [];
    const before = byId.size;
    for (const p of results) byId.set(p.id, p);

    if (byId.size >= cap) break;
    // Prefer the API's own flag; fall back to a short/empty/duplicate page.
    const hasNext = data.paging?.hasNextPage;
    if (hasNext === false) break;
    if (hasNext === undefined && (results.length < PAGE_SIZE || byId.size === before)) {
      break;
    }
  }

  const storeBase =
    process.env.NEXT_PUBLIC_FW_STORE_URL ??
    "https://stoned-goose-productions-zgm-shop.fourthwall.com";

  const products: Product[] = Array.from(byId.values())
    .filter(isAvailable)
    // Skip imageless products so the on-page count matches what renders.
    .filter((p) => Boolean(firstImage(p)))
    .slice(0, cap === Infinity ? undefined : cap)
    .map((p) => {
      const price = p.variants?.[0]?.unitPrice;
      return {
        name: p.name,
        price: price ? formatPrice(price.value, price.currency) : "",
        url: `${storeBase}/products/${p.slug}`,
        image: firstImage(p),
        imageAlt: p.name,
      };
    });

  writeJson(OUT_PATH, products);
  console.log(`[sync:fourthwall] wrote ${products.length} products`);
}

main();
