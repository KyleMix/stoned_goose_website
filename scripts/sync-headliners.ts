// Eventbrite events -> new Headliners entries (content/performers/<slug>/).
//
// Runs after sync:shows in the refresh-feeds workflow. For each upcoming,
// paid Eventbrite event titled "<Name> Live in <City> ..." that no headliner
// claims yet,
// it writes a starter entry: the name, a slug, and the event ID. Everything
// else stays empty for the owner to fill in /admin, mostly the photos.
//
// The entry deliberately carries no date and no price. While it is linked to
// a live event, the date, time, venue, ticket link and base price all come
// from Eventbrite on every sync, so changing them on Eventbrite updates the
// site. A price typed in the CMS overrides Eventbrite's.
//
// It only ever creates files. An existing entry is never edited, renamed or
// deleted, so nothing typed in the CMS can be overwritten. "Already claimed"
// uses the same rules as the page (lib/performer-match.ts): the event ID, or
// the headliner's name in the event title. Hidden (draft) entries count as
// claiming, so hiding a headliner does not make the sync recreate it.
//
// Run: npm run sync:headliners   (then npm run content:index)

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Show } from "../content/shows";
import { eventbriteIdOf, normaliseName, titleHasName } from "../lib/performer-match";
import { isStillListed, showTimeZone } from "../lib/dates";
import { writeJson } from "./_sync-helpers";

const ROOT = process.cwd();
const SHOWS = join(ROOT, "content", ".generated", "shows.json");
const PERFORMERS = join(ROOT, "content", "performers");

// Folders already used under /shows (see the slug rule in validate-content).
const TAKEN = new Set(["og", "uploads"]);

type Existing = { slug: string; name: string; eventbriteId: string | null };

export type StarterEntry = {
  name: string;
  slug: string;
  eventbriteId: string;
  date: null;
  priceDisplay: null;
  creditsLabel: null;
  credits: string[];
  bio: string;
  images: { cutout: null; arch: null; flyer: null };
  draft: boolean;
};

/**
 * "Ryan O’Flanagan Live in Olympia | Stand-Up Comedy" -> "Ryan O'Flanagan".
 * Only the "<Name> Live in" pattern counts, and only a plausible name (two to
 * five words), so an event titled any other way is left for a person to add
 * rather than turned into a headliner called "Comedy Night".
 */
export function nameFromTitle(title: string): string | null {
  const m = title
    .replace(/[‘’ʼ]/g, "'")
    .match(/^\s*(.+?)\s+live\s+in\b/i);
  if (!m) return null;
  const name = m[1].replace(/\s+/g, " ").trim();
  const words = name.split(" ");
  if (words.length < 2 || words.length > 5 || name.length > 40) return null;
  if (!words.every((w) => /^[A-Za-z][A-Za-z'.-]*$/.test(w))) return null;
  return name;
}

/** "Ryan O'Flanagan" -> "ryan-oflanagan", the convention the first entries use. */
export function slugFor(name: string): string {
  return normaliseName(name)
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The starter entries to create. Pure, for scripts/test/performer-match.test.ts. */
export function newHeadlinerEntries(
  shows: Show[],
  existing: Existing[],
  takenSlugs: Set<string>,
  now: number = Date.now(),
): StarterEntry[] {
  const claimedIds = new Set(existing.map((p) => p.eventbriteId).filter(Boolean));
  const slugs = new Set([...takenSlugs, ...TAKEN]);
  const out: StarterEntry[] = [];

  for (const show of shows) {
    if (show.source !== "eventbrite" || show.status === "free") continue;
    if (!isStillListed(show.start, now, showTimeZone(show))) continue;
    const id = eventbriteIdOf(show);
    if (!id || claimedIds.has(id)) continue;
    if (existing.some((p) => titleHasName(show.name, p.name))) continue;

    const name = nameFromTitle(show.name);
    if (!name) continue;
    const slug = slugFor(name);
    if (!slug || slugs.has(slug)) continue;

    out.push({
      name,
      slug,
      eventbriteId: id,
      date: null,
      priceDisplay: null,
      creditsLabel: null,
      credits: [],
      bio: "",
      images: { cutout: null, arch: null, flyer: null },
      draft: false,
    });
    claimedIds.add(id);
    slugs.add(slug);
    existing = [...existing, { slug, name, eventbriteId: id }];
  }
  return out;
}

function readExisting(): { entries: Existing[]; folders: Set<string> } {
  const entries: Existing[] = [];
  const folders = new Set<string>();
  if (!existsSync(PERFORMERS)) return { entries, folders };
  for (const item of readdirSync(PERFORMERS, { withFileTypes: true })) {
    if (!item.isDirectory()) continue;
    folders.add(item.name);
    const file = join(PERFORMERS, item.name, "index.json");
    if (!existsSync(file)) continue;
    const raw = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
    const slug = typeof raw.slug === "string" && raw.slug ? raw.slug : item.name;
    folders.add(slug);
    if (typeof raw.name === "string" && raw.name.trim()) {
      entries.push({
        slug,
        name: raw.name.trim(),
        eventbriteId: typeof raw.eventbriteId === "string" && raw.eventbriteId ? raw.eventbriteId : null,
      });
    }
  }
  return { entries, folders };
}

function main() {
  if (!existsSync(SHOWS)) {
    console.log("[sync:headliners] no synced shows yet, nothing to do.");
    return;
  }
  const shows = JSON.parse(readFileSync(SHOWS, "utf8")) as Show[];
  const { entries, folders } = readExisting();
  const created = newHeadlinerEntries(Array.isArray(shows) ? shows : [], entries, folders);
  for (const entry of created) {
    writeJson(join(PERFORMERS, entry.slug, "index.json"), entry);
    console.log(`[sync:headliners] created ${entry.slug} for Eventbrite event ${entry.eventbriteId}`);
  }
  if (created.length === 0) console.log("[sync:headliners] no new headliners.");
}

if (process.argv[1]?.includes("sync-headliners")) {
  main();
}
