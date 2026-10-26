// Date and time formatting, pinned to the venue timezone.
//
// This site is a static export. Every date string is formatted once, at build
// time, on whatever machine ran the build, and then frozen into the HTML. CI
// runs in UTC, so an unpinned Intl.DateTimeFormat rendered a 7:00 PM Olympia
// show as "Sun, Oct 18, 2:00 AM" instead of "Sat, Oct 17, 7:00 PM": wrong time
// AND wrong day, on the primary content of the site.
//
// Pinning the zone makes the output identical no matter where the build runs.
// A listing reads in the time the audience will turn up, not the reader's
// local time, so a show renders in its venue's zone: showTimeZone() below.
// Most shows are Olympia and the South Sound, so Pacific is the default for
// everything else (and for any show whose zone is unknown). A show outside
// Pacific prints its zone with the time ("8:00 PM CST"), because the page is
// read from Olympia.
export const SITE_TIME_ZONE = "America/Los_Angeles";

// US state code -> zone, for shows whose zone the sync did not record
// (manual CMS shows, or synced data from before the sync stored it). States
// split across zones take their most populous one.
const STATE_ZONES: Record<string, string> = {
  WA: "America/Los_Angeles", OR: "America/Los_Angeles", CA: "America/Los_Angeles", NV: "America/Los_Angeles",
  AZ: "America/Phoenix",
  ID: "America/Boise", MT: "America/Denver", WY: "America/Denver", UT: "America/Denver", CO: "America/Denver", NM: "America/Denver",
  ND: "America/Chicago", SD: "America/Chicago", NE: "America/Chicago", KS: "America/Chicago", OK: "America/Chicago",
  TX: "America/Chicago", MN: "America/Chicago", IA: "America/Chicago", MO: "America/Chicago", AR: "America/Chicago",
  LA: "America/Chicago", WI: "America/Chicago", IL: "America/Chicago", MS: "America/Chicago", AL: "America/Chicago",
  TN: "America/Chicago",
  MI: "America/Detroit", IN: "America/Indiana/Indianapolis", KY: "America/New_York", OH: "America/New_York",
  GA: "America/New_York", FL: "America/New_York", SC: "America/New_York", NC: "America/New_York",
  VA: "America/New_York", WV: "America/New_York", DC: "America/New_York", MD: "America/New_York",
  DE: "America/New_York", PA: "America/New_York", NJ: "America/New_York", NY: "America/New_York",
  CT: "America/New_York", RI: "America/New_York", MA: "America/New_York", VT: "America/New_York",
  NH: "America/New_York", ME: "America/New_York",
  AK: "America/Anchorage", HI: "Pacific/Honolulu",
};

function isValidZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

/**
 * The zone a show renders in: the one Eventbrite reports for the event, else
 * the venue state's zone, else Pacific.
 */
export function showTimeZone(show: {
  timeZone?: string | null;
  venue?: { region?: string | null } | null;
}): string {
  if (show.timeZone && isValidZone(show.timeZone)) return show.timeZone;
  const fromState = STATE_ZONES[show.venue?.region?.trim().toUpperCase() ?? ""];
  return fromState ?? SITE_TIME_ZONE;
}

function safeDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function format(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions,
  timeZone: string = SITE_TIME_ZONE,
): string | null {
  const d = safeDate(value);
  if (!d) return null;
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone }).format(d);
}

/** "Sat, Oct 17, 2026" */
export function formatShowDate(value: string | null | undefined, timeZone?: string) {
  return format(
    value,
    { weekday: "short", month: "short", day: "numeric", year: "numeric" },
    timeZone,
  );
}

/** "Sat, Oct 17" for tight spaces. */
export function formatShowDateShort(value: string | null | undefined, timeZone?: string) {
  return format(value, { weekday: "short", month: "short", day: "numeric" }, timeZone);
}

