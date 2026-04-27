import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// Common helpers for sync:* scripts. Static export means every script writes
// JSON into content/.generated/, the matching content/<page>.ts imports it
// when present, and a hand-edited fallback ships when sync hasn't run.

export function writeJson(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

// Skip cleanly when the env vars aren't set. Lets prebuild iterate every
// sync script without erroring out on missing tokens. Logs once so CI shows
// which integrations are skipped vs. which actually ran.
export function requireEnv(...keys: string[]): Record<string, string> | null {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.log(
      `[sync] skipping. missing env: ${missing.join(", ")}`,
    );
    return null;
  }
  return Object.fromEntries(keys.map((k) => [k, process.env[k]!]));
}

// Wraps fetch with a clear failure mode. Prints the URL and HTTP status,
// returns null on failure so the caller can fall back to the previous JSON.
export async function safeFetch(
  url: string,
  init?: RequestInit,
): Promise<unknown | null> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      console.warn(`[sync] ${url} -> ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[sync] ${url} -> ${err instanceof Error ? err.message : err}`);
    return null;
  }
}
