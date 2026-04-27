// Stats render with the literal `value` string. Until the owner provides
// verified figures, leave value as `null` and the page renders a placeholder
// dash. House rule: no invented stats. Mirror any updates in
// public/sponsorship-one-sheet.txt when one lands.
export type SponsorshipStat = {
  label: string;
  value: string | null;
  detail: string;
};

export const sponsorshipStats: SponsorshipStat[] = [
  {
    label: "Monthly in-room audience",
    value: null,
    detail: "Across recurring Olympia + South Sound comedy events.",
  },
  {
    label: "Average social impressions",
    value: null,
    detail: "Organic + collaborative partner reach each month.",
  },
  {
    label: "Video views",
    value: null,
    detail: "Short-form clips, highlights, and promo reels.",
  },
];

export const sponsorshipTiers = [
  {
    name: "Bronze",
    price: "$500 / show",
    deliverables: [
      "Logo placement on event graphics and ticketing page.",
      "1 live host shoutout during the show.",
      "Brand mention in one pre-show social post.",
    ],
  },
  {
    name: "Silver",
    price: "$1,250 / month",
    deliverables: [
      "Everything in Bronze, plus featured placement in monthly promo reel.",
      "2 host shoutouts (opening + closing).",
      "Branded table signage at sponsored events.",
      "Monthly recap email with attendance and engagement stats.",
    ],
  },
  {
    name: "Gold",
    price: "$2,500 / month",
    deliverables: [
      "Everything in Silver, plus title sponsorship positioning.",
      "Custom 30-second ad read in each sponsored show.",
      "Dedicated sponsored social video clip each month.",
      "On-site activation support for giveaways or sampling.",
    ],
  },
];
