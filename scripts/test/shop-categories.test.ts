// Guards the /shop taxonomy.
//
// Categories are half CMS data (Shop copy > Product categories) and half
// keyword rules in content/shop.ts, which is two places for them to disagree.
// A category typed into the CMS that is not in SHOP_CATEGORIES is dropped
// silently and the product falls through to Accessories, so the mistake shows
// up as a quietly misfiled item rather than an error. This test makes it an
// error, and pins the keyword rules to the words they are meant to carry.
//
// Run via `npm test`.

import {
  SHOP_CATEGORIES,
  categorize,
  products,
  productsByCategory,
  shopCopy,
  type Product,
  type ShopCategory,
} from "../../content/shop";

let failures = 0;

function assert(cond: boolean, message: string) {
  if (cond) return;
  failures += 1;
  console.error(`  ✗ ${message}`);
}

const valid = new Set<string>(SHOP_CATEGORIES);
const assignments = shopCopy.categoryAssignments ?? [];

// Every tag has to name a real category, or it is a no-op the editor cannot see.
for (const a of assignments) {
  assert(Boolean(a.slug), `category assignment with no slug: ${JSON.stringify(a)}`);
  assert(
    valid.has(a.category ?? ""),
    `category assignment "${a.slug}" names "${a.category}", which is not one of ${SHOP_CATEGORIES.join(", ")}`,
  );
}

// One slug, one category. A duplicate means the last row silently wins.
const seen = new Map<string, string>();
for (const a of assignments) {
  const slug = (a.slug ?? "").toLowerCase();
  const previous = seen.get(slug);
  assert(
    previous === undefined,
    `slug "${slug}" is tagged twice (${previous} then ${a.category}). Keep one row.`,
  );
  seen.set(slug, a.category ?? "");
}

// Grouping is lossless, and an empty category never reaches the filter row.
const grouped = productsByCategory(products);
const placed = grouped.reduce((n, g) => n + g.products.length, 0);
assert(
  placed === products.length,
  `productsByCategory placed ${placed} of ${products.length} products`,
);
assert(
  grouped.every((g) => g.products.length > 0),
  "productsByCategory returned an empty category, which renders a filter chip nobody can use",
);

// The keyword fallback, exercised through categorize() on products that carry
// no tag. These are the ambiguous words the rule order exists to settle.
function guess(name: string, description?: string): ShopCategory {
  const product: Product = {
    name,
    // A slug no tag can match, so the keyword rules are what answer.
    slug: `test-fixture-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    price: "",
    url: "",
    image: "",
    description,
  };
  return categorize(product);
}

const cases: Array<[string, ShopCategory]> = [
  ["Goose Tee", "Shirts"],
  ["Goose T-Shirt", "Shirts"],
  ["Goose Tank Top", "Shirts"],
  // The garment wins over the fastener: this is a shirt, not a pin.
  ["Fancy Button Up Goose", "Shirts"],
  ["Logo Hoodie", "Hoodies"],
  // A sweatshirt reads as a Hoodie, not a Shirt, whatever the letters spell.
  ["Goose Crewneck Sweatshirt", "Hoodies"],
  ["Goose Bucket Hat", "Hats"],
  ["Tuque or Something", "Hats"],
  ["Goose Beanie", "Hats"],
  ["Goose Sweatpants", "Pants"],
  ["Goose Joggers", "Pants"],
  ["Goose Sweatshorts", "Shorts"],
  ["Goose Crew Socks", "Socks"],
  ["Portrait Tote", "Bags"],
  ["Goose Backpack", "Bags"],
  ["Goose Mug", "Drinkware"],
  ["Goose Water Bottle", "Drinkware"],
  ["Goose Can Cooler", "Drinkware"],
  ["Live Local Comedy Sticker", "Stickers and Pins"],
  ["Goose Enamel Pin", "Stickers and Pins"],
  ["Buttons", "Stickers and Pins"],
  // Nothing in the name describes a family, so the catch-all.
  ["Liquid Holder", "Accessories"],
  ["Joke Book", "Accessories"],
];

for (const [name, expected] of cases) {
  const actual = guess(name);
  assert(actual === expected, `"${name}" guessed ${actual}, expected ${expected}`);
}

// The description is the second pass, used only when the name says nothing.
assert(
  guess("Booootle", "A 32oz insulated water bottle with a screw cap.") === "Drinkware",
  "a nonsense name with drinkware copy should read as Drinkware",
);
// And it never overrides a name that already spoke.
assert(
  guess("Sick Hat", "Printed on the same heavy cotton as our t-shirts.") === "Hats",
  "vendor copy mentioning t-shirts should not move a hat into Shirts",
);

if (failures > 0) {
  console.error(`shop-categories test: ${failures} failure(s).`);
  process.exit(1);
}
console.log(
  `shop-categories test: ${assignments.length} tags valid, ${products.length} products filed across ${grouped.length} categories, ${cases.length + 2} keyword cases pass.`,
);
