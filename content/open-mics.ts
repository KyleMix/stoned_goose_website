// Open Mic Explorer shim. Reads:
//   - content/open-mics-copy/index.json (singleton)
//   - content/.generated/open-mics-index.json (collection, consolidated at prebuild)
//
// Falls back to content/feeds/open-mics.json when the CMS collection is
// empty. This keeps the legacy Google Sheet sync useful as a one-time bulk
// import path without overriding live admin edits.

import openMicsCopyData from "./open-mics-copy/index.json";
import legacyFeed from "./feeds/open-mics.json";
import micsIndex from "./.generated/open-mics-index.json";
import { normaliseBlocks, type Block } from "@/lib/blocks";

export type OpenMicDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

// How often a mic recurs. `weekly` is the default and the common case;
// `biweekly` (every other week) and `monthly` are paired with `weeks` to say
// which weeks of the month it actually happens.
export type OpenMicFrequency = "weekly" | "biweekly" | "monthly";

export type OpenMicWeek = "1st" | "2nd" | "3rd" | "4th" | "Last";

export type OpenMic = {
  id: string;
  name: string;
  venue: string;
  address: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  day: OpenMicDay;
  time: string;
  frequency: OpenMicFrequency;
  weeks?: OpenMicWeek[];
  host?: string;
  signupUrl?: string;
  notes?: string;
};

const WEEK_ORDER: OpenMicWeek[] = ["1st", "2nd", "3rd", "4th", "Last"];

const FREQUENCY_LABELS: Record<OpenMicFrequency, string> = {
  weekly: "Weekly",
  biweekly: "Every other week",
  monthly: "Monthly",
};

// Sidebar filter options, shared by the explorer so the labels stay in sync
// with the badge.
export const FREQUENCY_FILTERS: Array<{
  value: OpenMicFrequency | "all";
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every other week" },
  { value: "monthly", label: "Monthly" },
];

// Display helper for the cadence badge: a primary cadence label plus an
// optional which-weeks detail (e.g. "1st & 3rd"). Used by the list row badge.
export function formatFrequency(mic: OpenMic): {
  label: string;
  detail?: string;
} {
  const label = FREQUENCY_LABELS[mic.frequency] ?? FREQUENCY_LABELS.weekly;
  if (mic.frequency === "weekly" || !mic.weeks || mic.weeks.length === 0) {
    return { label };
  }
  const ordered = [...mic.weeks].sort(
    (a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b),
  );
  const detail =
    ordered.length === 1
      ? ordered[0]
      : `${ordered.slice(0, -1).join(", ")} & ${ordered[ordered.length - 1]}`;
  return { label, detail };
}

export type OpenMicsManifest = {
  fetchedAt: string;
  source: "google-sheet" | "stub" | "cms";
  status: "ok" | "stale" | "error";
  errorMessage: string | null;
  mics: OpenMic[];
};

const openMicsRaw = openMicsCopyData as {
  subhead: string;
  kicker: string;
  topSections?: unknown;
  bottomSections?: unknown;
};

export const openMicsCopy = {
  subhead: openMicsRaw.subhead,
  kicker: openMicsRaw.kicker,
};

export const openMicsTopSections: Block[] = normaliseBlocks(openMicsRaw.topSections);
export const openMicsBottomSections: Block[] = normaliseBlocks(openMicsRaw.bottomSections);

type RawMic = {
  id?: string;
  name?: string;
  venue?: string;
  address?: string;
  city?: string;
  region?: string;
  lat?: number;
  lng?: number;
  day?: string;
  time?: string;
  frequency?: string;
  weeks?: string[];
  host?: string;
  signupUrl?: string;
  notes?: string;
};

const VALID_FREQUENCIES: OpenMicFrequency[] = ["weekly", "biweekly", "monthly"];

function normaliseFrequency(value: string | undefined): OpenMicFrequency {
  return VALID_FREQUENCIES.includes(value as OpenMicFrequency)
    ? (value as OpenMicFrequency)
    : "weekly";
}

function normaliseWeeks(value: string[] | undefined): OpenMicWeek[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const weeks = value.filter((w): w is OpenMicWeek =>
    WEEK_ORDER.includes(w as OpenMicWeek),
  );
  return weeks.length > 0 ? weeks : undefined;
}

const cmsMics: OpenMic[] = (micsIndex as RawMic[]).map((m) => ({
  id: m.id ?? "",
  name: m.name ?? "",
  venue: m.venue ?? "",
  address: m.address ?? "",
  city: m.city ?? "",
  region: m.region ?? "WA",
  lat: Number(m.lat ?? 0),
  lng: Number(m.lng ?? 0),
  day: (m.day as OpenMicDay) ?? "Monday",
  time: m.time ?? "",
  frequency: normaliseFrequency(m.frequency),
  weeks: normaliseWeeks(m.weeks),
  host: m.host && m.host.length > 0 ? m.host : undefined,
  signupUrl: m.signupUrl && m.signupUrl.length > 0 ? m.signupUrl : undefined,
  notes: m.notes && m.notes.length > 0 ? m.notes : undefined,
}));

const legacy = legacyFeed as unknown as OpenMicsManifest;

export const openMicsFeed: OpenMicsManifest =
  cmsMics.length > 0
    ? {
        fetchedAt: new Date().toISOString(),
        source: "cms",
        status: "ok",
        errorMessage: null,
        mics: cmsMics,
      }
    : legacy;
