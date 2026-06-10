// Bulk image optimizer. Walks public/images and public/brand, resizes any
// source that exceeds the target width per directory, and overwrites in
// place. Static export disables next/image runtime processing, so browsers
// download whatever we ship; this script gets the source weight in line.
//
// Targets (walked recursively, so admin uploads in subdirectories count):
//   public/images/comedians    -> max 1000w, JPEG q82 or PNG palette
//   public/images/members      -> max 1000w
//   public/images/media        -> max 1600w (16:9 posters)
//   public/images/shows        -> max 1600w (event posters)
//   public/brand/stoned-goose-logo-full.png  -> max 720w
//   public/brand/stoned-goose-mark*.png      -> max 480w
//   public/brand/og-mark.png                 -> leave (used by OG template)
//   public/brand/favicon-*.png               -> leave (sized intentionally)
//   public/brand/apple-touch-icon.png        -> leave
//
// Run on demand:
//   npm run optimize:images
//
// House rule: this script is owner-side. Review the diff before committing
// resized files. Source originals are preserved in git history.

import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();

type Target = {
  dir: string;
  maxWidth: number;
  /** Regex of filenames inside `dir` to skip. */
  skip?: RegExp;
};

const TARGETS: Target[] = [
  { dir: "public/images/comedians", maxWidth: 1000 },
  { dir: "public/images/members", maxWidth: 1000 },
  { dir: "public/images/media", maxWidth: 1600 },
  { dir: "public/images/shows", maxWidth: 1600 },
  {
    dir: "public/brand",
    maxWidth: 720,
    // Favicons + apple-touch-icon + og-mark have their own sizing rules.
    // The mark/logo PNGs are what get resized.
    skip: /^(favicon-|apple-touch-icon|og-mark)/i,
  },
];

const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function optimizeFile(path: string, maxWidth: number) {
  const buffer = readFileSync(path);
  const original = buffer.length;
  const ext = extname(path).toLowerCase();
  const pipeline = sharp(buffer).rotate();
  const meta = await pipeline.metadata();
  const width = meta.width ?? 0;
  if (!width) {
    console.warn(`[optimize] no width metadata, skipping: ${path}`);
    return { changed: false, before: original, after: original };
  }

  // Skip files that are already under target AND already lighter than a
  // generous size budget (200 KB). Otherwise re-encode to crush quality.
  const HEAVY = 200 * 1024;
  if (width <= maxWidth && original < HEAVY) {
    return { changed: false, before: original, after: original };
  }

  const next = width > maxWidth ? pipeline.resize({ width: maxWidth }) : pipeline;
  let out: Buffer;
  if (ext === ".png") {
    out = await next.png({ compressionLevel: 9, palette: true }).toBuffer();
  } else if (ext === ".webp") {
    out = await next.webp({ quality: 82 }).toBuffer();
  } else {
    out = await next.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  }
  // Re-encoding can come out at or above the original size (already-crushed
  // palette PNGs). Skip the write so the repo diff only carries real wins.
  if (out.length >= original) {
    return { changed: false, before: original, after: original };
  }
  writeFileSync(path, out);
  return { changed: true, before: original, after: out.length };
}

function collectFiles(dir: string, skip?: RegExp): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const name of entries) {
    if (skip && skip.test(name)) continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...collectFiles(path, skip));
    } else if (stat.isFile() && EXTENSIONS.has(extname(name).toLowerCase())) {
      files.push(path);
    }
  }
  return files;
}

async function main() {
  let totalBefore = 0;
  let totalAfter = 0;
  let changed = 0;

  for (const target of TARGETS) {
    const dir = join(ROOT, target.dir);
    const files = collectFiles(dir, target.skip);
    if (files.length === 0) {
      console.warn(`[optimize] no images found in: ${target.dir}`);
      continue;
    }
    for (const path of files) {
      const res = await optimizeFile(path, target.maxWidth);
      totalBefore += res.before;
      totalAfter += res.after;
      if (res.changed) {
        changed += 1;
        console.log(
          `[optimize] ${target.dir}/${basename(path)}: ${(res.before / 1024).toFixed(0)} KB -> ${(res.after / 1024).toFixed(0)} KB`,
        );
      }
    }
  }

  const mb = (n: number) => (n / 1024 / 1024).toFixed(2);
  console.log(
    `[optimize] resized ${changed} files. total ${mb(totalBefore)} MB -> ${mb(totalAfter)} MB.`,
  );
}

main().catch((err) => {
  console.error("[optimize] unexpected error:", err);
  process.exitCode = 1;
});
