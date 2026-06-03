// Sponsorships shim. Reads the CMS singleton.

import sponsorshipsData from "./sponsorships/index.json";

export type SponsorshipStat = {
  label: string;
  value: string | null;
  detail: string;
};

type SponsorshipShape = {
  stats: { label: string; value: string; detail: string }[];
  tiers: { name: string; price: string; deliverables: string[] }[];
};

const raw = sponsorshipsData as unknown as SponsorshipShape;

// Empty value strings render the placeholder dash on the page. House rule:
// no invented stats. The CMS surfaces the value field as optional copy.
export const sponsorshipStats: SponsorshipStat[] = raw.stats.map((s) => ({
  label: s.label,
  value: s.value ? s.value : null,
  detail: s.detail,
}));

export const sponsorshipTiers = raw.tiers;
