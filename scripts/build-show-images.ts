// Headliner images -> WebP variants + content/.generated/show-images.json.
//
// Static export disables next/image optimization, so browsers download
// exactly the files we ship. The PNG originals in public/shows/ are large
// (a cutout runs 1.5 MB), so this writes WebP copies at the widths the
// /shows page actually renders, next to each original:
//
//   arch    300w + 600w    (displayed at 300x340, so 1x and 2x)
//   flyer   816w + 1632w   (the lightbox, 1x and 2x)
//   cutout  480w + 960w    (the hero, 1x and 2x)
//
// A width larger than the source is skipped rather than upscaled: the current
// flyers are 816 wide, so they get one variant until a 2x export replaces them.
// The PNG originals are never touched.
//
// Which files to process comes from the Headliners collection
// (content/performers), not a directory walk, so a comic added entirely from
// the CMS is picked up with no code change. The optimize-images workflow runs
// this after every CMS save; run it by hand with:
//
//   npm run build:show-images
//
// The manifest records each original's size and its variants. The page reads
// it to build srcset, and falls back to the plain original for any image the
// manifest does not know yet, so a fresh upload never renders broken.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const PUBLIC = join(ROOT, "public");
const PERFORMERS = join(ROOT, "content", "performers");
const MANIFEST = join(ROOT, "content", ".generated", "show-images.json");

const WIDTHS = {
  arch: [300, 600],
  flyer: [816, 1632],
  cutout: [480, 960],
} as const;

type Kind = keyof typeof WIDTHS;

export type ShowImageEntry = {
  width: number;
  height: number;
  webp: { src: string; width: number }[];
};

function performerImages(): { kind: Kind; src: string }[] {
  if (!existsSync(PERFORMERS)) return [];
  const out: { kind: Kind; src: string }[] = [];
  for (const item of readdirSync(PERFORMERS, { withFileTypes: true })) {
    const file = item.isDirectory()
      ? join(PERFORMERS, item.name, "index.json")
      : item.name.endsWith(".json")
        ? join(PERFORMERS, item.name)
        : null;
    if (!file || !existsSync(file)) continue;
    const data = JSON.parse(readFileSync(file, "utf8")) as {
      images?: Partial<Record<Kind, string | null>> | null;
    };
    for (const kind of Object.keys(WIDTHS) as Kind[]) {
      const src = data.images?.[kind];
      if (src && src.startsWith("/")) out.push({ kind, src });
    }
  }
  return out;
}

function variantPath(src: string, width: number) {
  const ext = extname(src);
  return `${dirname(src)}/${basename(src, ext)}-${width}.webp`;
}

async function processImage(kind: Kind, src: string): Promise<ShowImageEntry | null> {
  const file = join(PUBLIC, src);
  if (!existsSync(file)) {
    console.warn(`[show-images] ${src} is missing, skipping.`);
    return null;
  }
  const meta = await sharp(file).metadata();
  if (!meta.width || !meta.height) {
    console.warn(`[show-images] ${src} has no size metadata, skipping.`);
    return null;
  }

  // Never upscale. A source narrower than the smallest target gets one
  // variant at its own width, so it still benefits from the WebP encode.
  let widths: number[] = WIDTHS[kind].filter((w) => w <= meta.width!);
  if (widths.length === 0) widths = [meta.width];

  // Always re-encode. It is a handful of images, the output is byte-stable,
  // and an mtime check is meaningless on a fresh CI checkout, where it would
  // keep a stale variant after an upload replaced the original under the same
  // name. git only sees the files whose bytes changed.
  const webp: ShowImageEntry["webp"] = [];
  for (const width of widths) {
    const out = variantPath(src, width);
    await sharp(file)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, alphaQuality: 90 })
      .toFile(join(PUBLIC, out));
    webp.push({ src: out, width });
  }
  return { width: meta.width, height: meta.height, webp };
}

async function main() {
  const manifest: Record<string, ShowImageEntry> = {};
  for (const { kind, src } of performerImages()) {
    if (manifest[src]) continue;
    const entry = await processImage(kind, src);
    if (entry) manifest[src] = entry;
  }
  console.log(`[show-images] encoded ${Object.keys(manifest).length} images.`);

  // Sorted keys and a write only on change, so a rerun with nothing new
  // leaves the tree clean.
  const sorted = Object.fromEntries(
    Object.keys(manifest)
      .sort()
      .map((k) => [k, manifest[k]]),
  );
  const next = JSON.stringify(sorted, null, 2) + "\n";
  const prev = existsSync(MANIFEST) ? readFileSync(MANIFEST, "utf8") : "";
  if (next !== prev) {
    writeFileSync(MANIFEST, next, "utf8");
    console.log(`[show-images] manifest updated, ${Object.keys(sorted).length} images.`);
  } else {
    console.log("[show-images] manifest unchanged.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
