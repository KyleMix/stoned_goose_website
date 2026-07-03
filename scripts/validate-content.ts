// Build-side content validation. Parses every CMS-managed file under
// content/ against a zod schema mirroring public/admin/config.yml, so a bad
// commit (hand edit, bad merge, CMS regression) fails the deploy instead of
// shipping a broken page.
//
// Scope: CMS sources only. content/.generated (sync output) and
// content/feeds (fetched feeds) are machine-written and validated by their
// own scripts.
//
// Run: npm run content:validate (wired into prebuild).

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { z } from "zod";
import { isReservedSlug } from "../lib/reserved-slugs";

const ROOT = process.cwd();
const errors: string[] = [];

function fail(file: string, message: string) {
  errors.push(`${relative(ROOT, file)}: ${message}`);
}

// ---------------------------------------------------------------- helpers

// Optional CMS fields arrive as null, "" or are absent. `opt` wraps a schema
// so all three pass; the inner schema only runs on real values.
function opt<T extends z.ZodTypeAny>(schema: T) {
  return z.union([schema, z.literal(""), z.null(), z.undefined()]);
}

const httpsUrl = z
  .string()
  .regex(/^https:\/\/\S+$/, "must be a full https:// address");

// Internal path (/shows), anchor (#sponsors), https URL, mailto or tel link.
const href = z
  .string()
  .regex(
    /^(\/\S*|#\S+|https:\/\/\S+|mailto:\S+|tel:\S+)$/,
    "must start with / for site pages or https:// for outside links",
  );

const videoUrlOrId = z
  .string()
  .regex(
    /^(https:\/\/\S+|[A-Za-z0-9_-]{11})$/,
    "must be a full https:// video link or an 11-character YouTube id",
  );

const parseableDate = z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
  message: "must be a date the site can parse (the CMS date picker writes these)",
});

const bool = z.boolean();
const str = z.string();

const navLink = z.object({ label: str, href }).strict();

// The block library (topSections / bottomSections / pages.sections).
// normaliseBlocks defaults every field, so only shape basics are enforced.
const BLOCK_TYPES = [
  "hero",
  "richText",
  "imageCaption",
  "videoEmbed",
  "ctaStrip",
  "mailingList",
  "upcomingShows",
  "latestSocial",
  "pressStrip",
  "rosterTeaser",
  "openMicTeaser",
  "servicesOverview",
  "shopStrip",
] as const;

const block = z
  .object({ type: z.enum(BLOCK_TYPES) })
  .passthrough();
const blocks = opt(z.array(block));

const NO_EM_DASH_DIRS_EXCLUDED = [".generated", "feeds"];

// ---------------------------------------------------------------- schemas

const bumperList = opt(
  z.array(z.object({ eyebrow: str, body: str, footnote: opt(str) }).strict()),
);

