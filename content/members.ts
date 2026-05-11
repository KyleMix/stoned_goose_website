// Members (crew) shim. Reads:
//   - content/roster-copy/index.json (aboutCopy + pillars share this singleton)
//   - content/.generated/members-index.json (collection, consolidated at prebuild)
//
// Sorted by the `index` display-order field (two-digit string padding the
// "/01" label on /roster).

import rosterCopyData from "./roster-copy/index.json";
import membersIndex from "./.generated/members-index.json";

export type Member = {
  slug: string;
  name: string;
  role: string;
  photo: string;
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

type RawMember = {
  slug?: string;
  name?: string;
  role?: string;
  photo?: string;
  index?: string;
  bio?: string;
};

const raw = membersIndex as RawMember[];

export const members: Member[] = raw
  .map((m) => ({
    slug: m.slug ?? "",
    name: m.name ?? "",
    role: m.role ?? "",
    photo: PUBLIC_DIR + (m.photo ?? ""),
    index: m.index ?? "99",
    bio: m.bio && m.bio.length > 0 ? m.bio : undefined,
  }))
  .sort((a, b) => a.index.localeCompare(b.index));
