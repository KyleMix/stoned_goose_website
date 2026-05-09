// One-shot importer for the Open Mics XLSX the owner provided.
//
// Reads the four-sheet workbook (Vancouver CAN, Washington USA, Oregon USA,
// California USA), normalizes each row into the OpenMic shape, geocodes
// addresses missing lat/lng via Nominatim with the same 1 req/sec polite
// throttle and User-Agent the existing scripts/sync-open-mics.ts uses,
// and writes content/feeds/open-mics.json.
//
// Reuses the cached lat/lng from the existing JSON when address matches so
// re-runs are cheap. Run with:
//   tsx scripts/import-open-mics-xlsx.ts <path-to-xlsx>

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as XLSX from "xlsx";
import type {
  OpenMic,
  OpenMicDay,
  OpenMicsManifest,
} from "../content/open-mics";
import { writeJson } from "./_sync-helpers";

const OUT_PATH = join(process.cwd(), "content", "feeds", "open-mics.json");
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const USER_AGENT =
  "StonedGooseProductionsOpenMicSync/1.0 (kyle@stonedgooseproductions.com)";

const VALID_DAYS: OpenMicDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type Row = (string | number)[];

type RegionLabel = {
  region: string;
  country: string;
};

// Only Washington and Oregon mics ship on the map. The workbook also has
// Vancouver CAN and California USA sheets; those are intentionally skipped.
const SHEET_REGIONS: Record<string, RegionLabel> = {
  "Washington USA": { region: "WA", country: "USA" },
  "Oregon USA": { region: "OR", country: "USA" },
};

function isHeaderRow(r: Row): boolean {
  const first = String(r[0] ?? "").toLowerCase();
  return first.includes("name (club)") || first === "" || first === "req.->";
}

function findDays(r: Row, dayStartIdx: number): OpenMicDay[] {
  const days: OpenMicDay[] = [];
  for (let i = 0; i < 7; i++) {
    const cell = String(r[dayStartIdx + i] ?? "").trim().toLowerCase();
    if (
      cell === "yes" ||
      cell.startsWith("req") ||
      cell === "y"
    ) {
      days.push(VALID_DAYS[i]);
    }
  }
  return days;
}

const STREET_SUFFIX_RE =
  /^(.+?\s+(?:st|ave|avenue|blvd|boulevard|way|rd|road|dr|drive|pl|place|pkwy|parkway|hwy|highway|ct|court|ln|lane|cir|circle|ter|terrace|st\.|ave\.|blvd\.|rd\.|dr\.))\b\.?(?:\s+(?:n|s|e|w|ne|nw|se|sw|north|south|east|west))?\s+(.+?)$/i;

function parseLocation(
  loc: string,
  fallbackRegion: string,
): { address: string; city: string; region: string } | null {
  // Handles a few input shapes:
  //   "1409 Cornwall Ave, Bellingham, WA 98225"     <- canonical
  //   "300 Cambie St, Vancouver, BC V6B 2N3,"        <- trailing comma
  //   "1716 Hewitt AVE, Everett WA 98201"            <- city+state in one part
  //   "712 NE 45th St Seattle, WA 98105"             <- no comma before city
  //   "9646 17TH AVE SW Seattle wa 98106"            <- no commas at all
  const cleaned = loc
    .replace(/\s+/g, " ")
    .replace(/,\s*$/, "")
    .trim();
  if (!cleaned) return null;

  let parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);
  let address = "";
  let city = "";
  let region = fallbackRegion;

  if (parts.length >= 3) {
    address = parts[0];
    city = parts[parts.length - 2];
    const tail = parts[parts.length - 1];
    const m = tail.match(/^([A-Z]{2})\b/);
    if (m) region = m[1];
  } else if (parts.length === 2) {
    // Shape A: "ADDRESS, CITY STATE ZIP"
    // Shape B: "ADDRESS CITY, STATE ZIP"
    const second = parts[1];
    const stateOnly = second.match(/^([A-Z]{2})\s*\d{0,5}$/i);
    if (stateOnly) {
      // Shape B: split the first part on a street-suffix boundary.
      region = stateOnly[1].toUpperCase();
      const m = parts[0].match(STREET_SUFFIX_RE);
      if (m) {
        address = m[1].trim();
        city = m[2].trim();
      } else {
        // Last token of first part is the city.
        const tokens = parts[0].split(/\s+/);
        city = tokens.pop() ?? "";
        address = tokens.join(" ");
      }
    } else {
      // Shape A
      address = parts[0];
      const m = second.match(/^(.+?)\s+([A-Z]{2})\s*\d{0,5}$/i);
      if (m) {
        city = m[1].trim();
        region = m[2].toUpperCase();
      } else {
        city = second;
      }
    }
  } else if (parts.length === 1) {
    // No commas at all. Strip trailing STATE ZIP, then split address + city.
    const stateZip = parts[0].match(/^(.+?)\s+([A-Z]{2})\s*\d{0,5}$/i);
    if (!stateZip) return null;
    region = stateZip[2].toUpperCase();
    const head = stateZip[1].trim();
    const m = head.match(STREET_SUFFIX_RE);
    if (m) {
      address = m[1].trim();
      city = m[2].trim();
    } else {
      const tokens = head.split(/\s+/);
      city = tokens.pop() ?? "";
      address = tokens.join(" ");
    }
  } else {
    return null;
  }

  city = city.replace(/\s+\d{5}$/, "").trim();
  if (!city || /^[A-Z]{2}$/.test(city) || !address) return null;
  return { address, city: titleCase(city), region };
}

