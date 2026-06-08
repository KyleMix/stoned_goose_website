// One-time backfill: lift mic cadence out of the freeform `notes` text into
// the structured `frequency` + `weeks` fields.
//
// Run once with `tsx scripts/migrate-open-mic-frequency.ts`, then review the
// result with `git diff content/open-mics` and regenerate the consolidated
// index with `npm run content:index`.
//
// Heuristic: a cadence phrase is one or more week ordinals (1st..4th / last,
// or their word forms), optionally joined by ",", "&" or "and", and ALWAYS
// followed by a weekday word. Requiring a trailing weekday keeps stray
// ordinals out of the match: "1st and 2nd best voted comics", "1st place...
// 2nd place", and dates like "22nd May" are left untouched. 2+ weeks reads as
// every-other-week (biweekly); exactly one reads as monthly; no match stays
// weekly.

import { readdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DIR = join(ROOT, "content", "open-mics");

type Week = "1st" | "2nd" | "3rd" | "4th" | "Last";
const WEEK_ORDER: Week[] = ["1st", "2nd", "3rd", "4th", "Last"];

const ORDINAL_MAP: Record<string, Week> = {
  "1st": "1st", first: "1st",
  "2nd": "2nd", second: "2nd",
  "3rd": "3rd", third: "3rd",
  "4th": "4th", fourth: "4th",
  last: "Last",
};

const ORD = "(?:1st|2nd|3rd|4th|first|second|third|fourth|last)";
const WEEKDAY = "(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*";
// Group 1: the ordinal run. Then a weekday, an optional period, and an
// optional "of (the) month" tail that we also strip.
const CADENCE = new RegExp(
  `\\b(${ORD}(?:\\s*(?:,|&|and)\\s*${ORD})*)\\s+${WEEKDAY}\\b\\.?(?:\\s+of(?:\\s+the)?\\s+month)?`,
  "i",
);

// Canonical key order so new fields slot in after `day` and the diff stays
// minimal. Matches the order of the CMS open_mics collection.
const KEY_ORDER = [
  "name", "venue", "address", "city", "region", "lat", "lng",
  "day", "frequency", "weeks", "time", "host", "signupUrl", "notes",
];

function parseWeeks(run: string): Week[] {
  const found: Week[] = [];
  const re = new RegExp(ORD, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(run)) !== null) {
    const week = ORDINAL_MAP[m[0].toLowerCase()];
    if (week && !found.includes(week)) found.push(week);
  }
  return found.sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));
}

function cleanNotes(notes: string): string {
  return notes
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\./g, ".")
    .replace(/\.\s*\./g, ".")
    .replace(/^[\s.,;]+|[\s.,;]+$/g, "")
    .trim();
}

function reorder(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of KEY_ORDER) {
    if (key in data) out[key] = data[key];
  }
  // Preserve any unexpected keys at the end rather than dropping them.
  for (const key of Object.keys(data)) {
    if (!(key in out)) out[key] = data[key];
  }
  return out;
}

let changed = 0;
let matched = 0;

for (const item of readdirSync(DIR, { withFileTypes: true })) {
  if (!item.isDirectory()) continue;
  const path = join(DIR, item.name, "index.json");
  if (!existsSync(path)) continue;

  const data = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  const notes = typeof data.notes === "string" ? data.notes : "";

  let frequency: "weekly" | "biweekly" | "monthly" = "weekly";
  let weeks: Week[] | undefined;

  const match = CADENCE.exec(notes);
  if (match) {
    weeks = parseWeeks(match[1]);
    if (weeks.length >= 2) frequency = "biweekly";
    else if (weeks.length === 1) frequency = "monthly";
    else weeks = undefined;

    const stripped = cleanNotes(notes.replace(match[0], " "));
    if (stripped) data.notes = stripped;
    else delete data.notes;
    matched += 1;
  }

  data.frequency = frequency;
  if (weeks && weeks.length > 0) data.weeks = weeks;
  else delete data.weeks;

  const next = JSON.stringify(reorder(data), null, 2) + "\n";
  if (next !== readFileSync(path, "utf8")) {
    writeFileSync(path, next, "utf8");
    changed += 1;
    console.log(
      `[freq] ${item.name}: ${frequency}${weeks ? ` (${weeks.join(", ")})` : ""}`,
    );
  }
}

console.log(`[freq] done. ${matched} mics matched a cadence, ${changed} files written.`);
