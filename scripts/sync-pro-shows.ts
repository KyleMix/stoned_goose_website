// Pro comedy shows sync -> content/.generated/pro-shows.json
//
// Pulls upcoming events from the comedy clubs configured in
// content/pro-clubs/index.json. Two adapters:
//
//   seatengine: club sites on the SeatEngine platform (Tacoma Comedy Club,
//     Emerald City Comedy Club). Reads JSON-LD Event blocks from the events
//     listing; when a club sets includeText (e.g. "Special Event"), each
//     candidate's detail page is fetched and kept only if the page contains
//     that text. That is how Tacoma marks its big-name touring acts.
//   tribe: WordPress sites running The Events Calendar (Laughs Comedy Club),
//     read via the public wp-json REST API. Falls back to scanning the
//     tickets page for JSON-LD when the API is unavailable.
//
// Failure behavior matches the other sync scripts: a club that cannot be
// fetched keeps its previously synced shows, and the script always exits 0
// so static builds never break on a third-party outage.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { proClubs, type ProClub, type ProShow } from "../content/pro-shows";
import { writeJson } from "./_sync-helpers";

const OUT_PATH = join(process.cwd(), "content", ".generated", "pro-shows.json");

// Club sites sit behind bot protection that rejects bare fetches; present as
// a regular browser.
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7",
  "Accept-Language": "en-US,en;q=0.9",
};

