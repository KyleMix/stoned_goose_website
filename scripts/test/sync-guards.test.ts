// Guards on the sync scripts that write content/.generated/.
//
// Those JSON files are committed on purpose: the site is a static export and
// the deploy has no credentials, so the last good sync has to ship in the
// repo. That makes every writer a potential deleter. The 6-hourly cron
// auto-commits shows.json and pro-shows.json under one routine message, so a
// wipe that lands there is not going to be caught by reading the diff.
//
// The hazard is not a network outage, which is loud and already handled. It
// is the request that succeeds and returns nothing: a revoked scope, a
// mistyped organizer id, a club redesign, a bot interstitial served with a
// 200. Those parse to an empty list, which is indistinguishable from a
// cleared calendar unless you check what was there a moment ago.
//
// These assertions pin that check in both writers.
//
// Run: npm test

import { reconcileClub } from "../sync-pro-shows";
import { hasUpcoming } from "../sync-shows";
import type { ProShow } from "../../content/pro-shows";
import type { Show } from "../../content/shows";

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

function assert(cond: boolean, label: string) {
  if (cond) passed += 1;
  else failures.push(label);
}

// Fixed clock so the test does not drift. Cutoff is a day back, matching the
// script.
const NOW = new Date("2026-06-15T12:00:00.000Z");
const CUTOFF = new Date("2026-06-14T12:00:00.000Z");

function proShow(clubSlug: string, start: string, title = "Show"): ProShow {
  return {
    id: `${clubSlug}-${start}`,
    clubSlug,
    title,
    start,
    url: `https://example.com/${clubSlug}`,
  };
}

const TACOMA_FUTURE = [
  proShow("tacoma", "2026-06-20T20:00:00.000Z", "Headliner"),
  proShow("tacoma", "2026-06-27T20:00:00.000Z", "Late show"),
];
const TACOMA_PAST = [proShow("tacoma", "2026-01-05T20:00:00.000Z", "Old")];
const OTHER_CLUB = [proShow("emerald", "2026-06-21T20:00:00.000Z", "Elsewhere")];

// --- reconcileClub: transport failure ---------------------------------------

{
  const r = reconcileClub("tacoma", null, [...TACOMA_FUTURE], CUTOFF);
  assertEqual(r.shows, TACOMA_FUTURE, "fetch failed: keeps previous upcoming");
  assert(r.warning !== null, "fetch failed: warns");
}

// --- reconcileClub: the case this test exists for ---------------------------
// Parsed cleanly, found nothing, but the club had listings. That is a broken
// adapter far more often than a cleared calendar.

{
  const r = reconcileClub("tacoma", [], [...TACOMA_FUTURE], CUTOFF);
  assertEqual(r.shows, TACOMA_FUTURE, "parsed 0 with history: keeps previous");
  assert(r.warning !== null, "parsed 0 with history: warns");
  assert(
    (r.warning ?? "").includes("broken scrape"),
    "parsed 0 with history: warning names the likely cause",
  );
}

// --- reconcileClub: a club that really has gone dark must still empty --------
// Otherwise the guard would pin stale listings forever. Two things drain it:
// no previous upcoming shows means nothing is kept, and shows that fall past
// the cutoff stop counting as history.

{
  const r = reconcileClub("tacoma", [], [], CUTOFF);
  assertEqual(r.shows, [], "parsed 0 with no history: stays empty");
  assertEqual(r.warning, null, "parsed 0 with no history: no warning");
}

{
  const r = reconcileClub("tacoma", [], [...TACOMA_PAST], CUTOFF);
  assertEqual(r.shows, [], "parsed 0, only past history: stays empty");
  assertEqual(r.warning, null, "parsed 0, only past history: no warning");
}

// --- reconcileClub: a real result is trusted --------------------------------

{
  const fresh = [proShow("tacoma", "2026-07-01T20:00:00.000Z", "New")];
  const r = reconcileClub("tacoma", fresh, [...TACOMA_FUTURE], CUTOFF);
  assertEqual(r.shows, fresh, "real fetch: replaces previous outright");
  assertEqual(r.warning, null, "real fetch: no warning");
}

// A shrink is not a wipe. Going 2 -> 1 is ordinary and must not be blocked.
{
  const fewer = [TACOMA_FUTURE[0]];
  const r = reconcileClub("tacoma", fewer, [...TACOMA_FUTURE], CUTOFF);
  assertEqual(r.shows, fewer, "fewer shows than before: accepted");
}

// --- reconcileClub: never borrows another club's shows ----------------------

{
  const previous = [...TACOMA_FUTURE, ...OTHER_CLUB];
  const r = reconcileClub("tacoma", [], previous, CUTOFF);
  assertEqual(r.shows, TACOMA_FUTURE, "keeps only its own club's shows");
}

{
  const r = reconcileClub("emerald", null, [...TACOMA_FUTURE], CUTOFF);
  assertEqual(r.shows, [], "unknown club with no history of its own: empty");
}

// --- reconcileClub: unparseable dates are not history -----------------------

{
  const junk = [proShow("tacoma", "not a date", "Junk")];
  const r = reconcileClub("tacoma", [], junk, CUTOFF);
  assertEqual(r.shows, [], "unparseable previous dates do not count as history");
}

// --- hasUpcoming: the same decision on the Eventbrite side ------------------

function show(start: string | null): Show {
  return {
    id: `s-${start}`,
    name: "Show",
    start,
    end: null,
    url: null,
    summary: "",
  } as Show;
}

const NOW_MS = NOW.getTime();

assert(hasUpcoming([show("2026-06-20T20:00:00.000Z")], NOW_MS), "hasUpcoming: future");
assert(!hasUpcoming([], NOW_MS), "hasUpcoming: empty list");
assert(
  !hasUpcoming([show("2026-01-05T20:00:00.000Z")], NOW_MS),
  "hasUpcoming: past only, so an empty write stays allowed",
);
assert(!hasUpcoming([show(null)], NOW_MS), "hasUpcoming: null start");
assert(!hasUpcoming([show("not a date")], NOW_MS), "hasUpcoming: unparseable start");
assert(
  hasUpcoming(
    [show("2026-01-05T20:00:00.000Z"), show("2026-06-20T20:00:00.000Z")],
    NOW_MS,
  ),
  "hasUpcoming: mixed past and future",
);

if (failures.length > 0) {
  console.error(
    `\nsync guards test: ${failures.length} FAILED, ${passed} passed\n`,
  );
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}

console.log(`sync guards test: all ${passed} assertions passed.`);
