// Members (crew) shim. Reads:
//   - content/roster-copy/index.json (aboutCopy + pillars share this singleton)
//   - content/.generated/members-index.json (collection, consolidated at prebuild)
//
// Sorted by the `index` display-order field (two-digit string padding the
// "/01" label on /roster). Draft members are filtered out.

import rosterCopyData from "./roster-copy/index.json";
import membersIndex from "./.generated/members-index.json";

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
  about: {
    heading: string;
    subhead: string;
    crewHeading: string;
    crewSubhead: string;
  };
  pillars: { title: string; body: string }[];
};

const copy = rosterCopyData as unknown as RosterCopyShape;

export const aboutCopy = copy.about;
export const pillars = copy.pillars;

const PUBLIC_DIR = "/images/members/";

// Mirror the path-doubling guard from content/comedians.ts so a manually
// pasted /images/... path resolves cleanly instead of being prefixed twice.
function resolvePhoto(value: string | undefined): string {
  if (!value) return PUBLIC_DIR;
  if (/^(https?:)?\//.test(value)) return value;
  return PUBLIC_DIR + value;
}

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

const raw = membersIndex as RawMember[];

export const members: Member[] = raw
  .filter((m) => m.draft !== true)
  .map((m) => ({
    slug: m.slug ?? "",
    name: m.name ?? "",
    role: m.role ?? "",
    photo: resolvePhoto(m.photo),
    photoAlt: m.photoAlt && m.photoAlt.length > 0 ? m.photoAlt : `${m.name ?? ""} portrait`,
    index: m.index ?? "99",
    bio: m.bio && m.bio.length > 0 ? m.bio : undefined,
  }))
  .sort((a, b) => a.index.localeCompare(b.index));
