// Open Mic Explorer sync.
//
// Pulls a published Google Sheet (CSV export) into
// content/feeds/open-mics.json so the static export ships with current data.
// Skips cleanly when the OPEN_MICS_SHEET_CSV env var is missing, leaving the
// previously committed JSON in place. Geocodes any rows missing lat/lng via
// Nominatim with a polite 1 req/sec rate limit and a User-Agent.
//
// Sheet column conventions (case-insensitive, trimmed):
//   id, name, venue, address, city, region, day, time, host, signup_url,
//   notes, lat, lng
// Required: name, venue, address, city, region, day, time. Either lat+lng
// or a geocodable address must be present.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { OpenMic, OpenMicDay, OpenMicsManifest } from "../content/open-mics";
import { safeFetch, writeJson } from "./_sync-helpers";

const OUT_PATH = join(process.cwd(), "content", "feeds", "open-mics.json");
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "StonedGooseProductionsOpenMicSync/1.0 (kyle@stonedgooseproductions.com)";

const VALID_DAYS: OpenMicDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type Row = Record<string, string>;

function parseCsv(text: string): Row[] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(cell);
        cell = "";
      } else if (ch === "\n") {
        row.push(cell);
        lines.push(row);
        row = [];
        cell = "";
      } else if (ch === "\r") {
        // skip
      } else {
        cell += ch;
      }
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    lines.push(row);
  }

  if (lines.length < 2) return [];
  const headers = lines[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).flatMap<Row>((line) => {
    if (line.every((c) => c.trim() === "")) return [];
    const obj: Row = {};
    headers.forEach((h, idx) => {
      obj[h] = (line[idx] ?? "").trim();
    });
    return [obj];
  });
}

function normalizeDay(input: string): OpenMicDay | null {
  const lower = input.toLowerCase();
  for (const d of VALID_DAYS) {
    if (lower.startsWith(d.toLowerCase().slice(0, 3))) return d;
  }
  return null;
}

async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = `${NOMINATIM}?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const data = (await safeFetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  })) as Array<{ lat: string; lon: string }> | null;
  if (!data || data.length === 0) return null;
  const lat = Number.parseFloat(data[0].lat);
  const lng = Number.parseFloat(data[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function readPrevious(): OpenMicsManifest | null {
  if (!existsSync(OUT_PATH)) return null;
  try {
    return JSON.parse(readFileSync(OUT_PATH, "utf8")) as OpenMicsManifest;
  } catch {
    return null;
  }
}

function makeId(row: Row, index: number): string {
  if (row.id) return row.id;
  const base = `${row.name}-${row.city}-${row.day}-${row.time}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || `mic-${index}`;
}

async function main() {
  const sheetUrl = process.env.OPEN_MICS_SHEET_CSV;
  if (!sheetUrl) {
    console.log("[sync] open-mics. OPEN_MICS_SHEET_CSV not set, leaving existing JSON.");
    return;
  }

  console.log(`[sync] open-mics. fetching ${sheetUrl}`);
  let csv: string;
  try {
    const res = await fetch(sheetUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    csv = await res.text();
  } catch (err) {
    console.warn(
      `[sync] open-mics. fetch failed (${err instanceof Error ? err.message : err}). Keeping previous JSON.`,
    );
    return;
  }

  const rows = parseCsv(csv);
  if (rows.length === 0) {
    console.warn("[sync] open-mics. sheet returned 0 rows. Keeping previous JSON.");
    return;
  }

  const previous = readPrevious();
  const previousById = new Map<string, OpenMic>(
    (previous?.mics ?? []).map((m) => [m.id, m]),
  );

  const mics: OpenMic[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const day = normalizeDay(row.day ?? "");
    if (!day) {
      errors.push(`row ${i + 2}: invalid day "${row.day}"`);
      continue;
    }
    const required = ["name", "venue", "address", "city", "region", "time"] as const;
    const missing = required.filter((k) => !row[k]);
    if (missing.length > 0) {
      errors.push(`row ${i + 2}: missing ${missing.join(", ")}`);
      continue;
    }

    const id = makeId(row, i);
    let lat = Number.parseFloat(row.lat ?? "");
    let lng = Number.parseFloat(row.lng ?? row.lon ?? "");

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const cached = previousById.get(id);
      if (cached) {
        lat = cached.lat;
        lng = cached.lng;
      } else {
        const query = `${row.address}, ${row.city}, ${row.region}`;
        const located = await geocode(query);
        if (located) {
          lat = located.lat;
          lng = located.lng;
        } else {
          errors.push(`row ${i + 2}: could not geocode "${query}"`);
          continue;
        }
        await new Promise((r) => setTimeout(r, 1100));
      }
    }

    mics.push({
      id,
      name: row.name,
      venue: row.venue,
      address: row.address,
      city: row.city,
      region: row.region,
      lat,
      lng,
      day,
      time: row.time,
      frequency: "weekly",
      host: row.host || undefined,
      signupUrl: row.signup_url || row.signupurl || undefined,
      notes: row.notes || undefined,
    });
  }

  const manifest: OpenMicsManifest = {
    fetchedAt: new Date().toISOString(),
    source: "google-sheet",
    status: errors.length === 0 ? "ok" : mics.length === 0 ? "error" : "stale",
    errorMessage: errors.length === 0 ? null : errors.join("; "),
    mics,
  };

  writeJson(OUT_PATH, manifest);
  console.log(
    `[sync] open-mics. wrote ${mics.length} mics. ${errors.length} skipped.`,
  );
  if (errors.length > 0) {
    for (const e of errors) console.warn(`  - ${e}`);
  }
}

main().catch((err) => {
  console.error("[sync] open-mics. unexpected error:", err);
  process.exitCode = 1;
});
