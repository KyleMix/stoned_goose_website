// Display normalization for open mic listings.
//
// CMS data for mics is crowd-sourced and messy: lowercase venue names, typos,
// host fields that are actually emails or social links, signup values that are
// not real URLs, addresses with duplicated city or state tokens, and time
// strings in a dozen shapes. This module turns a raw record into clean display
// fields WITHOUT mutating the source. Normalize at render, report oddities for
// later CMS cleanup via `collectMicWarnings`.
//
// Everything here is framework-free so the data-quality script and the smoke
// test can import it directly.

import type { OpenMic } from "@/content/open-mics";

// Extensible venue spelling corrections. Keys are lowercased single tokens;
// values are the corrected, properly cased token. Applied per word before
// title casing so "8201 launge" becomes "8201 Lounge". Add new fixes here as
// they surface rather than hand-editing the CMS.
export const VENUE_CORRECTIONS: Record<string, string> = {
  launge: "Lounge",
  lounje: "Lounge",
  superme: "Supreme",
  conercopia: "Cornercopia",
  cornercopia: "Cornercopia",
  nector: "Nectar",
  taphouse: "Taphouse",
  brewey: "Brewery",
  brewary: "Brewery",
};

// Connector words kept lowercase inside a title-cased name (never the first
// word). Keeps "Kelly's Olympian" style names from reading like ransom notes.
const MINOR_WORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "but",
  "by",
  "for",
  "in",
  "nor",
  "of",
  "on",
  "or",
  "the",
  "to",
  "vs",
  "via",
  "with",
]);

