// Site config shim. Reads the CMS-managed JSON written by the admin
// at /admin and re-exports the typed shape components have always imported.

import siteData from "./site/index.json";

export type PressItem = {
  quote: string;
  outlet: string;
  url?: string;
};

export type NavLink = {
  label: string;
  href: string;
};

export type FooterColumn = {
  heading: string;
  items: NavLink[];
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

// Defaults applied when the CMS JSON has not been edited yet. They mirror
// what used to be hardcoded in this file so the site keeps working before the
// first save from /admin.
const DEFAULT_NAV: NavLink[] = [
  { label: "Shows", href: "/shows" },
  { label: "Open Mics", href: "/open-mics" },
  { label: "Watch", href: "/watch" },
  { label: "Roster", href: "/roster" },
  { label: "Book Us", href: "/book" },
  { label: "Shop", href: "/shop" },
];

const DEFAULT_FOOTER: {
  locality: string;
  creditLine: string;
  creditHref: string;
  columns: FooterColumn[];
} = {
  locality: "Olympia, WA",
  creditLine: "Website Design by Kyle Mixon.",
  creditHref: "",
  columns: [
    {
      heading: "Explore",
      items: [
        { label: "Home", href: "/" },
        { label: "Shows", href: "/shows" },
        { label: "Open Mics", href: "/open-mics" },
        { label: "Watch", href: "/watch" },
        { label: "Roster", href: "/roster" },
        { label: "Shop", href: "/shop" },
      ],
    },
    {
      heading: "Work With Us",
      items: [
        { label: "Book Us", href: "/book" },
        { label: "Sponsor a Show", href: "/book#sponsors" },
      ],
    },
    {
      heading: "Connect",
      items: [
        { label: "Tickets.", href: "/shows" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ],
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
  nav?: NavLink[];
  footer?: {
    locality?: string;
    creditLine?: string;
    creditHref?: string;
    columns?: FooterColumn[];
  };
  seo?: {
    keywords?: string[];
    defaultOgImage?: string;
  };
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

export const nav: NavLink[] =
  raw.nav && raw.nav.length > 0 ? raw.nav : DEFAULT_NAV;

export const footer = {
  locality: raw.footer?.locality?.length ? raw.footer.locality : DEFAULT_FOOTER.locality,
  creditLine: raw.footer?.creditLine?.length ? raw.footer.creditLine : DEFAULT_FOOTER.creditLine,
  creditHref: raw.footer?.creditHref?.length ? raw.footer.creditHref : DEFAULT_FOOTER.creditHref,
  columns:
    raw.footer?.columns && raw.footer.columns.length > 0
      ? raw.footer.columns
      : DEFAULT_FOOTER.columns,
};

export const seo = {
  keywords: raw.seo?.keywords ?? [],
  defaultOgImage:
    raw.seo?.defaultOgImage && raw.seo.defaultOgImage.length > 0
      ? raw.seo.defaultOgImage
      : null,
};
