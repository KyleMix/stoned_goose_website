// Walks public/images and generates a WebP variant alongside each oversized
// image. Static export ships images with images.unoptimized: true, so next/image
// just emits an <img src> tag pointing at whatever path content/*.ts references.
// That means we have to ship pre-optimized files: this script produces them.
//
// Output: alongside foo.png it writes foo.webp, sized so the longest edge is
// no more than MAX_EDGE pixels. If the source is already small enough on disk,
// it is skipped. Run with `npm run images:optimize`. Commit the .webp outputs.
//
// content/*.ts references should point at the .webp paths to take advantage of
// the new variants. The originals stay in place as masters.

import { readdir, stat } from "node:fs/promises";
import { join, relative, parse } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SCAN_DIR = join(ROOT, "public/images");
const MAX_EDGE = 1600;
const SKIP_SMALLER_THAN_BYTES = 200 * 1024; // 200KB
const WEBP_QUALITY = 82;

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function main() {
  let touched = 0;
  let skipped = 0;
  let bytesIn = 0;
  let bytesOut = 0;

  for await (const file of walk(SCAN_DIR)) {
    const parsed = parse(file);
    const ext = parsed.ext.toLowerCase();
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") continue;

    const info = await stat(file);
    if (info.size < SKIP_SMALLER_THAN_BYTES) {
      skipped++;
      continue;
    }

    const out = join(parsed.dir, parsed.name + ".webp");
    const meta = await sharp(file).metadata();
    const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
    const resizer =
      longest > MAX_EDGE
        ? sharp(file).resize(
            meta.width && meta.width >= (meta.height ?? 0) ? MAX_EDGE : null,
            meta.height && (meta.height > (meta.width ?? 0)) ? MAX_EDGE : null,
            { withoutEnlargement: true },
          )
        : sharp(file);

    await resizer.webp({ quality: WEBP_QUALITY }).toFile(out);
    const outInfo = await stat(out);
    bytesIn += info.size;
    bytesOut += outInfo.size;
    touched++;
    console.log(
      `  ${relative(ROOT, file)} (${Math.round(info.size / 1024)}KB) -> ${parsed.name}.webp (${Math.round(outInfo.size / 1024)}KB)`,
    );
  }

  console.log("");
  console.log(`Optimized ${touched} image(s); skipped ${skipped} small file(s).`);
  console.log(
    `Total: ${(bytesIn / 1024 / 1024).toFixed(1)}MB -> ${(bytesOut / 1024 / 1024).toFixed(1)}MB ` +
      `(${Math.round((1 - bytesOut / bytesIn) * 100)}% reduction).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
