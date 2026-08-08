// Copy for /open-mics, the Open Mic Explorer app announcement.
//
// Not CMS managed on purpose. Everything here is a summary of the app's own
// feature overview, which is generated in the Open-Mic-Discovery repo
// (marketing/one-sheet/open-mic-explorer.txt). When that sheet changes, the
// assets under public/open-mic-explorer/ and this file get refreshed together
// so the page and the sheet never claim different things. Re-fetch steps are
// in vendor/open-mic-explorer/README.md.
//
// Two honesty rules this copy exists to hold:
//   1. The map at /open-mics/map is the crew's Pacific Northwest list. The app
//      is a separate product that starts in Seattle. Never imply the app
//      arrives holding the mics on the map.
//   2. The app launches with no listings. Hosts add their own rooms. The
//      sheet's performer walkthrough opens "Every mic near you is visible
//      immediately," which describes the screen, not the contents. Do not
//      repeat that line here.

export type AppFeature = {
  id: string;
  heading: string;
  body: string;
  image: {
    src: string;
    /** Real alt text: what the screen shows, not "screenshot 2". */
    alt: string;
    width: number;
    height: number;
  };
};

export type OneSheetPage = {
  page: number;
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const openMicAppHero = {
  eyebrow: "Open Mic Explorer",
  subhead:
    "A phone app for open mics. Music, comedy, and poetry on one map, with the signup list built in. Free, with nothing behind a purchase.",
};

// Sits directly under the masthead. A large share of arrivals here are people
// looking for a mic tonight, and they must not hit a dead end.
export const openMicAppMapLink = {
  eyebrow: "Came here for the map?",
  heading: "The Pacific Northwest map moved down one level.",
  body: "These are two different things. The map is our own list of open mics around Washington and Oregon, kept current by comics, hosts, and the crew. The app is a separate product, and Seattle is its first city. A host anywhere can list a mic in it.",
  ctaLabel: "Open the map",
  ctaHref: "/open-mics/map",
};

export const openMicAppStatus = {
  eyebrow: "Status",
  heading: "Coming soon to the App Store and Google Play.",
  body: [
    "The app is built and in testing. There is no store listing yet, so there is nothing to download today, and nothing on this page pretending otherwise.",
    "It arrives new. The app ships with no mics in it: hosts add their own rooms, and the map fills in from there. Listing is open to hosts anywhere, not only Seattle, so if you run a night you can be on it before anyone goes looking.",
  ],
};

export const openMicAppFeatures: AppFeature[] = [
  {
    id: "discover",
    heading: "Three scenes, one map.",
    body: "Music, comedy, and poetry nights in the same place, filtered by what you perform, which day, what it costs, and how far you are willing to go. Search a city, or look around where you are standing.",
    image: {
      src: "/open-mic-explorer/screenshots/discover.png",
      alt: "The Discover tab: a search field, filter chips for music, comedy and poetry, and a list of Seattle mics. Each row shows the venue, distance, weekly schedule, signup type, cost, how long ago the host confirmed it, and spots left.",
      width: 780,
      height: 1688,
    },
  },
  {
    id: "freshness",
    heading: "Stale mics cannot hide.",
    body: "Every listing carries the date its host last confirmed the details, in green when it is fresh and amber when it is aging. The listing itself has the schedule, the cost, the set length, the spots left, and who is featuring, so you can size up a night before you drive to it.",
    image: {
      src: "/open-mic-explorer/screenshots/mic-detail.png",
      alt: "A listing for Delridge Variety Mic, confirmed seven days ago. It shows every Saturday at 7 PM, the featured artist, an add to calendar button, an I am going button, and a signup panel reading 7 of 16 spots left.",
      width: 780,
      height: 1688,
    },
  },
  {
    id: "signup",
    heading: "Signing up is part of the app.",
    body: "Get on the list from the listing, with a live count of what is left. Walk-in lists confirm you on the spot, name-draw nights enter you in the drawing, and your slot number updates as the list moves. The Going tab collects every night you said yes to, soonest first.",
    image: {
      src: "/open-mic-explorer/screenshots/going.png",
      alt: "The Going tab: three upcoming nights in date order, each with the venue, schedule and this performer's status, reading on the list slot 1, planning to attend, and in the draw.",
      width: 780,
      height: 1688,
    },
  },
  {
    id: "host",
    heading: "One account performs and hosts.",
    body: "Most hosts also perform, so it is one account with both roles. Running the night lives in the same app: watch signups arrive, draw the lottery in the open, add walk-ins, then run the show from a screen that is two numbers, a silent set timer, and one button.",
    image: {
      src: "/open-mic-explorer/screenshots/live.png",
      alt: "Live mode for a host: counts of open spots, performers still to go, and the waitlist, then the performer on stage now above a five minute set timer, a start the set button, an up next button, and the two people waiting for a spot.",
      width: 780,
      height: 1688,
    },
  },
];

export const openMicAppFree = {
  heading: "Free, all of it.",
  body: "There is no paid tier, no subscription, and no feature waiting behind a purchase. Host analytics are free too. The app sells nothing and contains no payment code.",
};

export const openMicAppOneSheet = {
  eyebrow: "The whole sheet",
  heading: "Feature overview, five pages.",
  body: "The summary above is the short version. The full sheet is below, page by page. Tap a page to enlarge it.",
  pdf: {
    href: "/open-mic-explorer/open-mic-explorer.pdf",
    label: "Download the feature overview (PDF, 5 pages, 700 KB)",
  },
  pages: [
    {
      page: 1,
      src: "/open-mic-explorer/one-sheet/page-1.webp",
      alt: "One sheet cover. Find a mic, get on the list, above four claims: all three scenes mapped together, listings that show when the host last confirmed them, signup without leaving the app, and one account for performing and hosting.",
      width: 1400,
      height: 1812,
    },
    {
      page: 2,
      src: "/open-mic-explorer/one-sheet/page-2.webp",
      alt: "One sheet page titled what is in the app: a grid of eight features grouped under Discover, Get on stage, Run the night, and Trust built in.",
      width: 1400,
      height: 1812,
    },
    {
      page: 3,
      src: "/open-mic-explorer/one-sheet/page-3.webp",
      alt: "One sheet page titled running a mic, start to stage: eight numbered host steps from switching on the Producer role to checking turnout, each noting what performers see when it happens.",
      width: 1400,
      height: 1812,
    },
    {
      page: 4,
      src: "/open-mic-explorer/one-sheet/page-4.webp",
      alt: "One sheet page titled from couch to stage: eight numbered performer steps from browsing without an account to building a history of nights played.",
      width: 1400,
      height: 1812,
    },
    {
      page: 5,
      src: "/open-mic-explorer/one-sheet/page-5.webp",
      alt: "One sheet page titled the app at night: three dark-mode screenshots with captions, above a coming soon column listing Apple and Google sign-in, public launch, and cities beyond Seattle.",
      width: 1400,
      height: 1812,
    },
  ] satisfies OneSheetPage[],
};

export const openMicAppContact = {
  heading: "Questions about the app?",
  body: "Privacy, terms, and account deletion for Open Mic Explorer all live on this site. Anything else, write to us.",
  links: [
    { label: "Privacy policy", href: "/open-mics/privacy" },
    { label: "Terms", href: "/open-mics/terms" },
    { label: "Delete your account", href: "/open-mics/delete-account" },
  ],
};
