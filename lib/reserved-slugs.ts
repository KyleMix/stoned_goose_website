// Slugs that the editor cannot use for a /[slug] page because Next.js or
// the static export already owns the route. Keep this list in sync with:
//   - app/(site)/<route>/ folders
//   - vercel.json rewrites
//   - public/ filenames that ship to the site root
//
// Used in two places:
//   - public/admin/config.yml restricts the Pages slug via a pattern so the
//     editor steers away from reserved names.
//   - app/(site)/[slug]/page.tsx asserts at build time as a defence in depth
//     for any entry that slipped through (e.g. created on an older schema).

export const RESERVED_SLUGS: readonly string[] = [
  // Hard-coded top-level routes under app/(site)
  "shows",
  "watch",
  "roster",
  "open-mics",
  "book",
  "contact",
  "shop",
  // Admin + framework
  "keystatic",
  "admin",
  "api",
  "_next",
  // Files emitted at the site root
  "feed.xml",
  "feed.ics",
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
  "manifest.webmanifest",
  "opengraph-image",
  "twitter-image",
  "pagefind",
  // Treat "home" as reserved; the root path is owned by app/(site)/page.tsx
  "home",
  "index",
];

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}

export const RESERVED_SLUG_ERROR = `That slug is reserved by an existing route. Try a different one.`;
