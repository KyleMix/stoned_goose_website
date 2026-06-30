// Centralized schema.org JSON-LD objects and factories.
//
// Everything here is typed against schema-dts (Google's TypeScript types for
// schema.org). A malformed object fails `npm run typecheck`, which is how we
// validate our structured data. Pair any object built here with the <JsonLd>
// server component (components/json-ld.tsx) to render it.
//
// Rule: the markup must match what the page actually renders. Never assert data
// the page does not show. When the CMS lacks a field, omit it rather than fake
// a value.

import type {
  BreadcrumbList,
  ComedyEvent,
  EventStatusType,
  ItemList,
  Offer,
  Organization,
  Place,
  VideoObject,
  WithContext,
} from "schema-dts";
import type { Show } from "@/content/shows";
import type { YouTubeVideo } from "@/content/feeds/types";

// Canonical production origin. Hard-coded so the @id graph node and absolute
// URLs stay stable regardless of the build environment.
const SITE_URL = "https://www.stonedgooseproductions.com";

// Stable @id for the Organization node. ComedyEvent.organizer references this
// so search engines resolve the show's organizer to the same entity emitted in
// the root layout on every page.
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

// 1. ORGANIZATION
// Loaded in the root layout, so it renders on every page. Shipped verbatim as
// the brand's canonical entity record.
export const organization: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: "Stoned Goose Productions",
  legalName: "Stoned Goose Productions LLC",
  url: "https://www.stonedgooseproductions.com",
  logo: "https://www.stonedgooseproductions.com/brand/stoned-goose-logo-full.png",
  image: "https://www.stonedgooseproductions.com/opengraph.jpg",
  description:
    "Live shows, comedy production, podcast and media work, and the Open Mic Explorer for the Pacific Northwest. Based in Olympia, working across Lacey, Tacoma, and the South Sound.",
  foundingLocation: "Olympia, WA",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Olympia",
    addressRegion: "WA",
    addressCountry: "US",
  },
  areaServed: [
    "Olympia, WA",
    "Lacey, WA",
    "Tacoma, WA",
    "South Sound",
    "Pacific Northwest",
  ],
  founder: [
    { "@type": "Person", name: "Kyle Mixon" },
    { "@type": "Person", name: "Joseph Humphrey" },
    { "@type": "Person", name: "Brendan Meeks" },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "bookings",
    email: "kyle@stonedgooseproductions.com",
    telephone: "+1-360-323-0667",
  },
  sameAs: [
    "https://www.instagram.com/stonedgooseproductions/",
    "https://www.facebook.com/profile.php?id=61573095812128",
    "https://www.tiktok.com/@stonedgooseproductions",
    "https://www.youtube.com/@stonedgooseproductions",
    "https://www.patreon.com/cw/StonedGooseProductions",
  ],
};

// 2. COMEDYEVENT
// -----------------------------------------------------------------------------

// Absolutize a CMS image path so the markup carries a fully-qualified URL.
function absoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}

// Pull a clean numeric amount out of a display price like "$10" or "$12.50".
// Returns null for ranges, "Free", or anything we cannot assert as one price.
function parsePrice(raw: string | undefined): string | null {
  if (!raw) return null;
  const match = raw.trim().match(/^\$?(\d+(?:\.\d{1,2})?)$/);
  return match ? match[1] : null;
}

// The CMS Show model has no cancelled/postponed flag yet, so every synced show
// is EventScheduled. When that field lands, map it here (EventCancelled /
// EventPostponed / EventRescheduled) rather than defaulting blindly.
function eventStatusFor(_show: Show): EventStatusType {
  return "https://schema.org/EventScheduled";
}

// Build a ComedyEvent from a Keystatic show. Returns the object WITHOUT an
// @context so it can nest inside the shows-index ItemList; wrap it yourself for
// a standalone per-show emit. Fields the CMS does not carry are omitted, never
// faked, so the markup matches what the page renders.
export function buildComedyEvent(show: Show): ComedyEvent {
  const event: ComedyEvent = {
    "@type": "ComedyEvent",
    name: show.name,
    eventStatus: eventStatusFor(show),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: { "@id": ORGANIZATION_ID },
  };

  if (show.start) event.startDate = show.start;
  if (show.end) event.endDate = show.end;
  if (show.summary) event.description = show.summary;
  if (show.imageUrl) event.image = [absoluteUrl(show.imageUrl)];

  // Only emit a Place when there is a real venue name. A bare "TBD" asserts a
  // location the page does not actually show.
  if (show.venue?.name) {
    const place: Place = {
      "@type": "Place",
      name: show.venue.name,
      address: {
        "@type": "PostalAddress",
        ...(show.venue.address ? { streetAddress: show.venue.address } : {}),
        ...(show.venue.city ? { addressLocality: show.venue.city } : {}),
        ...(show.venue.region ? { addressRegion: show.venue.region } : {}),
        addressCountry: show.venue.country ?? "US",
      },
    };
    event.location = place;
  }

  // Offer only when there is a place to buy or RSVP. Price is included only when
  // it parses to a single clean amount; otherwise we keep the offer but drop the
  // price rather than ship a malformed value.
  const offerUrl = show.ticketUrl ?? show.url;
  if (offerUrl) {
    const price = parsePrice(show.ticketPrice);
    const offer: Offer = {
      "@type": "Offer",
      url: offerUrl,
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
      ...(price ? { price } : {}),
    };
    event.offers = offer;
  }

  return event;
}

