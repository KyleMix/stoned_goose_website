// Patreon public RSS feed -> content/.generated/patreon.json
// Patreon does not provide a public posts API, but most pages publish a
// public RSS feed at /rss/<creator-slug>?auth=<token>. The owner pastes
// the URL into PATREON_RSS_URL and we render the latest post titles.
import { join } from "node:path";
import type { PatreonPost } from "../content/social";
import { writeJson } from "./_sync-helpers";

const OUT_PATH = join(process.cwd(), "content", ".generated", "patreon.json");

function parseRss(xml: string): PatreonPost[] {
  const items: PatreonPost[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = pickTag(block, "title");
    const link = pickTag(block, "link");
    const pubDate = pickTag(block, "pubDate");
    if (!title || !link) continue;
    items.push({ title, link, pubDate: pubDate ?? "" });
  }
  return items.slice(0, 3);
}

function pickTag(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
  const m = block.match(re);
  if (!m) return null;
  return m[1]
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .trim();
}

async function main() {
  const url = process.env.PATREON_RSS_URL;
  if (!url) {
    console.log("[sync] skipping. missing env: PATREON_RSS_URL");
    return;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[sync:patreon] ${url} -> ${res.status}`);
      return;
    }
    const xml = await res.text();
    const posts = parseRss(xml);
    writeJson(OUT_PATH, posts);
    console.log(`[sync:patreon] wrote ${posts.length} posts`);
  } catch (err) {
    console.warn(
      `[sync:patreon] fetch failed: ${err instanceof Error ? err.message : err}`,
    );
  }
}

main();
