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
    /** Optional WhatsApp number in E.164 format without the leading +.
     *  Set to a string to render the wa.me CTA on /contact. */
    whatsapp: null as string | null,
    /** Toggle the SMS click-to-chat link on /contact. Uses the same number
     *  as the tel: link, just a different scheme. */
    smsEnabled: true,
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
  /** Podcast slots for the future "Listen" surface on /watch. Default null
   *  hides the section. Owner pastes IDs / RSS URL when the show ships. */
  podcasts: {
    spotifyShowId: null as string | null,
    applePodcastsId: null as string | null,
    rssUrl: null as string | null,
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