const singletons: Record<string, z.ZodTypeAny> = {
  "home/index.json": z
    .object({
      hero: z
        .object({
          eyebrow: opt(str),
          italicLine: opt(str),
          headline: str.min(1),
          subhead: opt(str),
          primary: z
            .object({ title: opt(str), body: opt(str), label: opt(str), href: opt(href) })
            .strict(),
          secondary: z
            .object({ title: opt(str), body: opt(str), label: opt(str), href: opt(href) })
            .strict(),
          tertiary: opt(z.array(navLink)),
        })
        .strict(),
      marqueeWords: opt(z.array(str)),
      bumpers: z
        .object({ clarification: bumperList, aside: bumperList, outro: bumperList })
        .strict(),
      mission: opt(
        z
          .object({ show: opt(bool), eyebrow: opt(str), heading: opt(str), body: opt(str) })
          .strict(),
      ),
      topSections: blocks,
      bottomSections: blocks,
    })
    .strict(),

  "site/index.json": z
    .object({
      name: str.min(1),
      shortName: str.min(1),
      tagline: opt(str),
      url: opt(httpsUrl),
      description: str.min(1),
      contact: z
        .object({
          email: str.regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "must be an email address"),
          phone: opt(str),
          phoneTel: opt(str.regex(/^\+[0-9]{7,15}$/, "must be digits with a leading +, e.g. +13605550123")),
          whatsapp: opt(str.regex(/^[0-9]{7,15}$/, "must be digits only, no plus")),
          smsEnabled: opt(bool),
          address: opt(str),
          locality: opt(str),
          region: opt(str),
        })
        .strict(),
      social: z
        .object({
          instagram: opt(httpsUrl),
          facebook: opt(httpsUrl),
          tiktok: opt(httpsUrl),
          youtube: opt(httpsUrl),
          patreon: opt(httpsUrl),
          eventbrite: opt(httpsUrl),
          fourthwall: opt(httpsUrl),
          youtubeChannelId: opt(str),
          facebookPageId: opt(str),
        })
        .strict(),
      podcasts: opt(
        z
          .object({ spotifyShowId: opt(str), applePodcastsId: opt(str), rssUrl: opt(httpsUrl) })
          .strict(),
      ),
      booking: opt(z.object({ calLink: opt(str) }).strict()),
      serviceAreas: opt(z.array(str)),
      press: opt(z.array(z.object({ quote: str, outlet: str, url: opt(httpsUrl) }).strict())),
      nav: opt(z.array(navLink)),
      footer: opt(
        z
          .object({
            locality: opt(str),
            creditLine: opt(str),
            creditHref: opt(href),
            columns: opt(z.array(z.object({ heading: str, items: z.array(navLink) }).strict())),
          })
          .strict(),
      ),
      seo: opt(
        z.object({ keywords: opt(z.array(str)), defaultOgImage: opt(str) }).strict(),
      ),
    })
    .strict(),

  "shows-copy/index.json": z
    .object({
      heading: str.min(1),
      subhead: opt(str),
      emptyState: opt(str),
      featuredSpecial: opt(
        z
          .object({
            title: opt(str),
            subtitle: opt(str),
            blurb: opt(str),
            videoUrl: opt(videoUrlOrId),
            poster: opt(str),
            posterAlt: opt(str),
            comedianHandle: opt(httpsUrl),
          })
          .strict(),
      ),
      presale: opt(
        z
          .object({
            active: opt(bool),
            code: opt(str),
            expiresAt: opt(parseableDate),
            venueName: opt(str),
          })
          .strict(),
      ),
      topSections: blocks,
      bottomSections: blocks,
    })
    .strict(),

  "watch-copy/index.json": z
    .object({
      heading: str.min(1),
      subhead: opt(str),
      emptyClipsLine: opt(str),
      youtubeVideos: opt(z.array(z.object({ url: videoUrlOrId, title: str }).strict())),
      topSections: blocks,
      bottomSections: blocks,
    })
    .strict(),

  "roster-copy/index.json": z
    .object({
      comedians: opt(z.object({ subhead: opt(str), kicker: opt(str) }).strict()),
      about: opt(
        z
          .object({
            heading: opt(str),
            subhead: opt(str),
            crewHeading: opt(str),
            crewSubhead: opt(str),
          })
          .strict(),
      ),
      pillars: opt(z.array(z.object({ title: str, body: str }).strict())),
      topSections: blocks,
      bottomSections: blocks,
    })
    .strict(),

  "open-mics-copy/index.json": z
    .object({
      subhead: opt(str),
      kicker: opt(str),
      disclaimer: opt(
        z.object({ eyebrow: opt(str), body: opt(str), footnote: opt(str) }).strict(),
      ),
      topSections: blocks,
      bottomSections: blocks,
    })
    .strict(),

  "shop-copy/index.json": z
    .object({
      heading: str.min(1),
      subhead: opt(str),
      collectionUrl: opt(httpsUrl),
      storeUrl: opt(httpsUrl),
      categoryAssignments: opt(
        z.array(
          z
            .object({
              slug: str,
              category: z.enum(["Hats", "Tops", "Bottoms", "Accessories"]),
            })
            .strict(),
        ),
      ),
    })
    .strict(),

  "contact-copy/index.json": z
    .object({
      eyebrow: opt(str),
      titleLead: opt(str),
      titleEmphasis: opt(str),
      body: opt(str),
      emailLabel: opt(str),
      phoneLabel: opt(str),
      textCtaLabel: opt(str),
      whatsappCtaLabel: opt(str),
      findUsLabel: opt(str),
      form: opt(
        z
          .object({
            submitLabel: opt(str),
            successText: opt(str),
            errorText: opt(str),
            nameLabel: opt(str),
            emailLabel: opt(str),
            messageLabel: opt(str),
            messagePlaceholder: opt(str),
          })
          .strict(),
      ),
    })
    .strict(),

  "sponsorships/index.json": z
    .object({
      stats: opt(z.array(z.object({ label: str, value: opt(str), detail: opt(str) }).strict())),
      tiers: opt(
        z.array(
          z.object({ name: str, price: str, deliverables: z.array(str) }).strict(),
        ),
      ),
    })
    .strict(),

  "pro-clubs/index.json": z
    .object({
      disclaimer: opt(
        z.object({ eyebrow: opt(str), body: opt(str), footnote: opt(str) }).strict(),
      ),
      spotlight: opt(z.array(str)),
      hidden: opt(z.array(str)),
      clubs: z.array(
        z
          .object({
            name: str.min(1),
            slug: str.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be lowercase-with-dashes"),
            city: opt(str),
            website: httpsUrl,
            eventsUrl: httpsUrl,
            platform: z.enum(["seatengine", "tribe"]),
            includeText: opt(str),
            excludeText: opt(z.array(str)),
            logo: opt(str),
            active: opt(bool),
          })
          .strict(),
      ),
    })
    .strict(),
};

