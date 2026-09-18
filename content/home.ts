// Home page shim. Reads the CMS JSON and re-exports the typed shape.

import homeData from "./home/index.json";
import { normaliseBlocks, type Block } from "@/lib/blocks";

export type BumperVariant = {
  eyebrow: string;
  body: string;
  footnote: string;
};

export type SectionCopy = {
  eyebrow: string;
  heading: string;
  body?: string;
};

type HomeShape = {
  hero: {
    eyebrow: string;
    headline: string;
    subhead: string;
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
  };
  about: SectionCopy & { ctaLabel: string; ctaHref: string };
  services: SectionCopy;
  workingOn: SectionCopy;
  people: SectionCopy;
  contact: SectionCopy;
  marqueeWords: string[];
  bumpers: Record<"clarification" | "aside" | "outro", BumperVariant[]>;
  mission: { eyebrow: string; heading: string; body: string } | null;
};

const raw = homeData as unknown as {
  hero: {
    eyebrow?: string;
    headline?: string;
    subhead?: string;
    primary?: { label?: string; href?: string } | null;
    secondary?: { label?: string; href?: string } | null;
  };
  about?: {
    eyebrow?: string;
    heading?: string;
    body?: string;
    ctaLabel?: string;
    ctaHref?: string;
  } | null;
  services?: { eyebrow?: string; heading?: string } | null;
  workingOn?: { eyebrow?: string; heading?: string } | null;
  people?: { eyebrow?: string; heading?: string } | null;
  contact?: { eyebrow?: string; heading?: string; body?: string } | null;
  marqueeWords?: string[] | null;
  bumpers?: Partial<
    Record<"clarification" | "aside" | "outro", BumperVariant[] | null>
  > | null;
  mission?: { show?: boolean; eyebrow?: string; heading?: string; body?: string } | null;
  topSections?: unknown;
  bottomSections?: unknown;
};

// Optional CMS fields arrive as null when an editor clears them; guard every
// one so a legal save in /admin can never crash the home page at import time.
export const hero: HomeShape["hero"] = {
  eyebrow: raw.hero.eyebrow ?? "",
  headline: raw.hero.headline ?? "",
  subhead: raw.hero.subhead ?? "",
  primary: {
    label: raw.hero.primary?.label ?? "Book us",
    href: raw.hero.primary?.href ?? "#contact",
  },
  secondary: {
    label: raw.hero.secondary?.label ?? "See upcoming shows",
    href: raw.hero.secondary?.href ?? "/shows",
  },
};

export const about: HomeShape["about"] = {
  eyebrow: raw.about?.eyebrow ?? "",
  heading: raw.about?.heading ?? "",
  body: raw.about?.body ?? "",
  ctaLabel: raw.about?.ctaLabel ?? "Meet the crew",
  ctaHref: raw.about?.ctaHref ?? "/about",
};

export const servicesCopy: HomeShape["services"] = {
  eyebrow: raw.services?.eyebrow ?? "What we do",
  heading: raw.services?.heading ?? "",
};

export const workingOnCopy: HomeShape["workingOn"] = {
  eyebrow: raw.workingOn?.eyebrow ?? "Right now",
  heading: raw.workingOn?.heading ?? "",
};

export const peopleCopy: HomeShape["people"] = {
  eyebrow: raw.people?.eyebrow ?? "Who we work with",
  heading: raw.people?.heading ?? "",
};

export const contactCopy: HomeShape["contact"] = {
  eyebrow: raw.contact?.eyebrow ?? "Book us",
  heading: raw.contact?.heading ?? "",
  body: raw.contact?.body ?? "",
};

// Retained for the CMS section blocks. The home page no longer mounts the
// marquee or the bumpers: the next show now appears once, and the interludes
// were spending three full bands to say nothing. Both stay available as
// optional sections so a page can opt back in.
export const marqueeWords: string[] = raw.marqueeWords ?? [];
export const bumpers: HomeShape["bumpers"] = {
  clarification: raw.bumpers?.clarification ?? [],
  aside: raw.bumpers?.aside ?? [],
  outro: raw.bumpers?.outro ?? [],
};

function resolveMission(m: typeof raw.mission): HomeShape["mission"] {
  if (!m || typeof m !== "object") return null;
  if (m.show !== true) return null;
  return {
    eyebrow: m.eyebrow ?? "",
    heading: m.heading ?? "",
    body: m.body ?? "",
  };
}

export const mission: HomeShape["mission"] = resolveMission(raw.mission);
export const homeTopSections: Block[] = normaliseBlocks(raw.topSections);
export const homeBottomSections: Block[] = normaliseBlocks(raw.bottomSections);