function titleCase(s: string) {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// Hand-curated centroid table covering every city in the supplied workbook
// plus a handful of likely additions. Used when network geocoding is not
// available (the agent environment firewalls Nominatim). Coordinates are
// rough downtown centroids; markercluster handles visual overlap.
const CITY_CENTROIDS: Record<string, [number, number]> = {
  // Washington
  "seattle, wa": [47.6062, -122.3321],
  "tacoma, wa": [47.2529, -122.4443],
  "olympia, wa": [47.0379, -122.9007],
  "bellingham, wa": [48.7519, -122.4787],
  "bremerton, wa": [47.5673, -122.6329],
  "vancouver, wa": [45.6387, -122.6615],
  "everett, wa": [47.979, -122.2021],
  "lynnwood, wa": [47.8209, -122.3151],
  "shoreline, wa": [47.7556, -122.3414],
  "renton, wa": [47.4829, -122.2171],
  "spokane, wa": [47.6588, -117.426],
  "marysville, wa": [48.0518, -122.1771],
  "centralia, wa": [46.7163, -122.9543],
  "burien, wa": [47.4704, -122.3468],
  "ruston, wa": [47.3057, -122.5057],
  "blaine, wa": [48.9925, -122.7474],
  "lakewood, wa": [47.1718, -122.5185],
  "kirkland, wa": [47.6815, -122.2087],
  "auburn, wa": [47.3073, -122.2285],
  "kent, wa": [47.3809, -122.2348],
  "seatac, wa": [47.4427, -122.2945],
  "snohomish, wa": [47.9123, -122.0982],
  "silverdale, wa": [47.6446, -122.6943],
  "sumner, wa": [47.2032, -122.2401],
  "kenmore, wa": [47.7573, -122.244],
  "redmond, wa": [47.674, -122.1215],
  "bellevue, wa": [47.6101, -122.2015],
  // Oregon
  "portland, or": [45.5152, -122.6784],
  "bend, or": [44.0582, -121.3153],
  "beaverton, or": [45.4871, -122.8037],
  "salem, or": [44.9429, -123.0351],
  "springfield, or": [44.0462, -123.022],
  "eugene, or": [44.0521, -123.0868],
  "ashland, or": [42.1946, -122.7095],
  "corvallis, or": [44.5646, -123.262],
  // California
  "los angeles, ca": [34.0522, -118.2437],
  "san francisco, ca": [37.7749, -122.4194],
  "san diego, ca": [32.7157, -117.1611],
  "san jose, ca": [37.3382, -121.8863],
  "riverside, ca": [33.9533, -117.3962],
  "ventura, ca": [34.2746, -119.229],
  "burbank, ca": [34.1808, -118.309],
  "santa monica, ca": [34.0195, -118.4912],
  "huntington beach, ca": [33.6595, -117.9988],
  "glendale, ca": [34.1425, -118.2551],
  "long beach, ca": [33.7701, -118.1937],
  "goleta, ca": [34.4358, -119.8276],
  "thousand oaks, ca": [34.1706, -118.8376],
  "la verne, ca": [34.1008, -117.7678],
  "santa ana, ca": [33.7455, -117.8677],
  "tarzana, ca": [34.1731, -118.5524],
  "baldwin park, ca": [34.0853, -117.9609],
  "ontario, ca": [34.0633, -117.6509],
  "eureka, ca": [40.8021, -124.1637],
  "santa barbara, ca": [34.4208, -119.6982],
  "north hollywood, ca": [34.187, -118.3814],
  "paramount, ca": [33.8894, -118.1597],
  "inglewood, ca": [33.9617, -118.3531],
  "gardena, ca": [33.8884, -118.3089],
  "bellflower, ca": [33.8817, -118.117],
  "colton, ca": [34.0739, -117.3137],
  "covina, ca": [34.09, -117.8903],
  "anaheim, ca": [33.8366, -117.9143],
  "van nuys, ca": [34.1869, -118.4489],
  "toluca lake, ca": [34.1525, -118.3614],
  "oakland, ca": [37.8044, -122.2712],
  "berkeley, ca": [37.8716, -122.273],
  "sacramento, ca": [38.5816, -121.4944],
  // BC
  "vancouver, bc": [49.2827, -123.1207],
};

const REGION_CENTROIDS: Record<string, [number, number]> = {
  WA: [47.5, -120.7],
  OR: [44.0, -120.5],
  CA: [36.7, -119.4],
  BC: [53.7, -127.6],
};

function centroidFallback(
  city: string,
  region: string,
  jitterSeed: string,
): { lat: number; lng: number } | null {
  const key = `${city.toLowerCase()}, ${region.toLowerCase()}`;
  const base = CITY_CENTROIDS[key] ?? REGION_CENTROIDS[region];
  if (!base) return null;
  // Deterministic jitter so the same address always lands at the same spot
  // and pins don't all stack at the centroid. Range ~0.012 degrees (~1.3km).
  const seed = hashString(jitterSeed);
  const dx = ((seed & 0xffff) / 0xffff - 0.5) * 0.024;
  const dy = (((seed >> 16) & 0xffff) / 0xffff - 0.5) * 0.024;
  return { lat: base[0] + dy, lng: base[1] + dx };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function parseTime(value: string): string {
  // "7pm/8pm-11pm" -> "8pm" (start). "/9pm" -> "9pm". "6:30pm/7pm-9pm" -> "7pm".
  // Falls back to the original string if we can't parse.
  if (!value) return "TBD";
  const v = value.trim();
  const slash = v.indexOf("/");
  let segment = v;
  if (slash !== -1) {
    const after = v.slice(slash + 1).trim();
    if (after) segment = after;
  }
  const dash = segment.indexOf("-");
  if (dash !== -1) segment = segment.slice(0, dash).trim();
  return segment || v;
}

function makeId(name: string, city: string, day: string, index: number): string {
  const base = `${name}-${city}-${day}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || `mic-${index}`;
}

async function geocode(
  query: string,
): Promise<{ lat: number; lng: number } | null> {
  const url = `${NOMINATIM}?format=json&limit=1&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) {
      console.warn(`[import] geocode ${url} -> ${res.status}`);
      return null;
    }
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data || data.length === 0) return null;
    const lat = Number.parseFloat(data[0].lat);
    const lng = Number.parseFloat(data[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch (err) {
    console.warn(
      `[import] geocode err: ${err instanceof Error ? err.message : err}`,
    );
    return null;
  }
}

function readPrevious(): OpenMicsManifest | null {
  if (!existsSync(OUT_PATH)) return null;
  try {
    return JSON.parse(readFileSync(OUT_PATH, "utf8")) as OpenMicsManifest;
  } catch {
    return null;
  }
}

function buildNotes(r: Row, columns: string[]): string {
  const find = (label: string) =>
    String(
      r[columns.findIndex((c) => c.toLowerCase().trim().startsWith(label))] ??
        "",
    ).trim();
  const fragments: string[] = [];
  const requirements = find("requ");
  const age = find("age requirement");
  const setTime = find("set time");
  const price = find("price for time");
  const type = find("open mic type");
  const wheelchair = find("wheelchair");
  const parking = find("parking");
  const phone = find("phone");
  if (type) fragments.push(type);
  if (price) fragments.push(price);
  if (setTime) fragments.push(`Set ${setTime}`);
  if (age) fragments.push(`Age ${age}`);
  if (wheelchair && wheelchair.toLowerCase() !== "no")
    fragments.push("Wheelchair accessible");
  if (parking) fragments.push(`Parking. ${parking}`);
  if (phone) fragments.push(phone);
  if (requirements) fragments.push(requirements);
  return fragments.filter(Boolean).join(". ");
}

async function main() {
  const xlsxPath = process.argv[2];
  if (!xlsxPath || !existsSync(xlsxPath)) {
    console.error(
      `[import] usage: tsx scripts/import-open-mics-xlsx.ts <path-to-xlsx>`,
    );
    process.exit(1);
  }

  const wb = XLSX.readFile(xlsxPath);
  const previous = readPrevious();
  const cache = new Map<string, { lat: number; lng: number }>();
  for (const m of previous?.mics ?? []) {
    const key = `${m.address}|${m.city}|${m.region}`.toLowerCase();
    cache.set(key, { lat: m.lat, lng: m.lng });
  }

  const mics: OpenMic[] = [];
  const errors: string[] = [];
  let geocodeCount = 0;
  let cacheHits = 0;
  let fallbackCount = 0;

  for (const sheetName of wb.SheetNames) {
    const meta = SHEET_REGIONS[sheetName];
    if (!meta) {
      console.warn(`[import] skipping unknown sheet "${sheetName}"`);
      continue;
    }
    const ws = wb.Sheets[sheetName];
    const allRows = XLSX.utils.sheet_to_json<Row>(ws, {
      header: 1,
      defval: "",
    });
    if (allRows.length === 0) continue;

    const headerRow = allRows[0].map((c) => String(c).trim());
    const dayStartIdx = headerRow.findIndex(
      (c) => c.toLowerCase() === "monday",
    );
    if (dayStartIdx === -1) {
      errors.push(`${sheetName}: no Monday column`);
      continue;
    }

    for (let i = 1; i < allRows.length; i++) {
      const r = allRows[i];
      if (!r) continue;
      if (isHeaderRow(r)) continue;
      const name = String(r[0] ?? "").trim();
      const location = String(r[1] ?? "").trim();
      const timeRaw = String(r[2] ?? "").trim();
      if (!name || !location) continue;

      const days = findDays(r, dayStartIdx);
      if (days.length === 0) continue;

      const parsed = parseLocation(location, meta.region);
      if (!parsed) {
        errors.push(`${sheetName} row ${i + 1}: bad location "${location}"`);
        continue;
      }

      const cacheKey =
        `${parsed.address}|${parsed.city}|${parsed.region}`.toLowerCase();
      let coords = cache.get(cacheKey);
      let usedFallback = false;
      if (!coords) {
        const query = `${parsed.address}, ${parsed.city}, ${parsed.region}, ${meta.country}`;
        const located = await geocode(query);
        if (located) {
          coords = located;
          cache.set(cacheKey, coords);
          geocodeCount++;
          await new Promise((res) => setTimeout(res, 1100));
        } else {
          // Network geocoding unavailable. Fall back to a city centroid plus
          // deterministic jitter so the mic still appears on the map. The
          // owner can re-run this importer in an environment with outbound
          // Nominatim access to upgrade these to street-level precision.
          const fallback = centroidFallback(
            parsed.city,
            parsed.region,
            `${parsed.address}|${parsed.city}|${parsed.region}`,
          );
          if (fallback) {
            coords = fallback;
            usedFallback = true;
            fallbackCount++;
          } else {
            errors.push(
              `${sheetName} row ${i + 1}: no centroid for "${parsed.city}, ${parsed.region}"`,
            );
            continue;
          }
        }
      } else {
        cacheHits++;
      }

      const time = parseTime(timeRaw);
      const signupUrl = String(
        r[headerRow.findIndex((c) => c.toLowerCase().startsWith("web"))] ?? "",
      ).trim();
      const email = String(
        r[headerRow.findIndex((c) => c.toLowerCase() === "email")] ?? "",
      ).trim();
      const notes = buildNotes(r, headerRow);
      const noteWithFallback = usedFallback
        ? [notes, "Approximate location."].filter(Boolean).join(". ")
        : notes;

      // Multi-day rows produce one record per day so the filter chips work.
      for (const day of days) {
        const id = makeId(name, parsed.city, day, mics.length);
        mics.push({
          id,
          name,
          venue: name,
          address: parsed.address,
          city: parsed.city,
          region: parsed.region,
          lat: coords.lat,
          lng: coords.lng,
          day,
          time,
          host: email || undefined,
          signupUrl: signupUrl || undefined,
          notes: noteWithFallback || undefined,
        });
      }
    }
  }

  const manifest: OpenMicsManifest = {
    fetchedAt: new Date().toISOString(),
    source: "google-sheet",
    status:
      errors.length === 0 && fallbackCount === 0
        ? "ok"
        : mics.length > 0
          ? "stale"
          : "error",
    errorMessage:
      errors.length === 0
        ? fallbackCount > 0
          ? `${fallbackCount} mics positioned at city centroid (geocoder unavailable). Re-run with Nominatim access for street-level precision.`
          : null
        : errors.slice(0, 5).join("; "),
    mics,
  };

  writeJson(OUT_PATH, manifest);
  console.log(
    `[import] wrote ${mics.length} mics (${geocodeCount} geocoded, ${cacheHits} cached, ${fallbackCount} centroid-fallback, ${errors.length} skipped) to ${OUT_PATH}`,
  );
  if (errors.length > 0) {
    for (const e of errors.slice(0, 10)) console.warn(`  - ${e}`);
    if (errors.length > 10) console.warn(`  ... ${errors.length - 10} more`);
  }
}

main().catch((err) => {
  console.error("[import] unexpected error:", err);
  process.exitCode = 1;
});
