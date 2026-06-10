// Pro comedy shows shim. Reads:
//   - content/pro-clubs/index.json (singleton: the clubs we track)
//   - content/.generated/pro-shows.json (synced by scripts/sync-pro-shows.ts)
//   - content/.generated/pro-shows-index.json (manual CMS entries)
//
// Synced and manual shows merge; past shows are dropped at build time.

import proClubsData from "./pro-clubs/index.json";
import syncedData from "./.generated/pro-shows.json";
import manualIndex from "./.generated/pro-shows-index.json";

export type ProClub = {
  name: string;
  slug: string;
  city: string;
  website: string;
  eventsUrl: string;
  /** Adapter id used by scripts/sync-pro-shows.ts. */
  platform: "seatengine" | "tribe" | "eventbrite";
  /** Only keep events whose page mentions this text, e.g. "Special Event". */
  includeText: string;
  /** Drop events whose title matches any of these. */
  excludeText: string[];
  /** Logo path under /images/clubs/, used as the filter button. */
  logo: string;
  active: boolean;
};

export type ProShow = {
  id: string;
  clubSlug: string;
  title: string;
  /** ISO datetime. */
  start: string;
  /** Ticket purchase URL on the club's site. */
  url: string;
  image?: string;
};

type RawClubs = { clubs?: Partial<ProClub>[] };

export const proClubs: ProClub[] = ((proClubsData as RawClubs).clubs ?? [])
  .filter((c) => c.active !== false && c.name && c.slug)
  .map((c) => ({
    name: c.name ?? "",
    slug: c.slug ?? "",
    city: c.city ?? "",
    website: c.website ?? "",
    eventsUrl: c.eventsUrl ?? "",
    platform: (c.platform as ProClub["platform"]) ?? "seatengine",
    includeText: c.includeText ?? "",
    excludeText: Array.isArray(c.excludeText) ? c.excludeText : [],
    logo: c.logo && c.logo.length > 0 ? c.logo : "",
    active: true,
  }));

export function getClub(slug: string): ProClub | undefined {
  return proClubs.find((c) => c.slug === slug);
}

type SyncedShape = {
  fetchedAt?: string | null;
  shows?: Partial<ProShow>[];
};

type RawManualShow = {
  slug?: string;
  title?: string;
  club?: string;
  start?: string;
  ticketUrl?: string;
  draft?: boolean;
};

const synced = (syncedData as SyncedShape).shows ?? [];

const manual: ProShow[] = (manualIndex as RawManualShow[])
  .filter((s) => s.draft !== true && s.title && s.start)
  .map((s) => ({
    id: `manual-${s.slug ?? s.title}`,
    clubSlug: s.club ?? "",
    title: s.title ?? "",
    start: s.start ?? "",
    url: s.ticketUrl ?? "",
  }));

function shape(s: Partial<ProShow>): ProShow | null {
  if (!s.title || !s.start) return null;
  return {
    id: s.id ?? `${s.clubSlug}-${s.start}-${s.title}`,
    clubSlug: s.clubSlug ?? "",
    title: s.title,
    start: s.start,
    url: s.url ?? "",
    image: s.image,
  };
}

// Manual entries win over synced ones at the same club + start time, so a
// hand correction in /admin beats a stale scrape.
const merged = new Map<string, ProShow>();
for (const raw of synced) {
  const s = shape(raw);
  if (s) merged.set(`${s.clubSlug}|${s.start}|${s.title.toLowerCase()}`, s);
}
for (const s of manual) {
  merged.set(`${s.clubSlug}|${s.start}|${s.title.toLowerCase()}`, s);
}

const cutoff = new Date();
cutoff.setDate(cutoff.getDate() - 1);

export const proShows: ProShow[] = [...merged.values()]
  .filter((s) => {
    const d = new Date(s.start);
    return !Number.isNaN(d.getTime()) && d >= cutoff;
  })
  .sort((a, b) => a.start.localeCompare(b.start));

export const proShowsFetchedAt: string | null =
  (syncedData as SyncedShape).fetchedAt ?? null;
