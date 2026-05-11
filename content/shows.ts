// Shows shim. Combines:
//   - showsCopy + featuredSpecial + presale (singleton from /admin)
//   - manual shows (Keystatic collection consolidated at prebuild)
//   - synced shows (content/.generated/shows.json, from scripts/sync-shows.ts)
//
// Generated shows win when present and non-empty; otherwise the manual
// Keystatic list applies.

import showsCopyData from "./shows-copy/index.json";
import generatedShows from "./.generated/shows.json";
import manualIndex from "./.generated/shows-index.json";

export type Show = {
  id: string;
  name: string;
  start: string | null;
  end: string | null;
  url: string | null;
  summary: string;
  imageUrl?: string | null;
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
  subhead: string;
  emptyState: string;
  featuredSpecial: {
    title: string;
    subtitle: string;
    blurb: string;
    videoUrl: string;
    poster: string;
    comedianHandle: string;
  };
  presale?:
    | { discriminant: true; value: Presale }
    | { discriminant: false; value: null };
};

const copy = showsCopyData as unknown as ShowsCopyShape;

export const showsCopy = {
  heading: copy.heading,
  subhead: copy.subhead,
  emptyState: copy.emptyState,
};

export const featuredSpecial = {
  title: copy.featuredSpecial.title,
  subtitle: copy.featuredSpecial.subtitle,
  blurb: copy.featuredSpecial.blurb,
  videoUrl: copy.featuredSpecial.videoUrl ? copy.featuredSpecial.videoUrl : null,
  poster: POSTER_DIR + copy.featuredSpecial.poster,
  comedianHandle: copy.featuredSpecial.comedianHandle,
};

export const presale: Presale | null =
  copy.presale && copy.presale.discriminant === true ? copy.presale.value : null;

type RawManualShow = {
  id?: string;
  name?: string;
  start?: string;
  end?: string;
  url?: string;
  ticketUrl?: string;
  summary?: string;
  imageUrl?: string;
  venue?: Show["venue"];
  status?: Show["status"];
  ticketPrice?: string;
  doorTime?: string;
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
    venue: raw.venue,
    ticketUrl: raw.ticketUrl && raw.ticketUrl.length > 0 ? raw.ticketUrl : null,
    status: raw.status ?? "tba",
    ticketPrice: raw.ticketPrice,
    doorTime: raw.doorTime,
    source: "manual",
  };
}

const manualShows: Show[] = (manualIndex as RawManualShow[]).map(shapeManual);

const fromGenerated =
  Array.isArray(generatedShows) && generatedShows.length > 0
    ? (generatedShows as Show[])
    : null;

export const upcomingShows: Show[] = fromGenerated ?? manualShows;
