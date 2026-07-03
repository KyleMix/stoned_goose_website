// Shows shim. Combines:
//   - showsCopy + featuredSpecial + presale (singleton from /admin)
//   - manual shows (CMS collection consolidated at prebuild)
//   - synced shows (content/.generated/shows.json, from scripts/sync-shows.ts)
//
// Generated shows win when present and non-empty; otherwise the manual
// list applies. Manual entries flagged as draft are filtered out.

import showsCopyData from "./shows-copy/index.json";
import generatedShows from "./.generated/shows.json";
import manualIndex from "./.generated/shows-index.json";
import { normaliseBlocks, type Block } from "@/lib/blocks";

export type Show = {
  id: string;
  name: string;
  start: string | null;
  end: string | null;
  url: string | null;
  summary: string;
  imageUrl?: string | null;
  imageAlt?: string;
  venue?: {
    name?: string;
    address?: string;
    city?: string;
    region?: string;
    country?: string;
  };
  ticketUrl?: string | null;
  status?: "ticketed" | "free" | "tba";
  ticketPrice?: string;
  doorTime?: string;
  source?: "eventbrite" | "facebook" | "manual";
};

export type Presale = {
  code: string;
  expiresAt: string;
  venueName: string;
};

const POSTER_DIR = "/images/comedians/";
const SHOW_IMAGE_DIR = "/images/shows/";

type ShowsCopyShape = {
  heading: string;
  subhead?: string | null;
  emptyState?: string | null;
  featuredSpecial?: {
    title?: string | null;
    subtitle?: string | null;
    blurb?: string | null;
    videoUrl?: string | null;
    poster?: string | null;
    posterAlt?: string | null;
    comedianHandle?: string | null;
  } | null;
  presale?: {
    active?: boolean;
    code?: string;
    expiresAt?: string;
    venueName?: string;
  } | null;
  topSections?: unknown;
  bottomSections?: unknown;
};

const copy = showsCopyData as unknown as ShowsCopyShape;

export const showsTopSections: Block[] = normaliseBlocks(copy.topSections);
export const showsBottomSections: Block[] = normaliseBlocks(copy.bottomSections);

export const showsCopy = {
  heading: copy.heading,
  subhead: copy.subhead ?? "",
  emptyState: copy.emptyState ?? "",
};

// Every field is optional in the CMS; a cleared field arrives as null and
// must not crash /shows at import time.
const special = copy.featuredSpecial ?? {};
const specialTitle = special.title ?? "";
const specialPoster = special.poster ?? "";

export const featuredSpecial = {
  title: specialTitle,
  subtitle: special.subtitle ?? "",
  blurb: special.blurb ?? "",
  videoUrl: special.videoUrl ? special.videoUrl : null,
  // Accept either an absolute path (/images/...) as written by the CMS, or a
  // bare filename, which gets the comedians directory prepended. Prepending
  // unconditionally would double the path for absolute values.
  poster:
    specialPoster.length === 0 || specialPoster.startsWith("/")
      ? specialPoster
      : POSTER_DIR + specialPoster,
  posterAlt:
    special.posterAlt && special.posterAlt.length > 0
      ? special.posterAlt
      : `${specialTitle} poster`,
  comedianHandle: special.comedianHandle ?? "",
};

function resolvePresale(p: ShowsCopyShape["presale"]): Presale | null {
  if (!p || typeof p !== "object") return null;
  if (p.active !== true) return null;
  return {
    code: p.code ?? "",
    expiresAt: p.expiresAt ?? "",
    venueName: p.venueName ?? "",
  };
}

export const presale: Presale | null = resolvePresale(copy.presale);

// Optional CMS fields are null when the editor leaves them empty.
type RawManualShow = {
  id?: string | null;
  name?: string | null;
  start?: string | null;
  end?: string | null;
  url?: string | null;
  ticketUrl?: string | null;
  summary?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  venue?: Show["venue"] | null;
  status?: Show["status"] | null;
  ticketPrice?: string | null;
  doorTime?: string | null;
  draft?: boolean | null;
};

function shapeManual(raw: RawManualShow): Show {
  return {
    id: raw.id ?? "",
    name: raw.name ?? "",
    start: raw.start ?? null,
    end: raw.end ?? null,
    url: raw.url && raw.url.length > 0 ? raw.url : null,
    summary: raw.summary ?? "",
    imageUrl: raw.imageUrl && raw.imageUrl.length > 0 ? SHOW_IMAGE_DIR + raw.imageUrl : null,
    imageAlt: raw.imageAlt && raw.imageAlt.length > 0 ? raw.imageAlt : undefined,
    venue: raw.venue ?? undefined,
    ticketUrl: raw.ticketUrl && raw.ticketUrl.length > 0 ? raw.ticketUrl : null,
    status: raw.status ?? "tba",
    ticketPrice: raw.ticketPrice ?? undefined,
    doorTime: raw.doorTime ?? undefined,
    source: "manual",
  };
}

const manualShows: Show[] = (manualIndex as unknown as RawManualShow[])
  .filter((s) => s.draft !== true)
  .map(shapeManual);

const fromGenerated =
  Array.isArray(generatedShows) && generatedShows.length > 0
    ? (generatedShows as Show[])
    : null;

export const upcomingShows: Show[] = fromGenerated ?? manualShows;
