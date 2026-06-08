// Fourthwall Open API -> content/.generated/products.json
// Pulls the full live catalog at build time so /shop mirrors the storefront
// instead of a hand-maintained list. Falls back silently when env vars or
// network are missing, keeping the previously generated JSON in place.
import { join } from "node:path";
import type { Product } from "../content/shop";
import { requireEnv, safeFetch, writeJson } from "./_sync-helpers";

const OUT_PATH = join(process.cwd(), "content", ".generated", "products.json");

// Open API returns up to 100 results per page. We walk pages until one comes
// back short or stops adding new ids, so the whole catalog lands regardless of
// size. The hard cap is a safety net against an API that ignores pagination.
const PAGE_SIZE = 100;
const MAX_PAGES = 20;

type FourthwallProduct = {
  id: string;
  name: string;
  slug: string;
  state?: { type?: string };
  variants?: Array<{
    unitPrice?: { value: number; currency: string };
  }>;
  images?: Array<{ url: string }>;
};

type FourthwallListResponse = {
  results: FourthwallProduct[];
};

function formatPrice(value: number, currency: string): string {
  if (currency === "USD") return `$${value.toFixed(2)}`;
  return `${value.toFixed(2)} ${currency}`;
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
  const apiBase = env.FOURTHWALL_API_BASE_URL.replace(/\/$/, "");

  // Collect by id so a duplicated page (API ignoring `page`) ends the loop
  // instead of looping forever.
  const byId = new Map<string, FourthwallProduct>();
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const url = `${apiBase}/products?limit=${PAGE_SIZE}&page=${page}`;
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

    // Stop on a short page, an empty page, or a page that added nothing new.
    if (results.length < PAGE_SIZE || byId.size === before) break;
    if (byId.size >= cap) break;
  }

  const storeBase =
    process.env.NEXT_PUBLIC_FW_STORE_URL ??
    "https://stoned-goose-productions-zgm-shop.fourthwall.com";

  const products: Product[] = Array.from(byId.values())
    .filter((p) => p.state?.type === "AVAILABLE")
    // Skip imageless products so the on-page count matches what renders.
    .filter((p) => Boolean(p.images?.[0]?.url))
    .slice(0, cap === Infinity ? undefined : cap)
    .map((p) => {
      const price = p.variants?.[0]?.unitPrice;
      return {
        name: p.name,
        price: price ? formatPrice(price.value, price.currency) : "",
        url: `${storeBase}/products/${p.slug}`,
        image: p.images![0]!.url,
        imageAlt: p.name,
      };
    });

  writeJson(OUT_PATH, products);
  console.log(`[sync:fourthwall] wrote ${products.length} products`);
}

main();
