// Build-your-show estimator config for /book. Options score toward one of
// the three real production packages managed in the CMS (pricing-tiers).
// House rule: no invented numbers. The estimator only ever recommends a
// package that exists in the CMS, quoting its real price string.

import { pricingTiers } from "./services";

export type PlannerOption = {
  label: string;
  /** Plain-language fragment used in the Cal.com notes summary. */
  summary: string;
  score: number;
};

export type PlannerQuestion = {
  id: string;
  label: string;
  options: PlannerOption[];
};

export const plannerCopy = {
  eyebrow: "Build your show",
  subtitle:
    "Three picks and we'll point you at the right package. Ballpark only: the real quote comes out of the call.",
  applyLabel: "Book a call about this ↗",
  applyHint: "Your picks ride along as notes on the booking.",
  fallbackLabel: "Send it as a quote ↗",
  resultEyebrow: "Suggested package",
};

export const plannerQuestions: PlannerQuestion[] = [
  {
    id: "planning",
    label: "What are you planning?",
    options: [
      { label: "Live comedy show", summary: "a live comedy show", score: 0 },
      { label: "Film a set or special", summary: "filming a set or special", score: 1 },
      { label: "Podcast or media", summary: "podcast or media work", score: 1 },
      { label: "Festival or multi-day", summary: "a festival or multi-day run", score: 3 },
    ],
  },
  {
    id: "audience",
    label: "How big is the room?",
    options: [
      { label: "Under 50", summary: "under 50 seats", score: 0 },
      { label: "50 to 150", summary: "50 to 150 seats", score: 1 },
      { label: "Over 150", summary: "over 150 seats", score: 2 },
    ],
  },
];

export const plannerAddOns: PlannerOption[] = [
  { label: "Video capture", summary: "video capture", score: 1 },
  { label: "Podcast capture", summary: "podcast capture", score: 1 },
  { label: "Marketing recap kit", summary: "a marketing recap kit", score: 1 },
];

export type PlannerTier = (typeof pricingTiers)[number];

// Score bands map to the CMS packages by name. If the owner renames or
// removes packages in the CMS, fall back along the ladder so the estimator
// never recommends something that does not exist.
export function recommendTier(score: number): PlannerTier | null {
  if (pricingTiers.length === 0) return null;
  const byName = (name: string) =>
    pricingTiers.find((t) => t.name.toLowerCase() === name);
  if (score >= 4) return byName("premium") ?? pricingTiers[0];
  if (score >= 2) return byName("pro") ?? pricingTiers[0];
  return byName("starter") ?? pricingTiers[pricingTiers.length - 1];
}
