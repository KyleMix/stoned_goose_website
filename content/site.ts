export const site = {
  name: "Stoned Goose Productions",
  shortName: "Stoned Goose",
  tagline: "LIVE. LOCAL. COMEDY.",
  url: "https://www.stonedgooseproductions.com",
  description:
    "Live shows, comedian booking, corporate events, media production, and headshots across Olympia, Lacey, Tacoma, and the South Sound.",
  contact: {
    email: "kyle@stonedgooseproductions.com",
    phone: "(360) 323-0667",
    phoneTel: "+13603230667",
    address: "Stoned Goose Productions, Comedy-friendly location",
    locality: "Olympia",
    region: "WA",
  },
  social: {
    instagram: "https://www.instagram.com/stonedgooseproductions/",
    facebook: "https://www.facebook.com/profile.php?id=61573095812128",
    tiktok: "https://www.tiktok.com/@stonedgooseproductions",
    youtube: "https://www.youtube.com/@stonedgooseproductions",
    patreon: "https://www.patreon.com/cw/StonedGooseProductions",
    eventbrite: "https://www.eventbrite.com/o/stoned-goose-productions-107337391771",
    fourthwall: "https://stoned-goose-productions-zgm-shop.fourthwall.com",
  },
  serviceAreas: [
    "Olympia, WA",
    "Lacey, WA",
    "Tacoma, WA",
    "South Sound",
    "Thurston County, WA",
    "Pierce County, WA",
  ],
} as const;

// Optional press quotes. Renders a slim row on home + /sponsor when populated.
// Owner-editable. House rule: no invented quotes. Each quote must be real and
// attributable. Drop entries here when press lands.
export type PressItem = {
  quote: string;
  outlet: string;
  url?: string;
};

export const press: PressItem[] = [];

export const nav = [
  { label: "Shows", href: "/shows" },
  { label: "Members", href: "/members" },
  { label: "Comedians", href: "/comedians" },
  { label: "Watch", href: "/watch" },
  { label: "Services", href: "/services" },
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
] as const;