function titleCaseWord(word: string): string {
  if (!word) return word;
  // Preserve words that already carry an internal capital (McKay's, PDX, 4B).
  // Only normalize words that are all-lowercase or numeric.
  if (/[A-Z]/.test(word.slice(1))) return word;
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

function applyCorrections(word: string): string {
  const key = word.toLowerCase().replace(/[.,]+$/, "");
  return VENUE_CORRECTIONS[key] ?? word;
}

// Title-case a venue / mic name, applying the correction map and keeping minor
// words lowercase except in the leading position.
export function normalizeVenueName(raw: string | undefined): string {
  if (!raw) return "";
  const words = raw.replace(/\s+/g, " ").trim().split(" ");
  return words
    .map((word, i) => {
      const corrected = applyCorrections(word);
      if (corrected !== word) return corrected;
      const lower = word.toLowerCase();
      if (i > 0 && MINOR_WORDS.has(lower)) return lower;
      return titleCaseWord(word);
    })
    .join(" ");
}

// Host classification: a host value can be a real name, an email, a social
// link, or empty. Emails and URLs must never render as raw text in the host
// slot, so we hand back a typed shape the UI renders as a link or hides.
export type HostDisplay =
  | { kind: "name"; text: string }
  | { kind: "link"; href: string; label: string }
  | { kind: "hidden" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/\S+$/i;

function labelFromUrl(raw: string): string {
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    const seg = url.pathname.split("/").filter(Boolean).pop();
    if (/instagram\.com$/i.test(host) && seg) return `@${seg}`;
    if (/facebook\.com$/i.test(host) && seg) return seg;
    if (seg) return seg;
    return host;
  } catch {
    return "Host link";
  }
}

export function classifyHost(
  raw: string | undefined,
  onWarn?: (message: string) => void,
): HostDisplay {
  const s = (raw ?? "").trim();
  if (!s) return { kind: "hidden" };
  if (EMAIL_RE.test(s)) {
    onWarn?.(`host is an email, rendering as link: ${s}`);
    return { kind: "link", href: `mailto:${s}`, label: s };
  }
  if (URL_RE.test(s)) {
    onWarn?.(`host is a URL, rendering as link: ${s}`);
    return { kind: "link", href: s, label: labelFromUrl(s) };
  }
  return { kind: "name", text: s };
}

// Signup classification. Only an external http(s) URL becomes a clickable
// signup. Descriptive instructions ("Show Up Go Up") are kept as a note.
// Anything that looks like a broken or self-referential URL collapses to the
// neutral "Sign-up info on listing" line.
export type SignupDisplay =
  | { kind: "url"; href: string }
  | { kind: "note"; text: string }
  | { kind: "fallback" }
  | { kind: "none" };

export const SIGNUP_FALLBACK_LABEL = "Sign-up info on listing";

export function classifySignup(
  raw: string | undefined,
  onWarn?: (message: string) => void,
): SignupDisplay {
  const s = (raw ?? "").trim();
  if (!s) return { kind: "none" };
  if (URL_RE.test(s)) return { kind: "url", href: s };
  onWarn?.(`signup is not an external URL: ${s}`);
  // Descriptive text (has spaces and is not a bare domain/path) stays as a
  // helpful note. Otherwise treat it as a broken link and show the fallback.
  const looksLikeBareUrl = !/\s/.test(s) && /[./]/.test(s);
  if (looksLikeBareUrl) return { kind: "fallback" };
  return { kind: "note", text: s };
}

// Time parsing. Output is a single consistent shape ("8:00 PM"), split into a
// sign-up time and a start time when the source encodes both.
export type TimeDisplay = {
  start: string | null;
  signup: string | null;
  display: string;
};

function formatClock(token: string): string | null {
  const m = token
    .trim()
    .toLowerCase()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  if (Number.isNaN(hour) || hour > 23) return null;
  const minute = m[2] ?? "00";
  let meridiem = m[3];
  if (!meridiem) {
    // Bare hours on comedy listings are evening times. Default to PM unless
    // it is clearly an early-morning hour written in 24h form.
    meridiem = hour === 0 ? "am" : "pm";
  }
  if (hour === 0) hour = 12;
  else if (hour > 12) {
    hour -= 12;
    meridiem = "pm";
  }
  return `${hour}:${minute} ${meridiem.toUpperCase()}`;
}

export function normalizeTime(
  raw: string | undefined,
  onWarn?: (message: string) => void,
): TimeDisplay {
  const original = (raw ?? "").trim();
  if (!original) return { start: null, signup: null, display: "" };

  let body = original;
  let signupFirst = false;
  const labelMatch = original.match(/^(.*?):\s*(.*)$/);
  if (labelMatch && /[a-z]/i.test(labelMatch[1]) && /(sign|start|show)/i.test(labelMatch[1])) {
    body = labelMatch[2];
    signupFirst = /sign/i.test(labelMatch[1]) && /(start|show)/i.test(labelMatch[1]);
  }

  const tokens = body
    .split(/[/-]/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    onWarn?.(`could not parse time: ${original}`);
    return { start: null, signup: null, display: stripDanglingSlash(original) };
  }

  let signup: string | null = null;
  let start: string | null = null;
  if (signupFirst && tokens.length >= 2) {
    signup = formatClock(tokens[0]);
    start = formatClock(tokens[tokens.length - 1]);
  } else {
    start = formatClock(tokens[tokens.length - 1]);
  }

  if (!start && !signup) {
    onWarn?.(`could not parse time: ${original}`);
    return { start: null, signup: null, display: stripDanglingSlash(original) };
  }

  return { start, signup, display: start ?? signup ?? stripDanglingSlash(original) };
}

// "Thu - 8:00 PM" style combined day + time label.
export function formatDayTime(day: string, time: TimeDisplay): string {
  const dayShort = day ? day.slice(0, 3) : "";
  const clock = time.start ?? time.display;
  if (dayShort && clock) return `${dayShort} - ${clock}`;
  return dayShort || clock || "";
}

function stripDanglingSlash(value: string): string {
  return value.replace(/\s*\/\s*$/, "").trim();
}

// Notes cleanup: strip dangling slashes and empty "Set" fragments like
// "Set 4/" or "Set /" that leak in from the source spreadsheet.
export function normalizeNotes(raw: string | undefined): string | null {
  let s = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!s) return null;
  // "Set /" or "Set/" with no value: drop the fragment entirely.
  s = s.replace(/\bSet\s*\/(?=\s|\.|,|$)/gi, "");
  // "Set 4/" or "Set 5(closer20)/": keep the value, drop the trailing slash.
  s = s.replace(/(\bSet\s*\d+(?:\s*\([^)]*\))?)\s*\//gi, "$1");
  // Any remaining dangling slash before punctuation or end of string.
  s = s.replace(/\s*\/\s*(?=\.|,|$)/g, "");
  // Collapse the punctuation left behind by removed fragments.
  s = s.replace(/\s*\.\s*\.\s*/g, ". ").replace(/\s{2,}/g, " ").trim();
  s = s.replace(/^[.,\s]+/, "").replace(/[,\s]+$/, "").trim();
  if (!s) return null;
  if (!/[.!?]$/.test(s)) s += ".";
  return s;
}

