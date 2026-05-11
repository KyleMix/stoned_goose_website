// Site config shim. Reads the Keystatic-managed JSON written by the admin
// at /admin and re-exports the typed shape components have always imported.

import siteData from "./site/index.json";

export type PressItem = {
  quote: string;
  outlet: string;
  url?: string;
};

type SiteShape = {
  name: string;
  shortName: string;
  tagline: string;
  url: string;
  description: string;
  contact: {
    email: string;
    phone: string;
    phoneTel: string;
    whatsapp: string | null;
    smsEnabled: boolean;
    address: string;
    locality: string;
    region: string;
  };
  social: {
    instagram: string;
    facebook: string;
    tiktok: string;
    youtube: string;
    patreon: string;
    eventbrite: string;
    fourthwall: string;
    youtubeChannelId: string;
    facebookPageId: string;
  };
  podcasts: {
    spotifyShowId: string | null;
    applePodcastsId: string | null;
    rssUrl: string | null;
  };
  serviceAreas: readonly string[];
};

// Normalize the JSON shape so the types and defaults match what call sites
// expect. Empty strings on optional fields are coerced to null.
const raw = siteData as unknown as {
  name: string;
  shortName: string;
  tagline: string;
  url: string;
  description: string;
  contact: {
    email: string;
    phone: string;
    phoneTel: string;
    whatsapp?: string;
    smsEnabled?: boolean;
    address: string;
    locality: string;
    region: string;
  };
  social: SiteShape["social"];
  podcasts: {
    spotifyShowId?: string;
    applePodcastsId?: string;
    rssUrl?: string;
  };
  serviceAreas: string[];
  press?: PressItem[];
};

export const site: SiteShape = {
  name: raw.name,
  shortName: raw.shortName,
  tagline: raw.tagline,
  url: raw.url,
  description: raw.description,
  contact: {
    email: raw.contact.email,
    phone: raw.contact.phone,
    phoneTel: raw.contact.phoneTel,
    whatsapp: raw.contact.whatsapp ? raw.contact.whatsapp : null,
    smsEnabled: raw.contact.smsEnabled ?? true,
    address: raw.contact.address,
    locality: raw.contact.locality,
    region: raw.contact.region,
  },
  social: raw.social,
  podcasts: {
    spotifyShowId: raw.podcasts.spotifyShowId ? raw.podcasts.spotifyShowId : null,
    applePodcastsId: raw.podcasts.applePodcastsId ? raw.podcasts.applePodcastsId : null,
    rssUrl: raw.podcasts.rssUrl ? raw.podcasts.rssUrl : null,
  },
  serviceAreas: raw.serviceAreas,
};

export const press: PressItem[] = raw.press ?? [];

export const nav = [
  { label: "Shows", href: "/shows" },
  { label: "Open Mics", href: "/open-mics" },
  { label: "Watch", href: "/watch" },
  { label: "Roster", href: "/roster" },
  { label: "Book Us", href: "/book" },
  { label: "Shop", href: "/shop" },
] as const;
