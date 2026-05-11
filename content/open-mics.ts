// Open Mic Explorer shim. Reads:
//   - content/open-mics-copy/index.json (singleton)
//   - content/.generated/open-mics-index.json (collection, consolidated at prebuild)
//
// Falls back to content/feeds/open-mics.json when the Keystatic collection is
// empty. This keeps the legacy Google Sheet sync useful as a one-time bulk
// import path without overriding live admin edits.

import openMicsCopyData from "./open-mics-copy/index.json";
import legacyFeed from "./feeds/open-mics.json";
import micsIndex from "./.generated/open-mics-index.json";

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
  source: "google-sheet" | "stub" | "keystatic";
  status: "ok" | "stale" | "error";
  errorMessage: string | null;
  mics: OpenMic[];
};

export const openMicsCopy = openMicsCopyData as {
  subhead: string;
  kicker: string;
};

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
  host?: string;
  signupUrl?: string;
  notes?: string;
};

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
  host: m.host && m.host.length > 0 ? m.host : undefined,
  signupUrl: m.signupUrl && m.signupUrl.length > 0 ? m.signupUrl : undefined,
  notes: m.notes && m.notes.length > 0 ? m.notes : undefined,
}));

const legacy = legacyFeed as unknown as OpenMicsManifest;

export const openMicsFeed: OpenMicsManifest =
  cmsMics.length > 0
    ? {
        fetchedAt: new Date().toISOString(),
        source: "keystatic",
        status: "ok",
        errorMessage: null,
        mics: cmsMics,
      }
    : legacy;
