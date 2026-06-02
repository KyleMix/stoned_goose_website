// Build-time consolidator. Reads each CMS-managed collection directory
// and emits one flat JSON file at content/.generated/<collection>.json so the
// .ts shims can import the data without touching node:fs (which webpack
// refuses to bundle into client components).
//
// Runs in prebuild so CMS commits land in /content, this script
// rebuilds the indexes, then next build picks up the JSON.

import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "content", ".generated");

mkdirSync(OUT_DIR, { recursive: true });

type Collection = {
  dir: string;
  outFile: string;
  /** When set, the slug becomes a field on each entry under this key. */
  slugField?: string;
};

const COLLECTIONS: Collection[] = [
  { dir: "content/comedians", outFile: "comedians-index.json", slugField: "slug" },
  { dir: "content/members", outFile: "members-index.json", slugField: "slug" },
  { dir: "content/services", outFile: "services-index.json", slugField: "slug" },
  { dir: "content/pricing-tiers", outFile: "pricing-tiers-index.json", slugField: "slug" },
  { dir: "content/shows", outFile: "shows-index.json", slugField: "id" },
  { dir: "content/shop-products", outFile: "shop-products-index.json", slugField: "slug" },
  { dir: "content/open-mics", outFile: "open-mics-index.json", slugField: "id" },
  { dir: "content/tiktok", outFile: "tiktok-index.json", slugField: "slug" },
  { dir: "content/pages", outFile: "pages-index.json", slugField: "slug" },
];

let total = 0;

for (const col of COLLECTIONS) {
  const dir = join(ROOT, col.dir);
  const entries: Array<Record<string, unknown>> = [];
  if (existsSync(dir)) {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      // Entries are stored either as `<slug>/index.json` (directory mode,
      // used when an asset like an image lands alongside the entry) or as a
      // flat `<slug>.json` file. Accept both so a manual show saved without
      // a poster still gets indexed.
      let entryPath: string | null = null;
      let slug: string | null = null;
      if (item.isDirectory()) {
        const indexPath = join(dir, item.name, "index.json");
        if (existsSync(indexPath)) {
          entryPath = indexPath;
          slug = item.name;
        }
      } else if (item.isFile() && item.name.endsWith(".json")) {
        entryPath = join(dir, item.name);
        slug = item.name.replace(/\.json$/, "");
      }
      if (!entryPath || !slug) continue;
      const data = JSON.parse(readFileSync(entryPath, "utf8")) as Record<string, unknown>;
      if (col.slugField) data[col.slugField] = slug;
      entries.push(data);
    }
  }
  const outPath = join(OUT_DIR, col.outFile);
  writeFileSync(outPath, JSON.stringify(entries, null, 2) + "\n", "utf8");
  total += entries.length;
  console.log(`[content-index] ${col.dir}: ${entries.length} entries -> ${col.outFile}`);
}

// News uses markdoc format with frontmatter; consolidating it here mirrors
// the inline reader in content/news.ts but stays bundler-safe.
const newsDir = join(ROOT, "content", "news");
const newsEntries: Array<{
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string;
  image?: string;
  imageAlt?: string;
  tags?: string[];
  featured?: boolean;
  draft?: boolean;
}> = [];
if (existsSync(newsDir)) {
  for (const item of readdirSync(newsDir, { withFileTypes: true })) {
    if (item.name === ".gitkeep") continue;
    let raw: string | null = null;
    let slug: string;
    if (item.isDirectory()) {
      const indexPath = join(newsDir, item.name, "index.mdoc");
      if (!existsSync(indexPath)) continue;
      raw = readFileSync(indexPath, "utf8");
      slug = item.name;
    } else if (item.name.endsWith(".mdoc")) {
      raw = readFileSync(join(newsDir, item.name), "utf8");
      slug = item.name.replace(/\.mdoc$/, "");
    } else {
      continue;
    }
    const fm = parseFrontmatter(raw);
    newsEntries.push({
      slug,
      title: String(fm.data.title ?? slug),
      date: String(fm.data.date ?? ""),
      summary: String(fm.data.summary ?? ""),
      body: fm.body,
      image: fm.data.image ? String(fm.data.image) : undefined,
      imageAlt: fm.data.imageAlt ? String(fm.data.imageAlt) : undefined,
      tags: Array.isArray(fm.data.tags) ? (fm.data.tags as string[]) : undefined,
      featured: fm.data.featured === true || fm.data.featured === "true",
      draft: fm.data.draft === true || fm.data.draft === "true",
    });
  }
}
newsEntries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
writeFileSync(
  join(OUT_DIR, "news-index.json"),
  JSON.stringify(newsEntries, null, 2) + "\n",
  "utf8",
);
total += newsEntries.length;
console.log(`[content-index] content/news: ${newsEntries.length} entries -> news-index.json`);

console.log(`[content-index] total ${total} entries indexed.`);

function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  body: string;
} {
  if (!raw.startsWith("---")) return { data: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: raw };
  const block = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\n/, "");
  const data: Record<string, unknown> = {};
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    const [, key, rest] = m;
    const t = rest.trim();
    if (t.startsWith("[") && t.endsWith("]")) {
      data[key] = t.slice(1, -1).split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
    } else {
      data[key] = t.replace(/^['"]|['"]$/g, "");
    }
  }
  return { data, body };
}
