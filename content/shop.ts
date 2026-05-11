// Shop shim. Reads:
//   - content/shop-copy/index.json (singleton)
//   - content/.generated/shop-products-index.json (manual products)
//   - content/.generated/products.json (sync:fourthwall output)
//
// Generated products win when present. Manual entries flagged as draft are
// filtered out so unfinished listings stay off /shop.

import shopCopyData from "./shop-copy/index.json";
import generatedProducts from "./.generated/products.json";
import manualIndex from "./.generated/shop-products-index.json";

export type Product = {
  name: string;
  price: string;
  url: string;
  image: string;
  imageAlt?: string;
};

type ShopCopy = {
  heading: string;
  subhead: string;
  collectionUrl: string;
  storeUrl: string;
};

export const shopCopy = shopCopyData as ShopCopy;

type RawProduct = {
  slug?: string;
  name?: string;
  price?: string;
  url?: string;
  image?: string;
  imageAlt?: string;
  draft?: boolean;
};

function titleCase(slug: string): string {
  const minor = /^(of|and|the|for|to|a|an|in|on|at|by|with|or|up)$/i;
  return slug
    .split(/[-\s]+/)
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i > 0 && minor.test(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

const manualProducts: Product[] = (manualIndex as RawProduct[])
  .filter((p) => p.draft !== true)
  .map((p) => ({
    name: p.name ?? titleCase(p.slug ?? ""),
    price: p.price ?? "",
    url: p.url ?? "",
    image: p.image ?? "",
    imageAlt: p.imageAlt && p.imageAlt.length > 0 ? p.imageAlt : undefined,
  }));

const fromGeneratedProducts =
  Array.isArray(generatedProducts) && generatedProducts.length > 0
    ? (generatedProducts as Product[])
    : null;

export const products: Product[] = fromGeneratedProducts ?? manualProducts;
