// Headliners shim. One entry per comic under content/performers/<slug>/,
// consolidated at prebuild into content/.generated/performers-index.json.
// lib/performer-match.ts attaches each one to its show; this file only shapes
// the CMS data.
//
// Every optional CMS field arrives as null, "" or missing. They all normalise
// to null here so nothing downstream has to tell them apart.

import performersIndex from "./.generated/performers-index.json";
import showsCopyData from "./shows-copy/index.json";

export type Performer = {
  slug: string;
  name: string;
  eventbriteId: string | null;
  /** "2027-06-19". Only used while there is no Eventbrite event. */
  date: string | null;
  /** The base price from the flyer, e.g. "$20". Never Eventbrite's total. */
  priceDisplay: string | null;
  /** e.g. "As seen on". */
  creditsLabel: string | null;
  credits: string[];
  bio: string;
  images: {
    cutout: string | null;
    arch: string | null;
    flyer: string | null;
  };
};

/** Venue and times for a headliner whose event is not on Eventbrite yet. */
export type PerformerDefaults = {
  venue: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  /** "6:00 PM" */
  doors: string | null;
  /** "7:00 PM" */
  show: string | null;
};

type Raw = Record<string, unknown>;

const text = (v: unknown): string | null =>
  typeof v === "string" && v.trim().length > 0 ? v.trim() : null;

// CMS uploads store an absolute /shows/uploads/... path. A bare filename
// (hand edit) is assumed to be an upload too, rather than a broken src.
const imagePath = (v: unknown): string | null => {
  const s = text(v);
  if (!s) return null;
  return s.startsWith("/") ? s : `/shows/uploads/${s}`;
};

function shape(raw: Raw): Performer | null {
  const name = text(raw.name);
  const slug = text(raw.slug);
  if (!name || !slug) return null;
  const images = (raw.images ?? {}) as Raw;
  return {
    slug,
    name,
    eventbriteId: text(raw.eventbriteId),
    date: text(raw.date),
    priceDisplay: text(raw.priceDisplay),
    creditsLabel: text(raw.creditsLabel),
    credits: Array.isArray(raw.credits)
      ? raw.credits.map(text).filter((c): c is string => c !== null)
      : [],
    bio: text(raw.bio) ?? "",
    images: {
      cutout: imagePath(images.cutout),
      arch: imagePath(images.arch),
      flyer: imagePath(images.flyer),
    },
  };
}

export const performers: Performer[] = (performersIndex as Raw[])
  .filter((p) => p.draft !== true)
  .map(shape)
  .filter((p): p is Performer => p !== null);

const rawDefaults = ((showsCopyData as Raw).performerDefaults ?? {}) as Raw;

export const performerDefaults: PerformerDefaults = {
  venue: text(rawDefaults.venue),
  address: text(rawDefaults.address),
  city: text(rawDefaults.city),
  region: text(rawDefaults.region),
  doors: text(rawDefaults.doors),
  show: text(rawDefaults.show),
};
