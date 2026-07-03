// Comedians shim. Reads:
//   - content/roster-copy/index.json (singleton, shared with members.ts)
//   - content/.generated/comedians-index.json (collection consolidated at
//     prebuild by scripts/build-content-index.ts)
//
// Sorted alphabetically by display name to keep the editorial grid stable.
// Entries flagged as draft in the CMS are filtered out so unfinished
// portraits never appear on /roster.

import rosterCopyData from "./roster-copy/index.json";
import comediansIndex from "./.generated/comedians-index.json";

export type Comedian = {
  slug: string;
  name: string;
  photo: string;
  photoAlt: string;
  instagram?: string;
  facebook?: string;
  bio?: string;
  reelUrl?: string;
  credits?: string[];
  /** True when the comedian has enough content (bio or reel) for an EPK page. */
  hasEpk: boolean;
};

type RosterCopyShape = {
  comedians?: {
    subhead?: string;
    kicker?: string;
  } | null;
};

const copy = rosterCopyData as unknown as RosterCopyShape;

// Optional CMS fields arrive as null when cleared in /admin; guard them so
// a legal save can never crash /roster at import time.
export const comediansCopy = {
  subhead: copy.comedians?.subhead ?? "",
  kicker: copy.comedians?.kicker ?? "",
};

const PUBLIC_DIR = "/images/comedians/";

type RawComedian = {
  slug?: string;
  name?: string;
  photo?: string;
  photoAlt?: string;
  instagram?: string;
  facebook?: string;
  bio?: string;
  reelUrl?: string;
  credits?: string[];
  draft?: boolean;
};

const raw = comediansIndex as unknown as RawComedian[];

export const comedians: Comedian[] = raw
  .filter((c) => c.draft !== true)
  .map((c) => {
    const bio = c.bio && c.bio.length > 0 ? c.bio : undefined;
    const reelUrl = c.reelUrl && c.reelUrl.length > 0 ? c.reelUrl : undefined;
    const credits =
      Array.isArray(c.credits) && c.credits.length > 0 ? c.credits : undefined;
    return {
      slug: c.slug ?? "",
      name: c.name ?? c.slug ?? "Unknown",
      photo: PUBLIC_DIR + (c.photo ?? ""),
      photoAlt: c.photoAlt && c.photoAlt.length > 0 ? c.photoAlt : `${c.name ?? c.slug ?? ""} portrait`,
      instagram: c.instagram && c.instagram.length > 0 ? c.instagram : undefined,
      facebook: c.facebook && c.facebook.length > 0 ? c.facebook : undefined,
      bio,
      reelUrl,
      credits,
      // An EPK page needs real content. Name + photo alone would be a thin
      // page, so those comedians stay grid-only until the CMS fills them in.
      hasEpk: Boolean(bio || reelUrl),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const epkComedians: Comedian[] = comedians.filter(
  (c) => c.hasEpk && c.slug.length > 0,
);

export function getComedian(slug: string): Comedian | undefined {
  return epkComedians.find((c) => c.slug === slug);
}
