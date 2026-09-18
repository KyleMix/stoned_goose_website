// Members (crew) shim. Reads:
//   - content/roster-copy/index.json (the /about singleton)
//   - content/.generated/members-index.json (collection, consolidated at prebuild)
//
// Sorted by the `index` display-order field. The number itself is no longer
// rendered anywhere: it only decides who appears first in the crew grid.
// Draft members are filtered out.

import rosterCopyData from "./roster-copy/index.json";
import membersIndex from "./.generated/members-index.json";
import { normaliseBlocks, type Block } from "@/lib/blocks";

export type Member = {
  slug: string;
  name: string;
  role: string;
  photo: string;
  photoAlt: string;
  index: string;
  bio?: string;
};

type RosterCopyShape = {
  about?: {
    heading?: string;
    subhead?: string;
    story?: string;
    oneLine?: string;
    crewHeading?: string;
    crewSubhead?: string;
  } | null;
  topSections?: unknown;
  bottomSections?: unknown;
};

const copy = rosterCopyData as unknown as RosterCopyShape;

// Optional CMS fields arrive as null when cleared in /admin; guard them so
// a legal save can never crash /roster at import time.
export const aboutCopy = {
  heading: copy.about?.heading ?? "",
  subhead: copy.about?.subhead ?? "",
  story: copy.about?.story ?? "",
  oneLine: copy.about?.oneLine ?? "",
  crewHeading: copy.about?.crewHeading ?? "",
  crewSubhead: copy.about?.crewSubhead ?? "",
};
export const rosterTopSections: Block[] = normaliseBlocks(copy.topSections);
export const rosterBottomSections: Block[] = normaliseBlocks(copy.bottomSections);

const PUBLIC_DIR = "/images/members/";

type RawMember = {
  slug?: string;
  name?: string;
  role?: string;
  photo?: string;
  photoAlt?: string;
  index?: string;
  bio?: string;
  draft?: boolean;
};

const raw = membersIndex as unknown as RawMember[];

export const members: Member[] = raw
  .filter((m) => m.draft !== true)
  .map((m) => ({
    slug: m.slug ?? "",
    name: m.name ?? "",
    role: m.role ?? "",
    photo: PUBLIC_DIR + (m.photo ?? ""),
    photoAlt: m.photoAlt && m.photoAlt.length > 0 ? m.photoAlt : `${m.name ?? ""} portrait`,
    index: m.index ?? "99",
    bio: m.bio && m.bio.length > 0 ? m.bio : undefined,
  }))
  .sort((a, b) => a.index.localeCompare(b.index));
