// Pins the open mic sign up rotation.
//
// The four week window is the one piece of this feature that nobody can eyeball
// in review: it is date arithmetic whose output depends on the day it runs, and
// it is read by three things that must agree (the page, the sign up Worker's
// date check, and the Worker's nightly purge). A regression here does not throw.
// It quietly offers a Monday that has already happened, or drops the Monday a
// comic was about to sign up for, or purges a list a day early.
//
// So the cases below fix real instants in Olympia time and assert exactly which
// four Mondays are on the board, including the Tuesday 00:00 turnover, the
// series start clamp, and the two weekends either side of a DST change.
//
// Run via `npm test`.

import {
  MIC_SERIES_START,
  MIC_SLOT_COUNT,
  MIC_SPOT_MINUTES,
  MIC_WINDOW_WEEKS,
  addDays,
  isCivilDate,
  isMicDateOpen,
  micWindow,
  weekdayOf,
} from "../../lib/open-mic-schedule";

let failures = 0;
let checks = 0;

function assert(cond: boolean, message: string) {
  checks += 1;
  if (cond) return;
  failures += 1;
  console.error(`  ✗ ${message}`);
}

function eq(actual: unknown, expected: unknown, message: string) {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${message}\n      got:      ${JSON.stringify(actual)}\n      expected: ${JSON.stringify(expected)}`,
  );
}

/** An instant, written as Olympia wall clock time with its real UTC offset. */
function at(local: string) {
  const d = new Date(local);
  assert(!Number.isNaN(d.getTime()), `test wrote an unparseable instant: ${local}`);
  return d;
}

// ------------------------------------------------------- the format constants

eq(MIC_SLOT_COUNT, 12, "twelve spots a night");
eq(MIC_SPOT_MINUTES, 8, "eight minutes a spot");
eq(MIC_WINDOW_WEEKS, 4, "four Mondays on the board");
eq(MIC_SERIES_START, "2026-09-28", "the list starts Monday 28 September 2026");
eq(weekdayOf(MIC_SERIES_START), 1, "the series start is a Monday");

// ------------------------------------------------------------- civil dates

assert(isCivilDate("2026-09-28"), "a real date is a civil date");
assert(!isCivilDate("2026-02-30"), "30 February is not a date");
assert(!isCivilDate("2026-9-28"), "an unpadded month is not the format");
assert(!isCivilDate("2026-09-28T00:00:00Z"), "an instant is not a civil date");
assert(!isCivilDate(""), "an empty string is not a civil date");
assert(!isCivilDate(null), "null is not a civil date");

eq(addDays("2026-09-28", 7), "2026-10-05", "seven days on from a Monday");
eq(addDays("2026-10-31", 1), "2026-11-01", "crossing a month boundary");
eq(addDays("2026-12-31", 1), "2027-01-01", "crossing a year boundary");
// The DST-proofing claim in lib/open-mic-schedule.ts, stated as a test. US
// clocks go back on Sunday 1 November 2026, inside this jump.
eq(
  addDays("2026-10-26", 7),
  "2026-11-02",
  "seven days across a fall-back weekend is still seven days",
);
eq(
  addDays("2027-03-08", 7),
  "2027-03-15",
  "seven days across a spring-forward weekend is still seven days",
);

// -------------------------------------------------------------- the window

// Every window is four consecutive Mondays, whenever it is asked for. Walk a
// full year day by day so nothing depends on which examples were chosen below.
{
  let date = "2026-09-01";
  let walked = 0;
  while (date < "2027-09-01") {
    // Midday local, so the instant is unambiguous whatever the offset.
    const window = micWindow(new Date(`${date}T19:00:00Z`));
    if (window.length !== MIC_WINDOW_WEEKS) {
      assert(false, `${date}: window had ${window.length} Mondays`);
      break;
    }
    const allMondays = window.every((d) => weekdayOf(d) === 1);
    const consecutive = window.every((d, i) => i === 0 || d === addDays(window[i - 1], 7));
    const inOrder = window.every((d, i) => i === 0 || d > window[i - 1]);
    const started = window.every((d) => d >= MIC_SERIES_START);
    if (!allMondays || !consecutive || !inOrder || !started) {
      assert(
        false,
        `${date}: window is not four consecutive Mondays from the series start: ${window.join(", ")}`,
      );
      break;
    }
    date = addDays(date, 1);
    walked += 1;
  }
  assert(walked >= 364, `walked only ${walked} days of the year`);
}

// Before the series starts, the board already shows the opening four Mondays
// rather than reaching back to a Monday the list never existed for.
eq(
  micWindow(at("2026-09-22T09:00:00-07:00")),
  ["2026-09-28", "2026-10-05", "2026-10-12", "2026-10-19"],
  "the Tuesday before launch shows the first four Mondays",
);
eq(
  micWindow(at("2026-09-01T09:00:00-07:00")),
  ["2026-09-28", "2026-10-05", "2026-10-12", "2026-10-19"],
  "weeks before launch, the window is still clamped to the series start",
);

// The turnover, which is the rule the room actually asked for: the Monday that
// has just happened stays on the board until midnight, then drops, and a
// fourth Monday appears in its place.
eq(
  micWindow(at("2026-09-28T09:00:00-07:00")),
  ["2026-09-28", "2026-10-05", "2026-10-12", "2026-10-19"],
  "Monday morning: tonight is still the front of the board",
);
eq(
  micWindow(at("2026-09-28T21:30:00-07:00")),
  ["2026-09-28", "2026-10-05", "2026-10-12", "2026-10-19"],
  "Monday after the show: tonight has not dropped off yet",
);
eq(
  micWindow(at("2026-09-28T23:59:00-07:00")),
  ["2026-09-28", "2026-10-05", "2026-10-12", "2026-10-19"],
  "one minute before midnight Monday: still four, still starting tonight",
);
eq(
  micWindow(at("2026-09-29T00:01:00-07:00")),
  ["2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26"],
  "one minute after midnight: last night drops, 26 October posts",
);
eq(
  micWindow(at("2026-09-29T08:00:00-07:00")),
  ["2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26"],
  "Tuesday morning proper: the new Monday is up",
);

// The timezone is the point of siteCivilDate. At 5:00 PM Monday in Olympia it
// is already Tuesday in UTC, and a window built on UTC dates would roll the
// board over mid-afternoon while the room is still filling up.
eq(
  micWindow(new Date("2026-09-28T17:00:00-07:00")),
  ["2026-09-28", "2026-10-05", "2026-10-12", "2026-10-19"],
  "5:00 PM Monday in Olympia is not yet Tuesday, whatever UTC thinks",
);
eq(
  micWindow(new Date("2026-09-29T00:00:00Z")),
  ["2026-09-28", "2026-10-05", "2026-10-12", "2026-10-19"],
  "midnight UTC on Tuesday is still Monday afternoon at the venue",
);

// And across the November fall-back, where local midnight moves from 07:00 to
// 08:00 UTC. Both Worker cron hours have to land after the turnover.
eq(
  micWindow(new Date("2026-11-10T00:30:00-08:00")),
  ["2026-11-16", "2026-11-23", "2026-11-30", "2026-12-07"],
  "Tuesday 00:30 PST, after the clocks went back: the board has turned over",
);

// --------------------------------------------------------- isMicDateOpen

{
  const now = at("2026-10-07T12:00:00-07:00"); // A Wednesday.
  const window = micWindow(now);
  eq(window, ["2026-10-12", "2026-10-19", "2026-10-26", "2026-11-02"], "mid-week window");

  for (const date of window) {
    assert(isMicDateOpen(date, now), `${date} is on the board and should be open`);
  }
  assert(
    !isMicDateOpen("2026-10-05", now),
    "a Monday that has already happened is not open",
  );
  assert(
    !isMicDateOpen("2026-11-09", now),
    "the Monday after the board is not open yet",
  );
  assert(
    !isMicDateOpen("2026-10-13", now),
    "a Tuesday is never open, even inside the window's span",
  );
  assert(!isMicDateOpen("nonsense", now), "junk is not open");
  assert(!isMicDateOpen(undefined, now), "undefined is not open");
}

if (failures > 0) {
  console.error(`open-mic-schedule test: ${failures} failure(s) of ${checks}.`);
  process.exit(1);
}
console.log(
  `open-mic-schedule test: ${checks} checks pass. ${MIC_SLOT_COUNT} spots x ${MIC_SPOT_MINUTES} min, ${MIC_WINDOW_WEEKS} Mondays, from ${MIC_SERIES_START}.`,
);
