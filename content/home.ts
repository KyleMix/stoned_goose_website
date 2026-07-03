// Home page shim. Reads the CMS JSON and re-exports the typed shape.

import homeData from "./home/index.json";
import { normaliseBlocks, type Block } from "@/lib/blocks";

export type BumperVariant = {
  eyebrow: string;
  body: string;
  footnote: string;
};

type HomeShape = {
  hero: {
    eyebrow: string;
    italicLine: string;
    headline: string;
    subhead: string;
    primary: { title: string; body: string; label: string; href: string };
    secondary: { title: string; body: string; label: string; href: string };
    tertiary: { label: string; href: string }[];
  };
  marqueeWords: string[];
  bumpers: Record<"clarification" | "aside" | "outro", BumperVariant[]>;
  mission: { eyebrow: string; heading: string; body: string } | null;
};

const raw = homeData as unknown as {
  hero: Omit<HomeShape["hero"], "tertiary"> & {
    tertiary?: { label: string; href: string }[] | null;
  };
  marqueeWords?: string[] | null;
  bumpers?: Partial<
    Record<"clarification" | "aside" | "outro", BumperVariant[] | null>
  > | null;
  mission?: { show?: boolean; eyebrow?: string; heading?: string; body?: string } | null;
  topSections?: unknown;
  bottomSections?: unknown;
};

// Optional CMS lists arrive as null when an editor clears them; guard every
// array so a legal save in /admin can never crash the home page.
export const hero: HomeShape["hero"] = {
  ...raw.hero,
  tertiary: raw.hero.tertiary ?? [],
};
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
