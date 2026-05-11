// Build-time LQIP (low-quality image placeholder) generator.
//
// Reads image paths from content/comedians.ts and content/members.ts plus
// hard-coded show posters, and emits base64 blurDataURL strings into
// content/.generated/placeholders.json keyed by the public path.
//
// Components read this map at render time and pass blurDataURL +
// placeholder="blur" to next/image so the user sees a soft halftone-ish
// fade instead of a flash of haze background while the real PNG loads.
// next/image is configured `unoptimized: true` (required for static
// export), so plaiceholder fills the gap that next's built-in placeholder
// would otherwise cover.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getPlaiceholder } from "plaiceholder";
import { writeJson } from "./_sync-helpers";
import { comedians } from "../content/comedians";
import { members } from "../content/members";
import { featuredSpecial } from "../content/shows";

const OUT_PATH = join(
  process.cwd(),
  "content",
  ".generated",
  "placeholders.json",
);
const PUBLIC_DIR = join(process.cwd(), "public");

async function placeholderFor(publicPath: string): Promise<string | null> {
  if (!publicPath || !publicPath.startsWith("/")) return null;
  const absolute = join(PUBLIC_DIR, publicPath);
  if (!existsSync(absolute)) {
    console.warn(`[placeholders] missing file: ${publicPath}`);
    return null;
  }
  try {
    const buffer = readFileSync(absolute);
    const { base64 } = await getPlaiceholder(buffer, { size: 8 });
    return base64;
  } catch (err) {
    console.warn(
      `[placeholders] failed for ${publicPath}: ${err instanceof Error ? err.message : err}`,
    );
    return null;
  }
}

async function main() {
  const sources: string[] = [
    ...comedians.map((c) => c.photo),
    ...members.map((m) => m.photo),
    featuredSpecial.poster,
  ];
  const unique = Array.from(new Set(sources.filter(Boolean)));

  const out: Record<string, string> = {};
  for (const path of unique) {
    const placeholder = await placeholderFor(path);
    if (placeholder) out[path] = placeholder;
  }

  writeJson(OUT_PATH, out);
  console.log(
    `[placeholders] wrote ${Object.keys(out).length}/${unique.length} entries to ${OUT_PATH}`,
  );
}

main().catch((err) => {
  console.error("[placeholders] unexpected error:", err);
  process.exitCode = 1;
});