// Address cleanup: collapse duplicate state codes, drop trailing commas, and
// remove repeated city / region / zip tokens so the composed display reads
// once and cleanly. Returns the bare street line plus a fully composed
// "Street, City, REGION" string.
export type AddressDisplay = {
  street: string;
  full: string;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function composeAddress(street: string, city: string, region: string): string {
  return [street, city, region].map((p) => p.trim()).filter(Boolean).join(", ");
}

export function normalizeAddress(
  raw: string | undefined,
  city: string | undefined,
  region: string | undefined,
): AddressDisplay {
  const c = (city ?? "").trim();
  const r = (region ?? "").trim();
  let s = (raw ?? "").replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ").trim();
  s = s.replace(/(,\s*)+/g, ", ").replace(/[,\s]+$/, "");
  if (!s) return { street: "", full: composeAddress("", c, r) };

  const cityLc = c.toLowerCase();
  const regionLc = r.toLowerCase();
  let parts = s
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => {
      const lc = p.toLowerCase();
      if (cityLc && lc === cityLc) return false;
      if (regionLc && lc === regionLc) return false;
      if (/^\d{5}(-\d{4})?$/.test(p)) return false;
      if (regionLc && new RegExp(`^${escapeRegExp(regionLc)}\\s+\\d{5}`, "i").test(p)) return false;
      if (
        cityLc &&
        regionLc &&
        new RegExp(`^${escapeRegExp(cityLc)}\\s+${escapeRegExp(regionLc)}(\\s+\\d{5})?$`, "i").test(p)
      )
        return false;
      return true;
    });

  let street = parts.join(", ");
  // Handle no-comma trailing "City REGION" or "REGION" tails.
  if (r) street = street.replace(new RegExp(`\\s+${escapeRegExp(r)}\\b\\.?$`, "i"), "").trim();
  if (c) street = street.replace(new RegExp(`\\s+${escapeRegExp(c)}$`, "i"), "").trim();
  street = street.replace(/\s+\d{5}(-\d{4})?$/, "").trim();
  street = street.replace(/[,\s]+$/, "").trim();

  return { street, full: composeAddress(street, c, r) };
}

// The full normalized record consumed by the UI. Raw fields are preserved; the
// `*Display` fields carry the cleaned, render-ready values.
export type NormalizedOpenMic = OpenMic & {
  nameDisplay: string;
  venueDisplay: string;
  addressStreet: string;
  addressDisplay: string;
  timeStart: string | null;
  timeSignup: string | null;
  timeDisplay: string;
  dayTimeDisplay: string;
  hostDisplay: HostDisplay;
  signupDisplay: SignupDisplay;
  notesDisplay: string | null;
};

export function normalizeMic(
  mic: OpenMic,
  onWarn?: (message: string) => void,
): NormalizedOpenMic {
  const warn = onWarn
    ? (message: string) => onWarn(`[${mic.id || mic.name || "unknown"}] ${message}`)
    : undefined;

  const time = normalizeTime(mic.time, warn);
  const address = normalizeAddress(mic.address, mic.city, mic.region);
  const host = classifyHost(mic.host, warn);
  const signup = classifySignup(mic.signupUrl, warn);

  if (!mic.city) warn?.("missing city");

  return {
    ...mic,
    nameDisplay: normalizeVenueName(mic.name) || normalizeVenueName(mic.venue),
    venueDisplay: normalizeVenueName(mic.venue),
    addressStreet: address.street,
    addressDisplay: address.full,
    timeStart: time.start,
    timeSignup: time.signup,
    timeDisplay: time.display,
    dayTimeDisplay: formatDayTime(mic.day, time),
    hostDisplay: host,
    signupDisplay: signup,
    notesDisplay: normalizeNotes(mic.notes),
  };
}

// Data-quality analysis used by the report script. Flags records that need a
// human pass in the CMS rather than silently cleaning them.
export type MicIssue = {
  id: string;
  name: string;
  field: "city" | "time" | "signup" | "host" | "address" | "venue";
  severity: "error" | "warning";
  message: string;
};

export function analyzeMic(mic: OpenMic): MicIssue[] {
  const issues: MicIssue[] = [];
  const id = mic.id || "(no id)";
  const name = mic.name || mic.venue || "(unnamed)";

  if (!mic.city || !mic.city.trim()) {
    issues.push({ id, name, field: "city", severity: "error", message: "Missing city." });
  }

  const time = normalizeTime(mic.time);
  if (mic.time && mic.time.trim() && !time.start && !time.signup) {
    issues.push({
      id,
      name,
      field: "time",
      severity: "error",
      message: `Unparseable time: "${mic.time}".`,
    });
  }

  const signup = (mic.signupUrl ?? "").trim();
  if (signup && !URL_RE.test(signup)) {
    issues.push({
      id,
      name,
      field: "signup",
      severity: "warning",
      message: `Signup is not an external URL: "${signup}".`,
    });
  }

  const host = (mic.host ?? "").trim();
  if (host && (EMAIL_RE.test(host) || URL_RE.test(host))) {
    issues.push({
      id,
      name,
      field: "host",
      severity: "warning",
      message: `Host slot holds ${EMAIL_RE.test(host) ? "an email" : "a URL"}: "${host}".`,
    });
  }

  const venueLower = (mic.venue ?? "").toLowerCase();
  for (const typo of Object.keys(VENUE_CORRECTIONS)) {
    if (new RegExp(`\\b${typo}\\b`, "i").test(venueLower) && VENUE_CORRECTIONS[typo].toLowerCase() !== typo) {
      issues.push({
        id,
        name,
        field: "venue",
        severity: "warning",
        message: `Venue spelling corrected on render: "${mic.venue}".`,
      });
      break;
    }
  }

  return issues;
}
