// Smoke test for the open mic normalization layer. No test framework: plain
// assertions that exit non-zero on the first failure so it can run as the
// project's `npm test`. Exercises the known-bad records from the real CMS data
// and asserts clean output.
//
// Run: npm test

import {
  normalizeMic,
  normalizeVenueName,
  normalizeTime,
  normalizeAddress,
  normalizeNotes,
  classifyHost,
  classifySignup,
  formatDayTime,
} from "../../lib/open-mics/normalize";
import type { OpenMic } from "../../content/open-mics";

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

// Venue title-casing + correction map.
assertEqual(normalizeVenueName("8201 launge"), "8201 Lounge", "venue: 8201 launge");
assertEqual(
  normalizeVenueName("Conercopia Comedy Club"),
  "Cornercopia Comedy Club",
  "venue: Conercopia",
);
assertEqual(normalizeVenueName("Flight path"), "Flight Path", "venue: Flight path");
assertEqual(
  normalizeVenueName("The underground coffee house"),
  "The Underground Coffee House",
  "venue: underground coffee house",
);
assertEqual(normalizeVenueName("McKay's Taphouse"), "McKay's Taphouse", "venue: preserves McKay's");

// Time parsing.
assertEqual(normalizeTime("8PM").start, "8:00 PM", "time: 8PM");
assertEqual(normalizeTime("10:15pm/").start, "10:15 PM", "time: dangling slash");
assertEqual(normalizeTime("10").start, "10:00 PM", "time: bare hour defaults PM");
assertEqual(normalizeTime("12am").start, "12:00 AM", "time: 12am");
const splitTime = normalizeTime("Sign-up/Start: 8:30pm/9pm");
assertEqual(splitTime.signup, "8:30 PM", "time: signup of split");
assertEqual(splitTime.start, "9:00 PM", "time: start of split");
const rangeTime = normalizeTime("Sign Up/Show Start: 7pm - 8pm");
assertEqual(rangeTime.start, "8:00 PM", "time: range start");

// Day + time label.
assertEqual(
  formatDayTime("Thursday", normalizeTime("8pm")),
  "Thu - 8:00 PM",
  "dayTime: Thu - 8:00 PM",
);

// Address normalization: no duplicated city / state / zip.
assertEqual(
  normalizeAddress("289 NW Chehalis Ave Chehalis WA", "Chehalis", "WA"),
  { street: "289 NW Chehalis Ave", full: "289 NW Chehalis Ave, Chehalis, WA" },
  "address: no-comma trailing city/state",
);
assertEqual(
  normalizeAddress("1310 Tacoma Ave S, Tacoma, WA 98402", "Tacoma", "WA"),
  { street: "1310 Tacoma Ave S", full: "1310 Tacoma Ave S, Tacoma, WA" },
  "address: comma city/state/zip",
);

// Host classification.
assertEqual(
  classifyHost("theshowmepro@gmail.com"),
  { kind: "link", href: "mailto:theshowmepro@gmail.com", label: "theshowmepro@gmail.com" },
  "host: email becomes mailto link",
);
assertEqual(
  classifyHost("https://www.instagram.com/k_hossom/"),
  { kind: "link", href: "https://www.instagram.com/k_hossom/", label: "@k_hossom" },
  "host: instagram url becomes handle link",
);
assertEqual(classifyHost("Brandon White"), { kind: "name", text: "Brandon White" }, "host: plain name");
assertEqual(classifyHost(""), { kind: "hidden" }, "host: empty hidden");

// Signup classification.
assertEqual(
  classifySignup("https://docs.google.com/forms/d/abc"),
  { kind: "url", href: "https://docs.google.com/forms/d/abc" },
  "signup: external url",
);
assertEqual(classifySignup("Show Up Go Up"), { kind: "note", text: "Show Up Go Up" }, "signup: free text note");
assertEqual(classifySignup(""), { kind: "none" }, "signup: empty");

// Notes cleanup: dangling slashes and empty Set fragments.
assertEqual(
  normalizeNotes("Free. Set 5(closer20)/"),
  "Free. Set 5(closer20).",
  "notes: trailing slash after set value",
);
assertEqual(
  normalizeNotes("Only Comedy. Free. Set 4/. Wheelchair accessible. Parking. on site"),
  "Only Comedy. Free. Set 4. Wheelchair accessible. Parking. on site.",
  "notes: Set 4/ slash stripped",
);

// End-to-end on a single messy record.
const messy: OpenMic = {
  id: "8201-launge-tacoma-wednesday",
  name: "8201 launge",
  venue: "8201 launge",
  address: "8201 Pacific Ave",
  city: "Tacoma",
  region: "WA",
  lat: 47.24,
  lng: -122.45,
  day: "Wednesday",
  time: "7:30pm",
  frequency: "biweekly",
  weeks: ["1st", "3rd"],
  notes: "Free. Set 5(closer20)/",
};
const normalized = normalizeMic(messy);
assertEqual(normalized.nameDisplay, "8201 Lounge", "e2e: nameDisplay");
assertEqual(normalized.dayTimeDisplay, "Wed - 7:30 PM", "e2e: dayTimeDisplay");
assertEqual(normalized.addressDisplay, "8201 Pacific Ave, Tacoma, WA", "e2e: addressDisplay");
assertEqual(normalized.notesDisplay, "Free. Set 5(closer20).", "e2e: notesDisplay");

if (failures.length > 0) {
  console.error(`\nopen-mics normalize smoke test: ${failures.length} FAILED, ${passed} passed\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}

console.log(`open-mics normalize smoke test: all ${passed} assertions passed.`);
