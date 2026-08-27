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
