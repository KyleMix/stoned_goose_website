export const hero = {
  eyebrow: "Now booking corporate events + media production",
  // Hero italic line (right column on the baseline grid). Owner-editable.
  // Drafted in Adult Swim register. Replaces the previous duplicated
  // "live. local. comedy." which still rides on the marquee.
  italicLine: "lights on. jokes loaded.",
  headline: "Stoned Goose Productions",
  subhead:
    "Crafting cinematic stand-up, curated showcases, and comedy chaos across your city.",
  primary: {
    title: "Book a Show",
    body: "Bring a high-impact comedy night to your venue, company event, or private experience.",
    label: "Start Booking",
    href: "/services",
  },
  secondary: {
    title: "Get Tickets",
    body: "See what's next in Olympia and across the South Sound, then lock in your seats.",
    label: "Browse Shows",
    href: "/shows",
  },
  tertiary: [
    { label: "Sponsor a Show", href: "/sponsor" },
    { label: "Comic Submissions", href: "/submit" },
  ],
};

export const services = [
  { title: "Live Show Production", slug: "live-show-production" },
  { title: "Comedian Booking", slug: "comedian-booking" },
  { title: "Corporate Events", slug: "corporate-events" },
  { title: "Media & Podcasts", slug: "media-and-podcasts" },
  { title: "Headshots & Promo Shoots", slug: "headshots-and-promo" },
];

// Marquee uses brand copy + roster names + service areas. No invented taglines.
// TODO(owner): "5,000+ Tickets Sold" is a stat. House rule says no invented stats.
// Confirm the figure or replace the line.
export const marqueeWords = [
  "Stoned Goose Productions",
  "Live. Local. Comedy.",
  "Olympia",
  "Lacey",
  "Tacoma",
  "South Sound",
  "Now Booking",
  "5,000+ Tickets Sold",
  "Pacific Northwest",
];

// Bumper rotation. Each slot has alternates picked once per session
// (sessionStorage-seeded). Adult Swim register. No em dashes. Owner-editable.
// First entry in each slot is the original copy; alternates are drafts.
export type BumperVariant = {
  eyebrow: string;
  // Use \n in body to add a line break.
  body: string;
  footnote: string;
};

export const bumpers: Record<"clarification" | "aside" | "outro", BumperVariant[]> = {
  clarification: [
    {
      eyebrow: "clarification",
      body: "We are a comedy production company.\nWe are not a goose.",
      footnote: "thank you for visiting.",
    },
    {
      eyebrow: "disclosure",
      body: "Yes, that is the real name.\nYes, the period is yellow.",
      footnote: "we made it on purpose.",
    },
    {
      eyebrow: "for the record",
      body: "We book comics.\nWe shoot specials.\nWe turn the lights on.",
      footnote: "in roughly that order.",
    },
  ],
  aside: [
    {
      eyebrow: "aside",
      body: "We do other things too.",
      footnote: "it's listed below.",
    },
    {
      eyebrow: "interlude",
      body: "There is more to this than shows.",
      footnote: "see the menu.",
    },
    {
      eyebrow: "by the way",
      body: "Live comedy is the headline.\nThe rest of the operation is real too.",
      footnote: "scroll for receipts.",
    },
  ],
  outro: [
    {
      eyebrow: "end of bumper",
      body: "Goodnight, Olympia.",
      footnote: "please drive carefully.",
    },
    {
      eyebrow: "stay tuned",
      body: "More shows on the calendar.",
      footnote: "see you in the room.",
    },
    {
      eyebrow: "fade to black",
      body: "Tape rolls.\nLights cut.\nWe do it again Tuesday.",
      footnote: "thanks for watching.",
    },
  ],
};

// Optional mission strip on home, slotted between bumpers. Renders only when
// `body` is populated. Owner provides copy. House rule: no em dashes,
// no invented manifesto.
export const mission: { eyebrow: string; heading: string; body: string } | null = null;
