// The Log Cabin Monday mic: slot format and the rolling four week window.
//
// This module is the single source of truth for the sign up rules, and it is
// imported by three things that must never disagree:
//
//   1. the page, which prints "4 of 12 spots left" and the date list,
//   2. the sign up Worker in worker/index.ts, which enforces the cap and the
//      window server side and will not take a spot for a date outside it,
//   3. scripts/test/open-mic-schedule.test.ts, which pins the rotation.
//
// So the numbers live here and not in the CMS. A slot count an editor could
// change without the Worker agreeing would let the page advertise a
// thirteenth spot the database refuses to sell, and the failure would land on
// a comic at the point of sign up rather than in review.
//
// No Date arithmetic on local time anywhere below. Dates are handled as
// "YYYY-MM-DD" civil strings and only ever converted through UTC noon, which
// is far enough from both midnights that adding seven days cannot land on the
// wrong day across a DST boundary.

import { siteCivilDate } from "./dates";

/** Minutes on stage per spot. */
export const MIC_SPOT_MINUTES = 8;

/** Spots per night. The Worker will not insert a thirteenth. */
export const MIC_SLOT_COUNT = 12;

/** Mondays on the list at any one time. */
export const MIC_WINDOW_WEEKS = 4;

/**
 * The first Monday the pre sign up list exists for. Nothing before this date
 * is ever offered, so the window does not reach back into the era when sign
 * ups happened on a clipboard at 6:00 PM.
 */
export const MIC_SERIES_START = "2026-09-28";

/** A civil date string, "YYYY-MM-DD". Compared and sorted as a string. */
export type CivilDate = string;

const CIVIL_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isCivilDate(value: unknown): value is CivilDate {
  if (typeof value !== "string" || !CIVIL_DATE.test(value)) return false;
  // Rejects "2026-02-30": the round trip only survives a real calendar date.
  return toCivil(fromCivil(value)) === value;
}

/** UTC noon on that civil day. Twelve hours clear of either midnight. */
function fromCivil(date: CivilDate): Date {
  return new Date(`${date}T12:00:00Z`);
}

function toCivil(value: Date): CivilDate {
  return value.toISOString().slice(0, 10);
}

export function addDays(date: CivilDate, days: number): CivilDate {
  const d = fromCivil(date);
  d.setUTCDate(d.getUTCDate() + days);
  return toCivil(d);
}

/** 0 Sunday through 6 Saturday, same numbering as Date#getDay. */
export function weekdayOf(date: CivilDate): number {
  return fromCivil(date).getUTCDay();
}

const MONDAY = 1;

/**
 * The Mondays currently on the list, earliest first.
 *
 * The window holds the next four Mondays, counting the current day when it is
 * itself a Monday. That one detail is the whole rotation the room asked for:
 *
 *   Monday 28 Sep, any time of day .. 28 Sep is still the front of the list
 *   Monday 28 Sep, 23:59 local ...... still there, the room is over but the
 *                                      day is not
 *   Tuesday 29 Sep, 00:00 local ..... 28 Sep drops off and 26 Oct appears
 *
 * That is "the latest one posts Tuesday morning, with the previous one deleted
 * the night before" expressed as one rule instead of two jobs that could drift
 * apart. The Worker's nightly purge deletes the rows for anything that has
 * fallen out of this window, so the delete follows the list rather than being
 * scheduled separately and hoping the two agree.
 */
export function micWindow(now: Date = new Date()): CivilDate[] {
  let first = siteCivilDate(now);
  while (weekdayOf(first) !== MONDAY) first = addDays(first, 1);
  // String comparison is date comparison for this format.
  if (first < MIC_SERIES_START) first = MIC_SERIES_START;

  return Array.from({ length: MIC_WINDOW_WEEKS }, (_, i) =>
    addDays(first, i * 7),
  );
}

/** Whether a date is one the list is currently taking sign ups for. */
export function isMicDateOpen(date: unknown, now: Date = new Date()): boolean {
  return isCivilDate(date) && micWindow(now).includes(date);
}

/**
 * "8 minutes" / "12 spots" and the rest of the shared vocabulary, so the page
 * and the Worker's error messages word the format identically.
 */
export const MIC_FORMAT_SUMMARY = `${MIC_SLOT_COUNT} spots, ${MIC_SPOT_MINUTES} minutes each`;

/** What the public availability endpoint returns. Counts only, never names. */
export type MicAvailability = {
  /** ISO Monday, earliest first. */
  date: CivilDate;
  /** Spots claimed. */
  taken: number;
  /** Spots still open. */
  remaining: number;
};

export type MicSlotsResponse = {
  slotCount: number;
  spotMinutes: number;
  dates: MicAvailability[];
};
