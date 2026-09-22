// Copy for /open-mics, the Log Cabin Comedy Open Mic.
//
// This page used to be the Open Mic Explorer app announcement, and before that
// the Pacific Northwest open mic map. Both are gone: the app is dead and the
// map was retired. /open-mics is now one room, our own, and nothing else.
//
// Everything a comic needs to show up is in content/log-cabin-mic/index.json
// and editable at /admin. Nothing on this page is inferred: the times, the
// address and the motto come off the poster, and a field the poster does not
// state (price, for one) stays empty and renders nothing rather than getting
// filled in with a guess.

import copyData from "./log-cabin-mic/index.json";
import { normaliseBlocks, type Block } from "@/lib/blocks";

export type HowItWorksStep = {
  heading: string;
  body: string;
};

type LogCabinMicShape = {
  eyebrow?: string | null;
  titleLead?: string | null;
  titleEmphasis?: string | null;
  titleTrail?: string | null;
  subhead?: string | null;
  recurrence?: string | null;
  venue?: {
    name?: string | null;
    address?: string | null;
    city?: string | null;
    region?: string | null;
    postalCode?: string | null;
    mapUrl?: string | null;
  } | null;
  signupTime?: string | null;
  showTime?: string | null;
  endTime?: string | null;
  price?: string | null;
  motto?: string | null;
  host?: string | null;
  poster?: { src?: string | null; alt?: string | null } | null;
  signup?: Record<string, string | null | undefined> | null;
  howItWorks?: unknown;
  topSections?: unknown;
  bottomSections?: unknown;
};

const copy = copyData as unknown as LogCabinMicShape;

/** A cleared CMS field arrives as null or "". Both mean "render nothing". */
function text(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

export const logCabinMicTopSections: Block[] = normaliseBlocks(copy.topSections);
export const logCabinMicBottomSections: Block[] = normaliseBlocks(
  copy.bottomSections,
);

export const logCabinMicVenue = {
  name: text(copy.venue?.name),
  address: text(copy.venue?.address),
  city: text(copy.venue?.city),
  region: text(copy.venue?.region),
  postalCode: text(copy.venue?.postalCode),
  mapUrl: text(copy.venue?.mapUrl),
};

/** "7035 Pacific Ave SE, Olympia, WA 98503", skipping anything not set. */
export const logCabinMicAddressLine = [
  logCabinMicVenue.address,
  [logCabinMicVenue.city, logCabinMicVenue.region]
    .filter(Boolean)
    .join(", "),
  logCabinMicVenue.postalCode,
]
  .filter(Boolean)
  .join(", ");

export const logCabinMic = {
  eyebrow: text(copy.eyebrow),
  titleLead: text(copy.titleLead),
  titleEmphasis: text(copy.titleEmphasis),
  titleTrail: text(copy.titleTrail),
  subhead: text(copy.subhead),
  recurrence: text(copy.recurrence),
  signupTime: text(copy.signupTime),
  showTime: text(copy.showTime),
  endTime: text(copy.endTime),
  price: text(copy.price),
  motto: text(copy.motto),
  host: text(copy.host),
};

export const logCabinMicPoster = {
  src: text(copy.poster?.src),
  alt: text(copy.poster?.alt),
};

/**
 * Words only. The numbers that define the format (twelve spots, eight
 * minutes, four Mondays, the start date) are NOT here and are not editable in
 * the CMS: they live in lib/open-mic-schedule.ts, which the sign up Worker
 * imports too.
 *
 * That is deliberate. A slot count an editor could raise to thirteen without
 * the Worker agreeing would advertise a spot the database refuses to sell, and
 * the comic would find out at the moment of sign up. One source of truth, and
 * the surface that can be edited freely is the copy around it.
 */
export const logCabinMicSignup = {
  eyebrow: text(copy.signup?.eyebrow),
  heading: text(copy.signup?.heading),
  body: text(copy.signup?.body),
  nameLabel: text(copy.signup?.nameLabel) || "Name",
  emailLabel: text(copy.signup?.emailLabel) || "Email",
  instagramLabel: text(copy.signup?.instagramLabel) || "Instagram",
  submitLabel: text(copy.signup?.submitLabel) || "Take a spot",
  privacyNote: text(copy.signup?.privacyNote),
  fullText: text(copy.signup?.fullText) || "Full",
  offlineText:
    text(copy.signup?.offlineText) ||
    "That did not go through. Try again, or email us:",
};

export const logCabinMicHowItWorks: HowItWorksStep[] = Array.isArray(
  copy.howItWorks,
)
  ? (copy.howItWorks as HowItWorksStep[])
      .map((step) => ({
        heading: text(step?.heading),
        body: text(step?.body),
      }))
      .filter((step) => step.heading || step.body)
  : [];
