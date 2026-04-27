import generatedShows from "./.generated/shows.json";

export type Show = {
  id: string;
  name: string;
  start: string | null;
  end: string | null;
  url: string | null;
  summary: string;
  imageUrl?: string | null;
  venue?: {
    name?: string;
    address?: string;
    city?: string;
    region?: string;
    country?: string;
  };
  /** Direct ticketing URL. When null, CTA reflects `status`. */
  ticketUrl?: string | null;
  /** "ticketed" → "Get tickets". "free" → "Free / at the door".
   *  "tba" → "Details soon". Defaults to "tba" when omitted. */
  status?: "ticketed" | "free" | "tba";
  /** Display-only ticket price. e.g. "$15", "Pay-what-you-can". */
  ticketPrice?: string;
  /** Display-only door time. e.g. "Doors 7pm". */
  doorTime?: string;
  /** Where this row came from. Set by sync scripts. Manual entries default
   *  to "manual". Lets the owner audit the merge order at a glance. */
  source?: "eventbrite" | "facebook" | "manual";
};

// Static export, no API. Hand-edited by the owner when the sync scripts
// aren't wired up. When content/.generated/shows.json exists and is non-empty
// (written by scripts/sync-shows.ts at prebuild), that file overrides this list.
const manualShows: Show[] = [];

const fromGenerated =
  Array.isArray(generatedShows) && generatedShows.length > 0
    ? (generatedShows as Show[])
    : null;

export const upcomingShows: Show[] = fromGenerated ?? manualShows;

// Optional presale strip on /shows. Renders only when populated.
// Owner-editable: drop in a code, expiration date (YYYY-MM-DD), and venue name
// to push a presale without touching components. Set back to null when expired.
export type Presale = {
  code: string;
  expiresAt: string;
  venueName: string;
};

export const presale: Presale | null = null;

export const featuredSpecial = {
  title: "Xavier Rake",
  subtitle: "Full Comedy Special",
  blurb:
    "A Stoned Goose Productions cinematic recording. Captured live, edited tight.",
  // Placeholder. Flagged. Owner needs to drop in the real video URL or
  // YouTube embed ID when ready.
  videoUrl: null as string | null,
  poster: "/images/comedians/xavier.png",
  comedianHandle: "https://www.instagram.com/jokedeal3r/",
};

export const showsCopy = {
  heading: "Upcoming Shows",
  subhead:
    "Live lineups, presales, and ticket drops across Olympia and the South Sound.",
  emptyState:
    "We don't have any shows on the calendar right now. Follow Stoned Goose Productions to be the first to hear when the next lineup drops.",
};
