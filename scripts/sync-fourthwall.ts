// Fourthwall Open API -> content/.generated/products.json
// Drops the manual TODO list of imageless products by pulling fresh imgproxy
// URLs at build time. Falls back silently when env vars or network are missing.
import { join } from "node:path";
import type { Product } from "../content/shop";
import { requireEnv, safeFetch, writeJson } from "./_sync-helpers";

const OUT_PATH = join(process.cwd(), "content", ".generated", "products.json");

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

  const limit = Math.min(
    Math.max(parseInt(process.env.FOURTHWALL_PRODUCT_LIMIT ?? "24", 10), 1),
    100,
  );

  const auth = Buffer.from(
    `${env.FOURTHWALL_API_USERNAME}:${env.FOURTHWALL_API_PASSWORD}`,
  ).toString("base64");

  const url = `${env.FOURTHWALL_API_BASE_URL.replace(/\/$/, "")}/products?limit=${limit}`;
  const data = (await safeFetch(url, {
    headers: { Authorization: `Basic ${auth}` },
  })) as FourthwallListResponse | null;
  if (!data) {
    console.log("[sync:fourthwall] request failed. keeping existing JSON.");
    return;
  }

  const storeBase =
    process.env.NEXT_PUBLIC_FW_STORE_URL ??
    "https://stoned-goose-productions-zgm-shop.fourthwall.com";

  const products: Product[] = data.results
    .filter((p) => p.state?.type === "AVAILABLE")
    .map((p) => {
      const price = p.variants?.[0]?.unitPrice;
      return {
        name: p.name,
        price: price ? formatPrice(price.value, price.currency) : "",
        url: `${storeBase}/products/${p.slug}`,
        image: p.images?.[0]?.url ?? "",
      };
    });

  writeJson(OUT_PATH, products);
  console.log(`[sync:fourthwall] wrote ${products.length} products`);
}

main();
