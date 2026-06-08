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

export type ProductImage = {
  url: string;
  width?: number;
  height?: number;
};

// A buyable variant. `id` is the Fourthwall Storefront variant id the cart
// API needs. Manual / Open-API products have no variants, so the product page
// falls back to an outbound Fourthwall link for those.
export type ProductVariant = {
  id: string;
  name: string;
  price: string;
  size?: string;
  color?: string;
  colorSwatch?: string;
  available: boolean;
  images?: string[];
};

export type Product = {
  name: string;
  slug: string;
  price: string;
  url: string;
  image: string;
  imageAlt?: string;
  images?: ProductImage[];
  description?: string;
  variants?: ProductVariant[];
};

type ShopCopy = {
  heading: string;
  subhead: string;
  collectionUrl: string;
  storeUrl: string;
  categoryAssignments?: Array<{ slug?: string; category?: string }>;
};

export const shopCopy = shopCopyData as ShopCopy;

// Fixed display order for the stacked /shop sections.
export const SHOP_CATEGORIES = ["Hats", "Tops", "Bottoms", "Accessories"] as const;
export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

// Manual slug -> category map, edited in the CMS (Shop copy > Category
// assignments). Manual tags always win; untagged products fall back to a
// keyword guess so the page is never left unsorted while tagging.
const assignmentMap = new Map<string, ShopCategory>();
for (const a of shopCopy.categoryAssignments ?? []) {
  if (a.slug && (SHOP_CATEGORIES as readonly string[]).includes(a.category ?? "")) {
    assignmentMap.set(a.slug.toLowerCase(), a.category as ShopCategory);
  }
}

function autoCategory(name: string): ShopCategory | null {
  const n = name.toLowerCase();
  if (/\b(hat|cap|beanie|snapback|trucker|bucket|visor)\b/.test(n)) return "Hats";
  if (
    /(hoodie|sweatshirt|crew\s?neck|t-?shirt|\btee\b|\btank\b|jacket|long\s?sleeve|jersey|pullover|\btop\b)/.test(n)
  )
    return "Tops";
  if (/(jogger|sweatpant|sweatshort|\bshorts?\b|\bpants?\b|leggings|\bbottoms?\b)/.test(n))
    return "Bottoms";
  return null;
}

export function categorize(product: Product): ShopCategory {
  return (
    assignmentMap.get(product.slug.toLowerCase()) ??
    autoCategory(product.name) ??
    "Accessories"
  );
}

// Group products into the fixed category order, dropping empty sections.
export function productsByCategory(
  items: Product[],
): Array<{ category: ShopCategory; products: Product[] }> {
  const groups = new Map<ShopCategory, Product[]>();
  for (const c of SHOP_CATEGORIES) groups.set(c, []);
  for (const p of items) groups.get(categorize(p))!.push(p);
  return SHOP_CATEGORIES.map((category) => ({
    category,
    products: groups.get(category)!,
  })).filter((g) => g.products.length > 0);
}

type RawProduct = {
  slug?: string;
  name?: string;
  price?: string;
  url?: string;
  image?: string;
  imageAlt?: string;
  description?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalise(p: RawProduct): Product {
  const name = p.name ?? titleCase(p.slug ?? "");
  return {
    name,
    slug: p.slug && p.slug.length > 0 ? p.slug : slugify(name),
    price: p.price ?? "",
    url: p.url ?? "",
    image: p.image ?? p.images?.[0]?.url ?? "",
    imageAlt: p.imageAlt && p.imageAlt.length > 0 ? p.imageAlt : undefined,
    images: p.images && p.images.length > 0 ? p.images : undefined,
    description: p.description && p.description.length > 0 ? p.description : undefined,
    variants: p.variants && p.variants.length > 0 ? p.variants : undefined,
  };
}

const manualProducts: Product[] = (manualIndex as RawProduct[])
  .filter((p) => p.draft !== true)
  .map(normalise);

const fromGeneratedProducts =
  Array.isArray(generatedProducts) && generatedProducts.length > 0
    ? (generatedProducts as RawProduct[]).map(normalise)
    : null;

export const products: Product[] = fromGeneratedProducts ?? manualProducts;

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
