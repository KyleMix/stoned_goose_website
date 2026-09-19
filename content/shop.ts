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

// Fixed display order for the /shop filter row. Apparel head to toe, then the
// non-apparel families, then the catch-all. Accessories stays last: anything
// that matches nothing lands there, so it must not sit between two real
// categories.
//
// Plain retail words only, and the garment a shopper would name. "Shirts" and
// "Hoodies" beat one "Tops" chip holding both, because nobody shops for a top.
export const SHOP_CATEGORIES = [
  "Shirts",
  "Hoodies",
  "Hats",
  "Pants",
  "Shorts",
  "Socks",
  "Bags",
  "Drinkware",
  "Stickers and Pins",
  "Accessories",
] as const;
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

// Keyword rules for products nobody has tagged yet, in precedence order.
// Precedence carries the ambiguous words: a sweatshirt is a Hoodie rather than
// a Shirt, and a bottle whose copy mentions a screw cap is Drinkware rather
// than a hat. Accessories is the fallback, so no rule describes it.
//
// Most of this catalog is named in goose puns ("Booootle", "Shoe Underwear"),
// which no keyword can read. Those are tagged in the CMS. These rules are the
// safety net for the next product nobody tags.
const AUTO_RULES: ReadonlyArray<{ category: ShopCategory; test: RegExp }> = [
  {
    category: "Drinkware",
    test: /(bottle|\bmugs?\b|tumbler|can\s?(cooler|holder)|koozie|coozie|\bcups?\b|\bglass(es)?\b|flask|thermos|drinkware)/,
  },
  { category: "Socks", test: /\bsocks?\b/ },
  {
    category: "Bags",
    test: /(\btotes?\b|\bbags?\b|backpack|\bduffel\b|fanny\s?pack|\bpouch\b)/,
  },
  {
    category: "Hoodies",
    test: /(hoodie|hooded|sweatshirt|crew\s?neck|pullover|zip\s?up|fleece|\bjacket\b)/,
  },
  {
    category: "Shirts",
    test: /(t-?shirts?|\btees?\b|\btanks?\b|\bshirts?\b|jersey|long\s?sleeve|flannel|button\s?(up|down)|\bpolo\b)/,
  },
  { category: "Shorts", test: /(sweatshorts|boardshorts|\bshorts\b|\btrunks\b)/ },
  {
    category: "Pants",
    test: /(jogger|sweatpant|\bpants?\b|leggings|trousers)/,
  },
  {
    category: "Hats",
    test: /\b(hats?|caps?|beanies?|beanie|snapback|trucker|bucket|visor|tuque|toque)\b/,
  },
  {
    category: "Stickers and Pins",
    test: /(sticker|sticky|decal|\bpins?\b|\bbuttons?\b|\bpatch(es)?\b)/,
  },
];

function matchRules(text: string): ShopCategory | null {
  const t = text.toLowerCase();
  for (const rule of AUTO_RULES) if (rule.test.test(t)) return rule.category;
  return null;
}

// Guess from the product name first, and only fall back to the description
// when the name says nothing. A name is deliberate; a description is boilerplate
// the print vendor wrote, so "Sick Hat" must not be re-read as a Shirt because
// its copy mentions the tee it matches.
function autoCategory(name: string, description?: string): ShopCategory | null {
  return matchRules(name) ?? (description ? matchRules(description) : null);
}

// The Fourthwall slug in a product URL is not always the slug the entry is
// filed under: the CMS derives its folder name from the product name, so
// "80's Goose" files as 80-s-goose while Fourthwall serves it at 80s-goose.
// A category tagged against either spelling has to find the product.
function urlSlug(url: string): string {
  const match = url.match(/\/products\/([^/?#]+)/);
  return match ? match[1].toLowerCase() : "";
}

export function categorize(product: Product): ShopCategory {
  return (
    assignmentMap.get(product.slug.toLowerCase()) ??
    assignmentMap.get(urlSlug(product.url)) ??
    autoCategory(product.name, product.description) ??
    "Accessories"
  );
}

// A product is sold out only when the sync gave us variants and every one of
// them is unavailable. Manual entries carry no variants, so they never claim
// stock they cannot know about.
export function isSoldOut(product: Product): boolean {
  const variants = product.variants ?? [];
  return variants.length > 0 && variants.every((v) => !v.available);
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
    // A slug loses the apostrophe but keeps the split: "Brendan's Fart Hat"
    // files as brendan-s-fart-hat. A lone "s" after a word is that apostrophe,
    // so put it back rather than printing "Brendan S Fart Hat".
    .reduce<string[]>((words, part) => {
      if (part.toLowerCase() === "s" && words.length > 0) {
        words[words.length - 1] += "'s";
        return words;
      }
      words.push(part);
      return words;
    }, [])
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

const manualProducts: Product[] = (manualIndex as unknown as RawProduct[])
  .filter((p) => p.draft !== true)
  .map(normalise);

const fromGeneratedProducts =
  Array.isArray(generatedProducts) && generatedProducts.length > 0
    ? (generatedProducts as unknown as RawProduct[]).map(normalise)
    : null;

export const products: Product[] = fromGeneratedProducts ?? manualProducts;

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
