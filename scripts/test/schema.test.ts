// Smoke test for the schema.org JSON-LD layer. No test framework: plain
// assertions that exit non-zero on the first failure so it runs as part of
// `npm test`. Confirms the Organization entity is well-formed (so it renders on
// the home page via the root layout) and that a ComedyEvent built from a sample
// show carries the fields rich results require.
//
// Assertions run against the serialized plain objects, which is exactly what
// the <JsonLd> component injects into the page, rather than against schema-dts'
// union types.
//
// Run: npm test

import { organization, buildComedyEvent, buildVideoObject } from "../../lib/schema";
import { normalizeCuratedVideos } from "../../lib/videos";
import type { Show } from "../../content/shows";

// Round-trip through JSON so we inspect the rendered shape, not the schema-dts
// union type. This is the same serialization <JsonLd> performs.
function plain(value: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

let passed = 0;
const failures: string[] = [];

function assertEqual(actual: unknown, expected: unknown, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    passed += 1;
  } else {
    failures.push(`${label}\n    expected: ${e}\n    actual:   ${a}`);
  }
}

function assertTrue(cond: boolean, label: string) {
  if (cond) {
    passed += 1;
  } else {
    failures.push(`${label}\n    expected: truthy`);
  }
}

// Organization: the entity emitted in the root layout, so it is present on the
// home page (and every page). Assert the identity fields search engines key on.
const org = plain(organization);
// LocalBusiness subclasses Organization: one merged node carries both roles.
assertEqual(org["@type"], "LocalBusiness", "org: @type");
assertEqual(
  org["@id"],
  "https://www.stonedgooseproductions.com/#organization",
  "org: @id",
);
assertEqual(org.name, "Stoned Goose Productions", "org: name");
assertEqual(
  org["@context"],
  "https://schema.org",
  "org: @context present (renders verbatim)",
);
assertTrue(
  Array.isArray(org.sameAs) && (org.sameAs as unknown[]).length >= 3,
  "org: sameAs profiles present",
);

// A sample show with the full set of CMS fields. buildComedyEvent must map it
// to a ComedyEvent that carries name, startDate, location, and offers.url.
const sampleShow: Show = {
  id: "sample-1",
  name: "Stoned Goose Live at the Capitol",
  start: "2026-08-15T20:00:00-07:00",
  end: "2026-08-15T22:00:00-07:00",
  url: "https://eventbrite.com/e/sample",
  summary: "A night of stand-up from the Stoned Goose rotation.",
  imageUrl: "/images/shows/sample.jpg",
  imageAlt: "Sample poster",
  venue: {
    name: "Capitol Theater",
    address: "206 5th Ave SE",
    city: "Olympia",
    region: "WA",
    country: "US",
  },
  ticketUrl: "https://eventbrite.com/e/sample-tickets",
  status: "ticketed",
  ticketPrice: "$15",
  source: "manual",
};

const event = plain(buildComedyEvent(sampleShow));
const location = event.location as Record<string, unknown> | undefined;
const offers = event.offers as Record<string, unknown> | undefined;
const organizer = event.organizer as Record<string, unknown> | undefined;

assertEqual(event["@type"], "ComedyEvent", "event: @type");
assertEqual(event.name, "Stoned Goose Live at the Capitol", "event: name");
assertEqual(event.startDate, "2026-08-15T20:00:00-07:00", "event: startDate");
assertTrue(Boolean(location), "event: location present");
assertEqual(location?.name, "Capitol Theater", "event: location.name");
assertTrue(Boolean(offers), "event: offers present");
assertEqual(
  offers?.url,
  "https://eventbrite.com/e/sample-tickets",
  "event: offers.url",
);
assertEqual(offers?.price, "15", "event: offers.price parsed from $15");
// The organizer references the Organization node by @id, not a duplicated copy.
assertEqual(
  organizer?.["@id"],
  "https://www.stonedgooseproductions.com/#organization",
  "event: organizer references #organization",
);

// A bare show (no venue, no ticket link) must omit location and offers rather
// than emit empty/fake nodes.
const bareShow: Show = {
  id: "sample-2",
  name: "TBA Showcase",
  start: null,
  end: null,
  url: null,
  summary: "",
  ticketUrl: null,
  status: "tba",
  source: "manual",
};
const bareEvent = plain(buildComedyEvent(bareShow));
assertTrue(bareEvent.location === undefined, "bare event: no location asserted");
assertTrue(bareEvent.offers === undefined, "bare event: no offers asserted");

// VideoObject: curated clips are normalized with a real derived thumbnail and
// embed URL. uploadDate is emitted only when the CMS supplies publishedAt.
const [datedVideo, undatedVideo] = normalizeCuratedVideos([
  {
    url: "https://youtu.be/dQw4w9WgXcQ",
    title: "Sample Set",
    description: "A tight five from the showcase.",
    publishedAt: "2026-05-01",
  },
  { url: "https://www.youtube.com/watch?v=WKScU9V3dz4&t", title: "Untimed Clip" },
]);

const datedObj = plain(buildVideoObject(datedVideo));
assertEqual(datedObj["@type"], "VideoObject", "video: @type");
assertEqual(datedObj.name, "Sample Set", "video: name");
assertEqual(datedObj.description, "A tight five from the showcase.", "video: description");
assertEqual(
  datedObj.thumbnailUrl,
  ["https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"],
  "video: derived thumbnailUrl",
);
assertEqual(
  datedObj.embedUrl,
  "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "video: embedUrl",
);
assertEqual(datedObj.uploadDate, "2026-05-01", "video: uploadDate when supplied");

const undatedObj = plain(buildVideoObject(undatedVideo));
assertTrue(undatedObj.uploadDate === undefined, "video: no uploadDate when absent");
assertEqual(undatedObj.description, "Untimed Clip", "video: description falls back to title");

if (failures.length > 0) {
  console.error(`\nschema smoke test: ${failures.length} FAILED, ${passed} passed\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}

console.log(`schema smoke test: all ${passed} assertions passed.`);
