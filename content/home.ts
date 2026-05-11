// Home page shim. Reads the Keystatic JSON and re-exports the typed shape.

import homeData from "./home/index.json";

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
  mission?:
    | { discriminant: true; value: { eyebrow: string; heading: string; body: string } }
    | { discriminant: false; value: null };
};

export const hero = raw.hero;
export const marqueeWords = raw.marqueeWords;
export const bumpers = raw.bumpers;
export const mission: HomeShape["mission"] =
  raw.mission && raw.mission.discriminant === true ? raw.mission.value : null;
