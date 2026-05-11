// Comedians shim. Reads:
//   - content/roster-copy/index.json (singleton, shared with members.ts)
//   - content/.generated/comedians-index.json (collection consolidated at
//     prebuild by scripts/build-content-index.ts)
//
// Sorted alphabetically by display name to keep the editorial grid stable.

import rosterCopyData from "./roster-copy/index.json";
import comediansIndex from "./.generated/comedians-index.json";

export type Comedian = {
  name: string;
  photo: string;
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
  instagram?: string;
  facebook?: string;
};

const raw = comediansIndex as RawComedian[];

export const comedians: Comedian[] = raw
  .map((c) => ({
    name: c.name ?? c.slug ?? "Unknown",
    photo: PUBLIC_DIR + (c.photo ?? ""),
    instagram: c.instagram && c.instagram.length > 0 ? c.instagram : undefined,
    facebook: c.facebook && c.facebook.length > 0 ? c.facebook : undefined,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
