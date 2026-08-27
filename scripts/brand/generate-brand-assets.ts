// Generates the icon set from the corrected badge master.
//
// The badge is the right source for icon slots: it is a circular mark, so it
// stays centred and recognisable in a round or squircle crop, where the
// 1.107:1 lockup would have to be letterboxed.
//
// Nothing here recolors a mark. Every colorway already exists as a file, and
// this script only resizes one of them and, for the iOS slot, composites it
// onto a flat Tuxedo square because that slot cannot be transparent. Gold is
// the source for every output: it holds up against both light and dark
// browser chrome, where Tuxedo or Ivory would disappear into one of them.
//
// Outputs (all under public/brand/):
//   favicon-{16,32,64,128,256,512}.png  gold badge, transparent
//   apple-touch-icon.png                180x180 gold badge on a Tuxedo square
//   og-mark.png                         256x256 gold badge, transparent
//
// Run with `npm run brand:generate`. Commit the outputs.
//
// Still open: these are raster. SVG remains the better end state for both
// marks, and is what the 40 foot banner case would need. Do not trace the
// goose to get there.
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT = join(ROOT, "public/brand");
const SRC = join(OUT, "SGP_Badge_Gold.png");

/** Tuxedo. The one background this script paints, for the opaque iOS slot. */
const TUXEDO = { r: 0x0f, g: 0x0f, b: 0x0f, alpha: 1 };

const FAVICON_SIZES = [16, 32, 64, 128, 256, 512] as const;

async function badgeAt(size: number): Promise<Buffer> {
  return sharp(SRC).resize(size, size, { fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log("[brand] source:", SRC);

  for (const size of FAVICON_SIZES) {
    await sharp(await badgeAt(size)).toFile(join(OUT, `favicon-${size}.png`));
    console.log(`  -> favicon-${size}.png`);
  }

  // iOS renders this on an opaque tile and rounds the corners itself, so the
  // badge is inset to keep its ring clear of the rounding.
  const APPLE = 180;
  const inset = Math.round(APPLE * 0.82);
  await sharp({
    create: { width: APPLE, height: APPLE, channels: 4, background: TUXEDO },
  })
    .composite([{ input: await badgeAt(inset), gravity: "centre" }])
    .png()
    .toFile(join(OUT, "apple-touch-icon.png"));
  console.log("  -> apple-touch-icon.png (180x180 on Tuxedo)");

  await sharp(await badgeAt(256)).toFile(join(OUT, "og-mark.png"));
  console.log("  -> og-mark.png (256x256)");
}

main().catch((error) => {
  console.error("[brand] failed:", error);
  process.exit(1);
});
