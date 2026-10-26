// Date and time formatting, pinned to the venue timezone.
//
// This site is a static export. Every date string is formatted once, at build
// time, on whatever machine ran the build, and then frozen into the HTML. CI
// runs in UTC, so an unpinned Intl.DateTimeFormat rendered a 7:00 PM Olympia
// show as "Sun, Oct 18, 2:00 AM" instead of "Sat, Oct 17, 7:00 PM": wrong time
// AND wrong day, on the primary content of the site.
//
// Pinning the zone makes the output identical no matter where the build runs.
// Shows are all Olympia and the South Sound, so the venue zone is the right
// one to render in: a listing should read in the time the audience will turn
// up, not the reader's local time.
export const SITE_TIME_ZONE = "America/Los_Angeles";

function safeDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function format(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions,
): string | null {
  const d = safeDate(value);
  if (!d) return null;
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: SITE_TIME_ZONE,
  }).format(d);
}

/** "Sat, Oct 17, 2026" */
export function formatShowDate(value: string | null | undefined) {
  return format(value, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Sat, Oct 17" for tight spaces. */
export function formatShowDateShort(value: string | null | undefined) {
  return format(value, { weekday: "short", month: "short", day: "numeric" });
}

/** "7:00 PM" */
export function formatShowTime(value: string | null | undefined) {
  return format(value, { hour: "numeric", minute: "2-digit" });
}

/** "Oct 17, 2026" for posts and non-event dates. */
export function formatPostDate(value: string | null | undefined) {
  return format(value, { month: "short", day: "numeric", year: "numeric" });
}

/** "Oct 17" for the tightest slots: nav ticker, 404 next-show line. */
export function formatShowMonthDay(value: string | null | undefined) {
  return format(value, { month: "short", day: "numeric" });
}

/** "October 17" */
export function formatMonthDay(value: string | null | undefined) {
  return format(value, { month: "long", day: "numeric" });
}

/** "Sat · Feb 27, 2027" for the date band on a show card. */
export function formatShowDateBand(value: string | null | undefined) {
  const weekday = format(value, { weekday: "short" });
  const date = format(value, { month: "short", day: "numeric", year: "numeric" });
  return weekday && date ? `${weekday} · ${date}` : null;
}

/** "Friday, December 11, 2026" for alt text, where abbreviations read badly. */
export function formatShowDateLong(value: string | null | undefined) {
  return format(value, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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
