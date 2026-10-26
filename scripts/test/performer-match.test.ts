// Pins how headliners attach to shows (lib/performer-match.ts). No test
// framework: plain assertions that exit non-zero, like the other files here.
//
// The rule that matters most is the hand off: a headliner with no Eventbrite
// event renders a "Tickets coming soon" stand in, and the moment the event
// exists (by ID, or by name before anyone pastes the ID) the stand in is gone
// and exactly one card remains.
//
// Run: npm test

import { attachPerformers, titleHasName } from "../../lib/performer-match";
import type { Show } from "../../content/shows";
import type { Performer, PerformerDefaults } from "../../content/performers";

let passed = 0;
const failures: string[] = [];

function eq(actual: unknown, expected: unknown, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed += 1;
  else failures.push(`${label}\n    expected: ${e}\n    actual:   ${a}`);
}

const NOW = Date.parse("2026-10-26T12:00:00Z");

const defaults: PerformerDefaults = {
  venue: "Eagles Grand Ballroom",
  address: "805 4th Avenue East",
  city: "Olympia",
  region: "WA",
  doors: "6:00 PM",
  show: "7:00 PM",
};

function performer(over: Partial<Performer> & Pick<Performer, "slug" | "name">): Performer {
  return {
    eventbriteId: null,
    date: null,
    priceDisplay: "$20",
    creditsLabel: null,
    credits: [],
    bio: "",
    images: { cutout: null, arch: null, flyer: null },
    ...over,
  };
}

function event(id: string, name: string, start: string, price = "23.18 USD"): Show {
  return {
    id: `eventbrite-${id}`,
    name,
    start,
    end: null,
    url: `https://www.eventbrite.com/e/x-tickets-${id}`,
    ticketUrl: `https://www.eventbrite.com/e/x-tickets-${id}`,
    summary: "",
    status: price.startsWith("0") ? "free" : "ticketed",
    ticketPrice: price,
    source: "eventbrite",
  };
}

// --- matching -------------------------------------------------------------

{
  const shows = attachPerformers(
    [event("111", "An Evening of Comedy", "2027-02-28T03:00:00Z")],
    [performer({ slug: "ryan", name: "Ryan O'Flanagan", eventbriteId: "111" })],
    defaults,
    NOW,
  );
  eq(shows.map((s) => s.slug), ["ryan"], "ID match wins even when the title lacks the name");
  eq(shows[0].ticketPrice, "$20", "headliner price is the base price, not Eventbrite's total");
  eq(shows[0].priceNote, "+ Eventbrite fees", "headliner price carries the fees note");
  eq(shows[0].doorTime, "6:00 PM", "headliner picks up the default doors time");
}

{
  const shows = attachPerformers(
    [event("222", "Ryan O’Flanagan Live in Olympia | Stand-Up Comedy at the Eagles", "2027-02-28T03:00:00Z")],
    [performer({ slug: "ryan", name: "Ryan O'Flanagan" })],
    defaults,
    NOW,
  );
  eq(shows.map((s) => s.slug), ["ryan"], "name fallback treats curly and straight apostrophes alike");
  eq(shows.length, 1, "a name match leaves no stand in behind");
}

eq(titleHasName("MATT ROSS Live", "Matt Ross"), true, "name match is case blind");
eq(titleHasName("Matt Rossi Live", "Matt Ross"), false, "name match is whole words only");

{
  // The ID belongs to the second event; the first only shares the name.
  const shows = attachPerformers(
    [
      event("1", "Matt Ross Live", "2027-01-01T03:00:00Z"),
      event("2", "Matt Ross Live, late show", "2027-01-01T05:00:00Z"),
    ],
    [performer({ slug: "matt-ross", name: "Matt Ross", eventbriteId: "2" })],
    defaults,
    NOW,
  );
  eq(
    shows.map((s) => s.slug ?? s.id),
    ["eventbrite-1", "matt-ross"],
    "an ID match anywhere in the list beats a name match earlier in it",
  );
}

// --- stand ins and the hand off --------------------------------------------

const fulchiron = performer({
  slug: "matt-fulchiron",
  name: "Matt Fulchiron",
  date: "2027-06-19",
  priceDisplay: null,
});

{
  const shows = attachPerformers([], [fulchiron], defaults, NOW);
  eq(shows.length, 1, "a headliner with no event still gets a card");
  eq(shows[0].ticketUrl, null, "the stand in has no ticket link");
  eq(shows[0].status, "tba", "the stand in is not ticketed");
  eq(shows[0].start, "2027-06-20T02:00:00.000Z", "stand in starts at the default show time, Pacific");
  eq(shows[0].ticketPrice, undefined, "no priceDisplay means no price");
  eq(shows[0].venue?.name, "Eagles Grand Ballroom", "stand in takes the default venue");
}

{
  const live = event("999", "Matt Fulchiron Live in Olympia", "2027-06-20T02:00:00Z");
  const byName = attachPerformers([live], [fulchiron], defaults, NOW);
  eq(byName.length, 1, "event live but ID not pasted yet: one card, matched by name");
  eq(byName[0].source, "eventbrite", "that card is the live event, not the stand in");

  const byId = attachPerformers([live], [{ ...fulchiron, eventbriteId: "999" }], defaults, NOW);
  eq(byId.length, 1, "ID pasted: still one card");
  eq(byId[0].ticketUrl, live.ticketUrl, "and it links to the live event");
}

{
  const shows = attachPerformers([], [{ ...fulchiron, eventbriteId: "999" }], defaults, NOW);
  eq(
    shows[0].ticketUrl,
    "https://www.eventbrite.com/e/999",
    "ID pasted before the next sync: the stand in links straight to Eventbrite",
  );
}

// --- dates and prices -------------------------------------------------------

{
  const shows = attachPerformers(
    [
      event("3", "Later", "2027-05-09T02:00:00Z"),
      event("4", "Past", "2026-01-01T02:00:00Z"),
      event("5", "Open Mic", "2026-11-12T02:00:00Z", "0.00 USD"),
      event("6", "Someone Else", "2027-02-01T02:00:00Z"),
    ],
    [performer({ slug: "old", name: "Old Comic", date: "2026-01-01" })],
    defaults,
    NOW,
  );
  eq(shows.map((s) => s.name), ["Open Mic", "Someone Else", "Later"], "past shows drop off, the rest sort by date");
  eq(shows[0].ticketPrice, "Free", "a free Eventbrite show reads Free, not 0.00 USD");
  eq(shows[1].ticketPrice, undefined, "a paid show with no base price shows no fee inclusive total");
}

if (failures.length > 0) {
  console.error(`[performer-match.test] ${failures.length} failure(s):\n`);
  for (const f of failures) console.error("  " + f);
  process.exit(1);
}
console.log(`[performer-match.test] ${passed} assertions passed.`);