const collections: Record<string, z.ZodTypeAny> = {
  comedians: z
    .object({
      name: str.min(1),
      photo: opt(str),
      photoAlt: opt(str),
      instagram: opt(httpsUrl),
      facebook: opt(httpsUrl),
      bio: opt(str),
      reelUrl: opt(httpsUrl),
      credits: opt(z.array(str)),
      draft: opt(bool),
    })
    .strict(),

  members: z
    .object({
      name: str.min(1),
      role: str.min(1),
      index: str.regex(/^\d{2}$/, "display order must be two digits, e.g. 01"),
      photo: opt(str),
      photoAlt: opt(str),
      bio: opt(str),
      draft: opt(bool),
    })
    .strict(),

  services: z
    .object({
      title: str.min(1),
      metaTitle: opt(str),
      metaDescription: opt(str),
      summary: opt(str),
      whatYouGet: opt(z.array(str)),
      idealFor: opt(z.array(str)),
      process: opt(z.array(str)),
      pricing: opt(str),
      faqs: opt(z.array(z.object({ q: str, a: str }).strict())),
      draft: opt(bool),
    })
    .strict(),

  "pricing-tiers": z
    .object({
      name: opt(str),
      bestFor: opt(str),
      price: opt(str),
      items: opt(z.array(str)),
    })
    .strict(),

  shows: z
    .object({
      name: str.min(1),
      start: parseableDate,
      end: opt(parseableDate),
      url: opt(httpsUrl),
      ticketUrl: opt(httpsUrl),
      summary: opt(str),
      imageUrl: opt(str),
      imageAlt: opt(str),
      draft: opt(bool),
      venue: opt(
        z
          .object({
            name: opt(str),
            address: opt(str),
            city: opt(str),
            region: opt(str),
            country: opt(str),
          })
          .strict(),
      ),
      status: opt(z.enum(["ticketed", "free", "tba"])),
      ticketPrice: opt(str),
      doorTime: opt(str),
    })
    .strict(),

  "pro-shows": z
    .object({
      title: str.min(1),
      club: str.min(1),
      start: parseableDate,
      ticketUrl: opt(httpsUrl),
      featured: opt(bool),
      draft: opt(bool),
    })
    .strict(),

  "shop-products": z
    .object({
      name: opt(str),
      price: opt(str),
      url: opt(httpsUrl),
      image: opt(httpsUrl),
      imageAlt: opt(str),
      draft: opt(bool),
    })
    .strict(),

  "open-mics": z
    .object({
      name: str.min(1),
      venue: str.min(1),
      address: opt(str),
      city: str.min(1),
      region: z.enum(["WA", "OR"]),
      lat: opt(z.number()),
      lng: opt(z.number()),
      day: z.enum([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ]),
      frequency: z.enum(["weekly", "biweekly", "monthly"]),
      weeks: opt(z.array(z.enum(["1st", "2nd", "3rd", "4th", "Last"]))),
      time: opt(str),
      host: opt(str),
      // Mirrors classifySignup in lib/open-mics/normalize.ts: a real link, or
      // descriptive instructions (must contain a space so it renders as a
      // note). Bare non-URL tokens render as a broken-link fallback.
      signupUrl: opt(
        z
          .string()
          .regex(
            /^(https?:\/\/\S+|\S+(\s+\S+)+)$/,
            'must be a full https:// link, or plain instructions like "Host makes the list"',
          ),
      ),
      notes: opt(str),
    })
    .strict(),

  tiktok: z
    .object({
      title: str.min(1),
      url: httpsUrl,
      poster: opt(str),
      posterAlt: opt(str),
      draft: opt(bool),
    })
    .strict(),

  pages: z
    .object({
      title: str.min(1),
      seoDescription: opt(str),
      ogImage: opt(str),
      draft: opt(bool),
      sections: blocks,
    })
    .strict(),
};

