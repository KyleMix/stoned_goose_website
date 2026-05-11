// News posts. Backing store is the Keystatic collection at content/news/*.
// The directory holds one Markdoc file per post: a YAML frontmatter block
// with title, date, summary, image, tags, plus the post body as Markdoc.
//
// This module loads every entry at build time so the typed `news` array
// stays the same shape components have always imported. When the collection
// is empty (default), it returns []. House rule: no em dashes anywhere in
// the body; the admin enforces this via a Keystatic field validator.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export type NewsPost = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string;
  image?: string;
  tags?: string[];
};

const NEWS_DIR = join(process.cwd(), "content", "news");

function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  body: string;
} {
  if (!raw.startsWith("---")) {
    return { data: {}, body: raw };
  }
  const end = raw.indexOf("\n---", 3);
  if (end === -1) {
    return { data: {}, body: raw };
  }
  const block = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\n/, "");
  const data: Record<string, unknown> = {};
  // Minimal YAML reader covering the shapes Keystatic writes for the news
  // schema: scalar strings, scalar dates, and inline list-of-strings under
  // `tags`. Anything more complex falls through and the caller can extend
  // this later.
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (!match) continue;
    const [, key, rest] = match;
    const trimmed = rest.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      data[key] = trimmed
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
    } else {
      data[key] = trimmed.replace(/^['"]|['"]$/g, "");
    }
  }
  return { data, body };
}

function loadNews(): NewsPost[] {
  if (!existsSync(NEWS_DIR)) return [];
  const entries = readdirSync(NEWS_DIR, { withFileTypes: true });
  const posts: NewsPost[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Keystatic writes `slug/index.mdoc` per entry. Older single-file layouts
      // (`slug.mdoc`) are also tolerated.
      const indexPath = join(NEWS_DIR, entry.name, "index.mdoc");
      if (!existsSync(indexPath)) continue;
      const raw = readFileSync(indexPath, "utf8");
      const { data, body } = parseFrontmatter(raw);
      posts.push({
        slug: entry.name,
        title: String(data.title ?? entry.name),
        date: String(data.date ?? ""),
        summary: String(data.summary ?? ""),
        body,
        image: data.image ? String(data.image) : undefined,
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : undefined,
      });
      continue;
    }
    if (!entry.name.endsWith(".mdoc")) continue;
    const raw = readFileSync(join(NEWS_DIR, entry.name), "utf8");
    const { data, body } = parseFrontmatter(raw);
    const slug = entry.name.replace(/\.mdoc$/, "");
    posts.push({
      slug,
      title: String(data.title ?? slug),
      date: String(data.date ?? ""),
      summary: String(data.summary ?? ""),
      body,
      image: data.image ? String(data.image) : undefined,
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : undefined,
    });
  }

  // Newest first by date string (ISO sorts lexically).
  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export const news: NewsPost[] = loadNews();
