import openMicsRaw from "./feeds/open-mics.json";

// Open Mic Explorer data. The build-time sync script (scripts/sync-open-mics.ts)
// fetches a published Google Sheet CSV and writes content/feeds/open-mics.json.
// When the sync hasn't run, the committed JSON acts as the fallback so the
// /open-mics page still renders.

export type OpenMicDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

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
  host?: string;
  signupUrl?: string;
  notes?: string;
};

export type OpenMicsManifest = {
  fetchedAt: string;
  source: "google-sheet" | "stub";
  status: "ok" | "stale" | "error";
  errorMessage: string | null;
  mics: OpenMic[];
};

export const openMicsFeed = openMicsRaw as OpenMicsManifest;

export const openMicsCopy = {
  subhead:
    "Find an open mic in the Pacific Northwest. New rooms, weekly signups, mapped.",
  kicker:
    "Maintained by the crew. Tell us if a room moved.",
};