/** "7:00 PM", or "8:00 PM CST" for a show outside Pacific. */
export function formatShowTime(value: string | null | undefined, timeZone: string = SITE_TIME_ZONE) {
  return format(
    value,
    {
      hour: "numeric",
      minute: "2-digit",
      ...(timeZone !== SITE_TIME_ZONE ? { timeZoneName: "short" as const } : {}),
    },
    timeZone,
  );
}

/** "Oct 17, 2026" for posts and non-event dates. */
export function formatPostDate(value: string | null | undefined) {
  return format(value, { month: "short", day: "numeric", year: "numeric" });
}

/** "Oct 17" for the tightest slots: nav ticker, 404 next-show line. */
export function formatShowMonthDay(value: string | null | undefined, timeZone?: string) {
  return format(value, { month: "short", day: "numeric" }, timeZone);
}

/** "October 17" */
export function formatMonthDay(value: string | null | undefined) {
  return format(value, { month: "long", day: "numeric" });
}

/** "Sat · Feb 27, 2027" for the date band on a show card. */
export function formatShowDateBand(value: string | null | undefined, timeZone?: string) {
  const weekday = format(value, { weekday: "short" }, timeZone);
  const date = format(value, { month: "short", day: "numeric", year: "numeric" }, timeZone);
  return weekday && date ? `${weekday} · ${date}` : null;
}

/** "Friday, December 11, 2026" for alt text, where abbreviations read badly. */
export function formatShowDateLong(value: string | null | undefined, timeZone?: string) {
  return format(
    value,
    { weekday: "long", month: "long", day: "numeric", year: "numeric" },
    timeZone,
  );
}

// Venue wall clock minus UTC, in ms, at the given instant.
function venueOffsetMs(utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SITE_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const wall = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return wall - utcMs;
}

/**
 * "2027-06-19" + "7:00 PM" at the venue -> "2027-06-20T02:00:00.000Z".
 *
 * For a show that has a date and a door time but no Eventbrite event yet. The
 * wall clock is read in the venue zone, so the result does not depend on where
 * the build runs, and DST is resolved for that date rather than for today.
 * Returns null for anything that does not parse, so a bad CMS value drops the
 * show's time rather than inventing one.
 */
export function venueTimeToIso(date: string, time: string): string | null {
  const d = date.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const t = time.trim().match(/^(\d{1,2}):(\d{2})\s*([AP])M$/i);
  if (!d || !t) return null;
  const hour12 = Number(t[1]);
  if (hour12 < 1 || hour12 > 12) return null;
  const hour = (hour12 % 12) + (t[3].toUpperCase() === "P" ? 12 : 0);
  const wall = Date.UTC(Number(d[1]), Number(d[2]) - 1, Number(d[3]), hour, Number(t[2]));
  if (Number.isNaN(wall)) return null;
  // Two passes: the offset at the guessed instant can differ from the offset
  // at the true one when the guess lands across a DST change.
  let utc = wall - venueOffsetMs(wall);
  utc = wall - venueOffsetMs(utc);
  return new Date(utc).toISOString();
}

/** "2026-12-11": the calendar date at the venue. Sorts as a string. */
export function venueDateKey(
  value: string | number | Date | null | undefined,
  timeZone: string = SITE_TIME_ZONE,
): string | null {
  if (value === null || value === undefined) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Whether a show is still listed: through the whole of its date at the venue,
 * gone from the next day. A 7 PM show is still on the page at 11 PM that
 * night and comes off the morning after, rather than vanishing at curtain.
 *
 * "Its date" and "today" are both read in the venue's zone (pass
 * showTimeZone(show)), so a New Orleans show comes off at midnight Central.
 *
 * The sync, the build, and the stand-in cards all use this one rule, so a
 * show cannot be dropped by one and kept by another.
 */
export function isStillListed(
  start: string | null | undefined,
  now: number = Date.now(),
  timeZone: string = SITE_TIME_ZONE,
): boolean {
  const show = venueDateKey(start, timeZone);
  const today = venueDateKey(now, timeZone);
  return show !== null && today !== null && show >= today;
}
