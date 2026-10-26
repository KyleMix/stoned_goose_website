// Attaches headliners (content/performers) to the show list.
//
// Pure: shows, performers and the clock go in, the /shows list comes out, so
// scripts/test/performer-match.test.ts can pin every rule below without a
// build.
//
//   1. A show matches a headliner by Eventbrite ID first.
//   2. Failing that, by the headliner's name inside the show title, case
//      blind, with curly and straight apostrophes treated as one, so
//      "Ryan O’Flanagan Live in Olympia" finds "Ryan O'Flanagan".
//   3. A headliner with no matching show and a date still renders, from the
//      venue and time defaults, with no ticket link until it has an ID. When
//      the event appears it matches by rule 1 or 2 and this stand in is never
//      built, so there is no duplicate.
//   4. A show stays listed through its date at the venue and drops off the
//      next day (isStillListed in lib/dates.ts). The rest sort by start time.
//
// Prices. Eventbrite reports the total with fees (23.18 for a $20 ticket), and
// that is not the price on the flyer. Shows sold on Eventbrite print the base
// price with "+ Eventbrite fees" after it: the headliner's CMS price when one
// is set (an override), otherwise the base price the sync read from the
// event's ticket classes. A free show reads "Free". With neither, no price,
// rather than the fee inclusive total.
import type { Show } from "@/content/shows";
import type { Performer, PerformerDefaults } from "@/content/performers";
import { isStillListed, venueTimeToIso } from "@/lib/dates";

export const EVENTBRITE_FEES_NOTE = "+ Eventbrite fees";

/** Lowercase, one kind of apostrophe, single spaces. */
export function normaliseName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[‘’ʼ`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when `name` appears in `title` as whole words. "Matt Ross" is not in "Matt Rossi". */
export function titleHasName(title: string, name: string): boolean {
  const n = normaliseName(name);
  if (!n) return false;
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(n)}($|[^a-z0-9])`).test(
    normaliseName(title),
  );
}

/** The Eventbrite event ID behind a show, from the sync id or a ticket link. */
export function eventbriteIdOf(show: Show): string | null {
  const fromId = show.id.match(/^eventbrite-(\d+)$/);
  if (fromId) return fromId[1];
  const url = show.ticketUrl ?? show.url ?? "";
  const fromUrl = url.match(/eventbrite\.[a-z.]+\/e\/(?:[^/?#]*-)?(\d+)(?:[/?#]|$)/);
  return fromUrl ? fromUrl[1] : null;
}

export function eventbriteUrlFor(id: string) {
  return `https://www.eventbrite.com/e/${id}`;
}

function startMs(show: Show): number | null {
  if (!show.start) return null;
  const ms = Date.parse(show.start);
  return Number.isNaN(ms) ? null : ms;
}

// "0.00 USD", "$0", "Free". Anything else from Eventbrite includes fees.
function isFreePrice(price: string | undefined) {
  if (!price) return false;
  const p = price.trim().toLowerCase();
  return p === "free" || /^\$?0+(\.0+)?( usd)?$/.test(p);
}

function withPerformer(show: Show, performer: Performer, defaults: PerformerDefaults): Show {
  const priced = withBasePrice(show, performer.priceDisplay);
  return {
    ...priced,
    slug: performer.slug,
    performer,
    doorTime: show.doorTime ?? defaults.doors ?? undefined,
  };
}

/**
 * The price an Eventbrite show prints: the override when given, else the base
 * price from the sync, with the fees note; "Free" for a free show; otherwise
 * nothing. Non-Eventbrite shows keep the price their CMS entry wrote, plus the
 * override if a headliner set one.
 */
function withBasePrice(show: Show, override: string | null): Show {
  if (show.source !== "eventbrite") {
    return override ? { ...show, ticketPrice: override, priceNote: EVENTBRITE_FEES_NOTE } : show;
  }
  if (show.status === "free" || isFreePrice(show.ticketPrice)) {
    return { ...show, ticketPrice: "Free", priceNote: undefined };
  }
  const base = override ?? show.basePrice ?? null;
  return base
    ? { ...show, ticketPrice: base, priceNote: EVENTBRITE_FEES_NOTE }
    : { ...show, ticketPrice: undefined, priceNote: undefined };
}

/** The card for a headliner whose event is not on Eventbrite yet (rule 3). */
export function standInShow(performer: Performer, defaults: PerformerDefaults): Show | null {
  if (!performer.date || !defaults.show) return null;
  const start = venueTimeToIso(performer.date, defaults.show);
  if (!start) return null;
  const ticketUrl = performer.eventbriteId ? eventbriteUrlFor(performer.eventbriteId) : null;
  return {
    id: `performer-${performer.slug}`,
    slug: performer.slug,
    performer,
    name: defaults.city ? `${performer.name} Live in ${defaults.city}` : performer.name,
    start,
    end: null,
    url: ticketUrl,
    summary: performer.bio,
    venue: defaults.venue
      ? {
          name: defaults.venue,
          ...(defaults.address ? { address: defaults.address } : {}),
          ...(defaults.city ? { city: defaults.city } : {}),
          ...(defaults.region ? { region: defaults.region } : {}),
          country: "US",
        }
      : undefined,
    ticketUrl,
    status: ticketUrl ? "ticketed" : "tba",
    ticketPrice: performer.priceDisplay ?? undefined,
    priceNote: performer.priceDisplay ? EVENTBRITE_FEES_NOTE : undefined,
    doorTime: defaults.doors ?? undefined,
    source: "performer",
  };
}

export function attachPerformers(
  shows: Show[],
  performers: Performer[],
  defaults: PerformerDefaults,
  now: number = Date.now(),
): Show[] {
  const byShow = new Map<number, Performer>();
  const claimed = new Set<string>();

  // Rule 1 across the whole list before rule 2 anywhere, so a name match can
  // never take a headliner that an ID match further down would have claimed.
  shows.forEach((show, i) => {
    const id = eventbriteIdOf(show);
    if (!id) return;
    const p = performers.find((x) => x.eventbriteId === id && !claimed.has(x.slug));
    if (p) {
      byShow.set(i, p);
      claimed.add(p.slug);
    }
  });
  shows.forEach((show, i) => {
    if (byShow.has(i)) return;
    const p = performers.find((x) => !claimed.has(x.slug) && titleHasName(show.name, x.name));
    if (p) {
      byShow.set(i, p);
      claimed.add(p.slug);
    }
  });

  const merged = shows.map((show, i) => {
    const p = byShow.get(i);
    return p ? withPerformer(show, p, defaults) : withBasePrice(show, null);
  });

  for (const p of performers) {
    if (claimed.has(p.slug)) continue;
    const show = standInShow(p, defaults);
    if (show) merged.push(show);
  }

  // A show with no start cannot be past and cannot be placed, so it sorts last.
  return merged
    .filter((show) => show.start === null || isStillListed(show.start, now))
    .sort((a, b) => {
      const x = startMs(a);
      const y = startMs(b);
      if (x === null && y === null) return 0;
      if (x === null) return 1;
      if (y === null) return -1;
      return x - y;
    });
}
