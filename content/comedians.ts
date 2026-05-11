// Comedians shim. Reads:
//   - content/roster-copy/index.json (singleton, shared with members.ts)
//   - content/.generated/comedians-index.json (collection consolidated at
//     prebuild by scripts/build-content-index.ts)
//
// Sorted alphabetically by display name to keep the editorial grid stable.
// Entries flagged as draft in Keystatic are filtered out so unfinished
// portraits never appear on /roster.

import rosterCopyData from "./roster-copy/index.json";
import comediansIndex from "./.generated/comedians-index.json";

export type Comedian = {
  name: string;
  photo: string;
  photoAlt: string;
  instagram?: string;
  facebook?: string;
};

type RosterCopyShape = {
  comedians: {
    subhead: string;
    kicker: string;
  };
};

const copy = rosterCopyData as unknown as RosterCopyShape;

export const comediansCopy = copy.comedians;

const PUBLIC_DIR = "/images/comedians/";

type RawComedian = {
  slug?: string;
  name?: string;
  photo?: string;
  photoAlt?: string;
  instagram?: string;
  facebook?: string;
  draft?: boolean;
};

const raw = comediansIndex as RawComedian[];

export const comedians: Comedian[] = raw
  .filter((c) => c.draft !== true)
  .map((c) => ({
    name: c.name ?? c.slug ?? "Unknown",
    photo: PUBLIC_DIR + (c.photo ?? ""),
    photoAlt: c.photoAlt && c.photoAlt.length > 0 ? c.photoAlt : `${c.name ?? c.slug ?? ""} portrait`,
    instagram: c.instagram && c.instagram.length > 0 ? c.instagram : undefined,
    facebook: c.facebook && c.facebook.length > 0 ? c.facebook : undefined,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
