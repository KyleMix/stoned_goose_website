// Services + pricing tiers shim. Reads:
//   - content/.generated/services-index.json (collection consolidated at prebuild)
//   - content/.generated/pricing-tiers-index.json
//
// Services keep the editorial order via an explicit list. Pricing tiers
// follow the Starter / Pro / Premium order.

import servicesIndex from "./.generated/services-index.json";
import tiersIndex from "./.generated/pricing-tiers-index.json";

export type Service = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  whatYouGet: string[];
  idealFor: string[];
  process: string[];
  pricing: string;
  faqs: { q: string; a: string }[];
  draft?: boolean;
};

const SERVICE_ORDER = [
  "live-show-production",
  "film-your-comedy-set",
  "media-and-podcasts",
  "collaboration",
];

const TIER_ORDER = ["starter", "pro", "premium"];

function orderBy<T extends { slug: string }>(items: T[], order: string[]): T[] {
  const map = new Map(items.map((i) => [i.slug, i]));
  const out: T[] = [];
  for (const slug of order) {
    const item = map.get(slug);
    if (item) out.push(item);
  }
  for (const item of items) {
    if (!order.includes(item.slug)) out.push(item);
  }
  return out;
}

type RawService = {
  slug?: string;
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  summary?: string;
  whatYouGet?: string[];
  idealFor?: string[];
  process?: string[];
  pricing?: string;
  faqs?: { q: string; a: string }[];
  draft?: boolean;
};

const raw = servicesIndex as RawService[];
const shaped: Service[] = raw.map((s) => ({
  slug: s.slug ?? "",
  title: s.title ?? "",
  metaTitle: s.metaTitle ?? "",
  metaDescription: s.metaDescription ?? "",
  summary: s.summary ?? "",
  whatYouGet: s.whatYouGet ?? [],
  idealFor: s.idealFor ?? [],
  process: s.process ?? [],
  pricing: s.pricing ?? "",
  faqs: s.faqs ?? [],
  draft: Boolean(s.draft),
}));

export const services: Service[] = orderBy(shaped, SERVICE_ORDER);

type RawTier = {
  slug?: string;
  bestFor?: string;
  price?: string;
  items?: string[];
};

type Tier = {
  slug: string;
  name: string;
  bestFor: string;
  price: string;
  items: string[];
};

const tierShaped: Tier[] = (tiersIndex as RawTier[]).map((t) => ({
  slug: t.slug ?? "",
  name: (t.slug ?? "").replace(/\b\w/g, (c) => c.toUpperCase()),
  bestFor: t.bestFor ?? "",
  price: t.price ?? "",
  items: t.items ?? [],
}));

export const pricingTiers = orderBy(tierShaped, TIER_ORDER).map(({ slug: _slug, ...rest }) => rest);
