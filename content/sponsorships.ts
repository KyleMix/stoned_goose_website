// Sponsorships shim. Reads the CMS singleton.

import sponsorshipsData from "./sponsorships/index.json";

export type SponsorshipStat = {
  label: string;
  value: string | null;
  detail: string;
};

export type Sponsor = {
  name: string;
  logo: string;
  url?: string;
};

type SponsorshipShape = {
  stats?: { label: string; value: string; detail: string }[] | null;
  tiers?: { name: string; price: string; deliverables: string[] }[] | null;
  sponsors?: { name: string; logo: string; url?: string | null }[] | null;
};

const raw = sponsorshipsData as unknown as SponsorshipShape;

// Both lists are optional in the CMS; a cleared list arrives as null and
// must not crash /book at import time.
// Empty value strings render the placeholder dash on the page. House rule:
// no invented stats. The CMS surfaces the value field as optional copy.
export const sponsorshipStats: SponsorshipStat[] = (raw.stats ?? []).map((s) => ({
  label: s.label,
  value: s.value ? s.value : null,
  detail: s.detail,
}));

export const sponsorshipTiers = raw.tiers ?? [];

// Real sponsors only. An entry missing a name or a logo is dropped rather than
// rendered half-formed, and an empty list makes <SponsorStrip> render nothing,
// so /book simply has no strip until there is something true to put in it.
export const sponsors: Sponsor[] = (raw.sponsors ?? [])
  .filter((s) => s?.name?.trim() && s?.logo?.trim())
  .map((s) => ({
    name: s.name.trim(),
    logo: s.logo.trim(),
    url: s.url?.trim() || undefined,
  }));
