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
  hero: HomeShape["hero"];
  marqueeWords: string[];
  bumpers: Record<"clarification" | "aside" | "outro", BumperVariant[]>;
  // Current shape: { show, eyebrow, heading, body }. Legacy shape:
  // { discriminant, value }. Both resolve to the mission object or null.
  mission?:
    | { show?: boolean; eyebrow?: string; heading?: string; body?: string }
    | { discriminant: true; value: { eyebrow: string; heading: string; body: string } }
    | { discriminant: false; value: null };
  topSections?: unknown;
  bottomSections?: unknown;
};

export const hero = raw.hero;
export const marqueeWords = raw.marqueeWords;
export const bumpers = raw.bumpers;

function resolveMission(m: typeof raw.mission): HomeShape["mission"] {
  if (!m || typeof m !== "object") return null;
  if ("discriminant" in m) {
    return m.discriminant === true ? m.value : null;
  }
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
