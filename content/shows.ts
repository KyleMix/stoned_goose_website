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
};

// Static export, no API. Live Eventbrite feed lived at /api/eventbrite in the
// previous build; today the calendar is empty per the original site's empty-state.
// Add real shows here when they're confirmed.
export const upcomingShows: Show[] = [];

export const featuredSpecial = {
  title: "Xavier Rake",
  subtitle: "Full Comedy Special",
  blurb:
    "A Stoned Goose Productions cinematic recording. Captured live, edited tight.",
  // Placeholder — flagged. Owner needs to drop in the real video URL or
  // YouTube embed ID when ready.
  videoUrl: null as string | null,
  poster: "/images/comedians/xavier.png",
  comedianHandle: "https://www.instagram.com/jokedeal3r/",
};

export const showsCopy = {
  heading: "Upcoming Shows",
  subhead:
    "Live lineups, presales, and ticket drops across Olympia and the South Sound.",
  emailPitch: {
    eyebrow: "Stay in the loop",
    heading: "Get show announcements + presale codes",
    body: "Join the mailing list so you hear about new drops before tickets sell out.",
    success: "You're on the list. See you at the next show.",
  },
  emptyState:
    "We don't have any shows on the calendar right now. Follow Stoned Goose Productions to be the first to hear when the next lineup drops.",
};
