// Validate all three feed JSON files at build time. Wired into the
// prebuild step so a malformed feed file (hand-edit, drifted API
// response, anything) fails the build with a clear field-path error.
//
// Runs in the Node script sandbox via tsx, so Zod never reaches the
// client bundle.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  FacebookFeedSchema,
  InstagramFeedSchema,
  YouTubeFeedSchema,
  parseOrThrow,
} from "./schema";

const FEEDS_DIR = join(process.cwd(), "content", "feeds");

function loadJson(name: string) {
  const path = join(FEEDS_DIR, name);
  try {
    return JSON.parse(readFileSync(path, "utf8")) as unknown;
  } catch (err) {
    throw new Error(
      `[feeds] failed to read ${name}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

parseOrThrow(
  InstagramFeedSchema,
  loadJson("instagram.json"),
  "content/feeds/instagram.json",
);
parseOrThrow(
  YouTubeFeedSchema,
  loadJson("youtube.json"),
  "content/feeds/youtube.json",
);
parseOrThrow(
  FacebookFeedSchema,
  loadJson("facebook.json"),
  "content/feeds/facebook.json",
);

console.log("[feeds] validate: 3 feeds OK");