const DETAIL_FETCH_LIMIT = 60;
const DETAIL_FETCH_DELAY_MS = 250;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow" });
    if (!res.ok) {
      console.warn(`[pro-shows] ${url} -> ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(
      `[pro-shows] ${url} -> ${err instanceof Error ? err.message : err}`,
    );
    return null;
  }
}

// --- JSON-LD extraction ----------------------------------------------------

type LdEvent = {
  title: string;
  start: string;
  url: string;
  image?: string;
};

function collectLdObjects(html: string): unknown[] {
  const out: unknown[] = [];
  const re =
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      out.push(JSON.parse(m[1].trim()));
    } catch {
      // Malformed block; skip it.
    }
  }
  return out;
}

function flattenLd(node: unknown, acc: Record<string, unknown>[]) {
  if (Array.isArray(node)) {
    for (const item of node) flattenLd(item, acc);
    return;
  }
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    acc.push(obj);
    if (Array.isArray(obj["@graph"])) flattenLd(obj["@graph"], acc);
    if (Array.isArray(obj.itemListElement)) flattenLd(obj.itemListElement, acc);
    if (obj.item && typeof obj.item === "object") flattenLd(obj.item, acc);
  }
}

// Exported for verification scripts.
export function ldEvents(html: string, baseUrl: string): LdEvent[] {
  const flat: Record<string, unknown>[] = [];
  for (const block of collectLdObjects(html)) flattenLd(block, flat);
  const events: LdEvent[] = [];
  for (const obj of flat) {
    const type = obj["@type"];
    const isEvent = Array.isArray(type)
      ? type.some((t) => String(t).includes("Event"))
      : String(type ?? "").includes("Event");
    if (!isEvent) continue;
    const title = typeof obj.name === "string" ? obj.name.trim() : "";
    const start = typeof obj.startDate === "string" ? obj.startDate : "";
    let url = typeof obj.url === "string" ? obj.url : "";
    const offers = obj.offers as Record<string, unknown> | undefined;
    if (!url && offers && typeof offers.url === "string") url = offers.url;
    const image =
      typeof obj.image === "string"
        ? obj.image
        : Array.isArray(obj.image) && typeof obj.image[0] === "string"
          ? obj.image[0]
          : undefined;
    if (!title || !start) continue;
    events.push({ title, start, url: absolutize(url, baseUrl), image });
  }
  return events;
}

function absolutize(url: string, baseUrl: string): string {
  if (!url) return "";
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
}

// Fallback when a listing carries no JSON-LD: collect SeatEngine-style event
// detail links and let the detail pass (which reads each page's JSON-LD)
// fill in dates.
export function eventLinks(html: string, baseUrl: string): string[] {
  const re = /href\s*=\s*["']([^"']*\/(?:shows|events)\/\d+[^"']*)["']/gi;
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    found.add(absolutize(m[1], baseUrl));
  }
  return [...found];
}

function matchesAny(haystack: string, needles: string[]): boolean {
  const lower = haystack.toLowerCase();
  return needles.some((n) => n && lower.includes(n.toLowerCase()));
}

// --- Adapters ----------------------------------------------------------------

async function syncSeatengine(club: ProClub): Promise<ProShow[] | null> {
  const html = await fetchText(club.eventsUrl);
  if (!html) return null;

  let candidates = ldEvents(html, club.website).map((e) => ({
    ...e,
    detailUrl: e.url,
  }));

  if (candidates.length === 0) {
    // No structured data on the listing; walk the event detail links instead.
    const links = eventLinks(html, club.website).slice(0, DETAIL_FETCH_LIMIT);
    console.log(
      `[pro-shows] ${club.slug}: no listing JSON-LD, walking ${links.length} event links`,
    );
    for (const link of links) {
      await sleep(DETAIL_FETCH_DELAY_MS);
      const page = await fetchText(link);
      if (!page) continue;
      for (const e of ldEvents(page, club.website)) {
        candidates.push({ ...e, url: e.url || link, detailUrl: link });
      }
    }
  }

  candidates = candidates.filter(
    (e) => !matchesAny(e.title, club.excludeText),
  );

  // includeText filter ("Special Event"): the badge lives on the detail
  // page, so verify each candidate there.
  if (club.includeText) {
    const kept: typeof candidates = [];
    const seen = new Map<string, boolean>();
    for (const e of candidates.slice(0, DETAIL_FETCH_LIMIT)) {
      const key = e.detailUrl || e.url;
      if (!key) continue;
      if (!seen.has(key)) {
        await sleep(DETAIL_FETCH_DELAY_MS);
        const page = await fetchText(key);
        seen.set(key, page ? matchesAny(page, [club.includeText]) : false);
      }
      if (seen.get(key)) kept.push(e);
    }
    candidates = kept;
  }

  return candidates.map((e) => ({
    id: `${club.slug}-${e.start}-${slugify(e.title)}`,
    clubSlug: club.slug,
    title: e.title,
    start: e.start,
    url: e.url,
    image: e.image,
  }));
}

type TribeEvent = {
  title?: string;
  start_date?: string;
  url?: string;
  website?: string;
  image?: { url?: string } | false;
};

async function syncTribe(club: ProClub): Promise<ProShow[] | null> {
  const api = `${club.website.replace(/\/$/, "")}/wp-json/tribe/events/v1/events?per_page=50`;
  let events: TribeEvent[] | null = null;
  try {
    const res = await fetch(api, { headers: BROWSER_HEADERS });
    if (res.ok) {
      const data = (await res.json()) as { events?: TribeEvent[] };
      if (Array.isArray(data.events)) events = data.events;
    } else {
      console.warn(`[pro-shows] ${api} -> ${res.status}`);
    }
  } catch (err) {
    console.warn(
      `[pro-shows] ${api} -> ${err instanceof Error ? err.message : err}`,
    );
  }

  if (events) {
    return events
      .filter((e) => e.title && e.start_date)
      .filter((e) => !matchesAny(decodeEntities(e.title ?? ""), club.excludeText))
      .map((e) => ({
        id: `${club.slug}-${e.start_date}-${slugify(e.title ?? "")}`,
        clubSlug: club.slug,
        title: decodeEntities(e.title ?? ""),
        // Tribe dates are local "YYYY-MM-DD HH:MM:SS"; normalize the space.
        start: (e.start_date ?? "").replace(" ", "T"),
        url: e.website || e.url || club.eventsUrl,
        image: e.image && e.image.url ? e.image.url : undefined,
      }));
  }

  // REST blocked or plugin renamed: fall back to JSON-LD on the tickets page.
  const html = await fetchText(club.eventsUrl);
  if (!html) return null;
  return ldEvents(html, club.website)
    .filter((e) => !matchesAny(e.title, club.excludeText))
    .map((e) => ({
      id: `${club.slug}-${e.start}-${slugify(e.title)}`,
      clubSlug: club.slug,
      title: e.title,
      start: e.start,
      url: e.url || club.eventsUrl,
      image: e.image,
    }));
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// --- Main --------------------------------------------------------------------

async function main() {
  let previous: { shows?: ProShow[] } = {};
  try {
    previous = JSON.parse(readFileSync(OUT_PATH, "utf8"));
  } catch {
    // First run.
  }
  const previousShows = Array.isArray(previous.shows) ? previous.shows : [];

  const all: ProShow[] = [];
  for (const club of proClubs) {
    const adapter = club.platform === "tribe" ? syncTribe : syncSeatengine;
    const shows = await adapter(club);
    if (shows === null) {
      const kept = previousShows.filter((s) => s.clubSlug === club.slug);
      console.warn(
        `[pro-shows] ${club.slug}: fetch failed, keeping ${kept.length} previously synced shows`,
      );
      all.push(...kept);
    } else {
      console.log(`[pro-shows] ${club.slug}: ${shows.length} shows`);
      all.push(...shows);
    }
  }

  // Dedupe (same club + start + title can arrive from both listing and
  // detail passes) and drop past dates.
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 1);
  const unique = new Map<string, ProShow>();
  for (const s of all) {
    const d = new Date(s.start);
    if (Number.isNaN(d.getTime()) || d < cutoff) continue;
    unique.set(`${s.clubSlug}|${s.start}|${s.title.toLowerCase()}`, s);
  }

  const shows = [...unique.values()].sort((a, b) =>
    a.start.localeCompare(b.start),
  );
  writeJson(OUT_PATH, { fetchedAt: new Date().toISOString(), shows });
  console.log(`[pro-shows] wrote ${shows.length} shows`);
}

// Only run when executed as a script, so verification code can import the
// parsing helpers without kicking off network fetches.
if (process.argv[1]?.includes("sync-pro-shows")) {
  main().catch((err) => {
    // Never fail the build over a scrape; the committed JSON keeps serving.
    console.error("[pro-shows] unexpected error:", err);
  });
}