// ---------------------------------------------------------------- runners

function report(file: string, result: z.ZodSafeParseResult<unknown>) {
  if (result.success) return;
  for (const issue of result.error.issues) {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    fail(file, `${path}: ${issue.message}`);
  }
}

function validateSingletons() {
  for (const [rel, schema] of Object.entries(singletons)) {
    const file = join(ROOT, "content", rel);
    if (!existsSync(file)) {
      fail(file, "file is missing");
      continue;
    }
    try {
      report(file, schema.safeParse(JSON.parse(readFileSync(file, "utf8"))));
    } catch (e) {
      fail(file, `not valid JSON: ${(e as Error).message}`);
    }
  }
}

function collectionEntries(dir: string): Array<{ file: string; slug: string }> {
  const abs = join(ROOT, "content", dir);
  const out: Array<{ file: string; slug: string }> = [];
  if (!existsSync(abs)) return out;
  for (const item of readdirSync(abs, { withFileTypes: true })) {
    if (item.isDirectory()) {
      const index = join(abs, item.name, "index.json");
      if (existsSync(index)) out.push({ file: index, slug: item.name });
    } else if (item.isFile() && item.name.endsWith(".json")) {
      out.push({ file: join(abs, item.name), slug: item.name.replace(/\.json$/, "") });
    }
  }
  return out;
}

function validateCollections() {
  for (const [dir, schema] of Object.entries(collections)) {
    for (const { file, slug } of collectionEntries(dir)) {
      try {
        report(file, schema.safeParse(JSON.parse(readFileSync(file, "utf8"))));
      } catch (e) {
        fail(file, `not valid JSON: ${(e as Error).message}`);
      }
      if (dir === "pages" && isReservedSlug(slug)) {
        fail(file, `page slug "${slug}" is reserved by a built-in route`);
      }
    }
  }
}

// News is markdown with YAML frontmatter; check the fields the cards render.
function validateNews() {
  const dir = join(ROOT, "content", "news");
  if (!existsSync(dir)) return;
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    let file: string | null = null;
    if (item.isDirectory()) {
      const p = join(dir, item.name, "index.md");
      if (existsSync(p)) file = p;
    } else if (item.name.endsWith(".md")) {
      file = join(dir, item.name);
    }
    if (!file) continue;
    const raw = readFileSync(file, "utf8");
    if (!raw.startsWith("---")) {
      fail(file, "missing frontmatter block");
      continue;
    }
    const end = raw.indexOf("\n---", 3);
    const head = end === -1 ? "" : raw.slice(3, end);
    for (const key of ["title", "date", "summary"]) {
      const m = head.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
      if (!m || m[1].trim().replace(/^['"]|['"]$/g, "").length === 0) {
        fail(file, `frontmatter is missing "${key}"`);
      } else if (key === "date") {
        const value = m[1].trim().replace(/^['"]|['"]$/g, "");
        if (Number.isNaN(Date.parse(value))) fail(file, `date "${value}" does not parse`);
      }
    }
  }
}

// House rule: no em dashes anywhere in editable content.
function validateNoEmDashes() {
  const base = join(ROOT, "content");
  const walk = (dir: string) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, item.name);
      if (item.isDirectory()) {
        if (dir === base && NO_EM_DASH_DIRS_EXCLUDED.includes(item.name)) continue;
        walk(p);
      } else if (/\.(json|md|mdoc)$/.test(item.name)) {
        const raw = readFileSync(p, "utf8");
        const at = raw.indexOf("—");
        if (at !== -1) {
          const line = raw.slice(0, at).split("\n").length;
          fail(p, `contains an em dash at line ${line}. House rule: use a period, comma, or colon.`);
        }
      }
    }
  };
  walk(base);
}

validateSingletons();
validateCollections();
validateNews();
validateNoEmDashes();

if (errors.length > 0) {
  console.error(`[content-validate] ${errors.length} problem(s) found:\n`);
  for (const e of errors) console.error("  " + e);
  console.error("\n[content-validate] failing the build so this cannot ship.");
  process.exit(1);
}
console.log("[content-validate] all content files pass.");
