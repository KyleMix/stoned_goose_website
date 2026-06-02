// Shared types + normalisation for the page-block system.
//
// Two on-disk shapes are accepted so the data survives the CMS migration:
//   - Sveltia / Decap variable-type lists write each block flat, with the
//     type under a `type` key: { type: "hero", headline: "...", ... }.
//   - The previous editor wrote each block as { discriminant: "<type>",
//     value: {...} }. Older entries still parse.
// The shim layer reads the JSON, normalises optional fields, and returns a
// typed Block union for the section renderer to switch over.

export type HeroBlock = {
  type: "hero";
  eyebrow: string;
  headline: string;
  italicLine: string;
  subhead: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

export type RichTextBlock = {
  type: "richText";
  eyebrow: string;
  heading: string;
  body: string;
};

export type ImageCaptionBlock = {
  type: "imageCaption";
  image: string;
  alt: string;
  caption: string;
  aspect: "16x9" | "4x5" | "1x1";
};

export type VideoEmbedBlock = {
  type: "videoEmbed";
  provider: "youtube" | "tiktok" | "instagram";
  url: string;
  caption: string;
};

export type CtaStripBlock = {
  type: "ctaStrip";
  heading: string;
  subhead: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  note: string;
};

export type MailingListBlock = {
  type: "mailingList";
  tag: string;
};

export type UpcomingShowsBlockData = { type: "upcomingShows" };
export type LatestSocialBlock = { type: "latestSocial"; limit: number };
export type PressStripBlock = { type: "pressStrip" };
export type RosterTeaserBlock = { type: "rosterTeaser"; limit: number };
export type OpenMicTeaserBlock = { type: "openMicTeaser" };
export type ServicesOverviewBlock = { type: "servicesOverview" };
export type ShopStripBlock = { type: "shopStrip"; limit: number };

export type Block =
  | HeroBlock
  | RichTextBlock
  | ImageCaptionBlock
  | VideoEmbedBlock
  | CtaStripBlock
  | MailingListBlock
  | UpcomingShowsBlockData
  | LatestSocialBlock
  | PressStripBlock
  | RosterTeaserBlock
  | OpenMicTeaserBlock
  | ServicesOverviewBlock
  | ShopStripBlock;

// Raw shapes accepted. Flat: { type, ...fields } (Sveltia/Decap). Legacy:
// { discriminant, value } where value is the per-type field object.
type RawBlock = {
  type?: string;
  discriminant?: string;
  value?: unknown;
  [key: string]: unknown;
};

function s(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function n(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function normaliseBlocks(raw: unknown): Block[] {
  if (!Array.isArray(raw)) return [];
  const out: Block[] = [];
  for (const item of raw as RawBlock[]) {
    if (!item || typeof item !== "object") continue;
    // Flat shape keeps fields as siblings of `type`; legacy shape nests them
    // under `value` with the type in `discriminant`.
    let d: string | undefined;
    let v: Record<string, unknown>;
    if (typeof item.type === "string") {
      d = item.type;
      v = item as Record<string, unknown>;
    } else if (typeof item.discriminant === "string") {
      d = item.discriminant;
      v = (item.value ?? {}) as Record<string, unknown>;
    } else {
      continue;
    }
    switch (d) {
      case "hero":
        out.push({
          type: "hero",
          eyebrow: s(v.eyebrow),
          headline: s(v.headline),
          italicLine: s(v.italicLine),
          subhead: s(v.subhead),
          primaryCtaLabel: s(v.primaryCtaLabel),
          primaryCtaHref: s(v.primaryCtaHref),
          secondaryCtaLabel: s(v.secondaryCtaLabel),
          secondaryCtaHref: s(v.secondaryCtaHref),
        });
        break;
      case "richText":
        out.push({
          type: "richText",
          eyebrow: s(v.eyebrow),
          heading: s(v.heading),
          body: s(v.body),
        });
        break;
      case "imageCaption":
        out.push({
          type: "imageCaption",
          image: s(v.image),
          alt: s(v.alt),
          caption: s(v.caption),
          aspect: (s(v.aspect, "16x9") as "16x9" | "4x5" | "1x1") || "16x9",
        });
        break;
      case "videoEmbed":
        out.push({
          type: "videoEmbed",
          provider: (s(v.provider, "youtube") as "youtube" | "tiktok" | "instagram") || "youtube",
          url: s(v.url),
          caption: s(v.caption),
        });
        break;
      case "ctaStrip":
        out.push({
          type: "ctaStrip",
          heading: s(v.heading),
          subhead: s(v.subhead),
          primaryCtaLabel: s(v.primaryCtaLabel),
          primaryCtaHref: s(v.primaryCtaHref),
          note: s(v.note),
        });
        break;
      case "mailingList":
        out.push({ type: "mailingList", tag: s(v.tag, "page") });
        break;
      case "upcomingShows":
        out.push({ type: "upcomingShows" });
        break;
      case "latestSocial":
        out.push({ type: "latestSocial", limit: n(v.limit, 6) });
        break;
      case "pressStrip":
        out.push({ type: "pressStrip" });
        break;
      case "rosterTeaser":
        out.push({ type: "rosterTeaser", limit: n(v.limit, 8) });
        break;
      case "openMicTeaser":
        out.push({ type: "openMicTeaser" });
        break;
      case "servicesOverview":
        out.push({ type: "servicesOverview" });
        break;
      case "shopStrip":
        out.push({ type: "shopStrip", limit: n(v.limit, 3) });
        break;
      default:
        // Unknown discriminant. Likely a schema change ahead of a deploy.
        // Skip silently so the page still renders.
        break;
    }
  }
  return out;
}