// 3. VIDEOOBJECT
// -----------------------------------------------------------------------------

// Build a VideoObject for a featured YouTube clip. Sourced from the synced
// channel feed, which carries the only fields we can assert truthfully: the
// feed has no separate description, so the title doubles as both name and
// description. Manual fallback clips (title + URL only, no thumbnail or upload
// date) are intentionally not passed here; we skip them rather than fake the
// required uploadDate / thumbnailUrl.
export function buildVideoObject(video: YouTubeVideo): WithContext<VideoObject> {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.title,
    thumbnailUrl: [video.thumbnailUrl],
    uploadDate: video.publishedAt,
    contentUrl: video.url,
    embedUrl: `https://www.youtube.com/embed/${video.id}`,
  };
}

// Wrap a set of shows as a single ItemList of ComedyEvents for the shows index.
// Callers must guard on a non-empty list: per spec, emit nothing when there are
// no shows rather than an empty ItemList.
export function buildShowsItemList(shows: Show[]): WithContext<ItemList> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: shows.map((show, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: buildComedyEvent(show),
    })),
  };
}

// 4. BREADCRUMBLIST
// -----------------------------------------------------------------------------

// Friendly labels for the fixed top-level routes. Anything not listed (a
// dynamic detail slug) falls back to a title-cased slug unless the caller
// passes an explicit lastLabel.
const BREADCRUMB_LABELS: Record<string, string> = {
  shows: "Shows",
  "open-mics": "Open Mics",
  watch: "Watch",
  roster: "Roster",
  book: "Book Us",
  shop: "Shop",
  contact: "Contact",
};

function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

// Build a BreadcrumbList from a route path (e.g. "/shop/metal-goose"), always
// rooted at Home. Detail pages should pass `lastLabel` with the real visible
// title (a comedian name, product name, page title) so the final crumb matches
// what the page shows instead of a title-cased slug guess.
export function buildBreadcrumbs(
  path: string,
  lastLabel?: string,
): WithContext<BreadcrumbList> {
  const segments = path.split("/").filter(Boolean);
  const crumbs: Array<{ name: string; url: string }> = [
    { name: "Home", url: `${SITE_URL}/` },
  ];

  let acc = "";
  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    const isLast = i === segments.length - 1;
    const name =
      isLast && lastLabel ? lastLabel : BREADCRUMB_LABELS[seg] ?? titleCaseSlug(seg);
    crumbs.push({ name, url: `${SITE_URL}${acc}` });
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

// 5. OPEN MICS (stub, intentionally NOT wired into any page)
// -----------------------------------------------------------------------------
// Do NOT mark the 134 crowd-sourced recurring third-party mics as Event /
// ComedyEvent. Google penalizes structured data that does not faithfully
// describe verifiable content, and these listings are unverified: hosts move,
// venues close, and cadences drift without us confirming them. Asserting a
// dated Event (let alone a ticket/RSVP offer) for each one would claim a
// freshness we cannot stand behind.
//
// buildMicSchema graduates to real Event + eventSchedule markup only after the
// "last confirmed" freshness system exists (see OPEN_MICS_DATA_QUALITY.md).
// It throws today so it can never be wired in by accident before then.
export function buildMicSchema(_mic: { name: string; venue: string }): never {
  throw new Error(
    "buildMicSchema is a stub. Do not mark unverified recurring mics as " +
      "Event/ComedyEvent until the 'last confirmed' freshness system exists. " +
      "See lib/schema.ts and OPEN_MICS_DATA_QUALITY.md.",
  );
}

// The ONLY structured data the open-mics page is allowed to emit today: a plain
// ItemList of venue names, with no event, date, host, or offer claims. This is
// safe because it asserts nothing beyond "these venues exist," which the page
// already shows in its list.
export function buildMicListSchema(
  mics: ReadonlyArray<{ nameDisplay: string }>,
): WithContext<ItemList> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Open mics tracked by the Open Mic Explorer",
    itemListElement: mics.map((mic, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: mic.nameDisplay,
    })),
  };
}
