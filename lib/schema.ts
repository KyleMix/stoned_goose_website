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

import type { Organization, WithContext } from "schema-dts";

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
