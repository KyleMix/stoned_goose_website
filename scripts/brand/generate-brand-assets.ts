// Generates brand assets from the master logo PNG.
//
// Source asset (`public/brand/stoned-goose-mark.png`) is the 2400x2400
// "Stoned Goose Productions" lockup (smoking goose illustration plus
// the wordmark beneath). The full lockup is the brand mark and ships
// uncropped wherever the mark appears in flow (nav, hero status row,
// footer, mobile menu, 404). The illustration-only crop is kept around
// because at favicon sizes (16-32 px) the wordmark turns to mush and
// the goose silhouette reads better. So:
//
// Outputs (all under public/brand/):
//   stoned-goose-mark.png            (master, untouched)
//   stoned-goose-mark-sm.png         512x512 full lockup, transparent bg, bone-tinted
//   stoned-goose-mark-sm.webp        same as above, ~10x smaller payload
//   stoned-goose-mark-illustration.png  bone-on-transparent illustration crop (legacy)
//   stoned-goose-mark-on-ink.png     illustration centered on a black square (2000)
//   stoned-goose-mark-on-bone.png    illustration recolored ink on a bone square
//   og-mark.png                      256x256 illustration crop for OG card watermark
//   apple-touch-icon.png             180x180 illustration crop, padded for iOS rounding
//   favicon-{16,32,64,128,256,512}.png  illustration crop downscaled
//
// The vector SVG that the brief mentions is not generated. Source is raster.
// If a vector lands later, drop it at public/brand/stoned-goose-mark.svg and
// update layout/icons.
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = join(ROOT, "public/brand/stoned-goose-mark.png");
const OUT = join(ROOT, "public/brand");

const INK = { r: 10, g: 10, b: 10, alpha: 1 };
const BONE = { r: 239, g: 233, b: 221, alpha: 1 };

// The master is 2400x2400. The illustration sits roughly in the top 1750px
// with the wordmark below. Crop a centered region above the wordmark, then
// pad to a 2000x2000 square so favicon downscales stay readable.
const CROP = { left: 220, top: 60, width: 1960, height: 1740 } as const;
const SQUARE = 2000;

// Source is white-on-solid-black. Convert the black background to transparent
// so the bone-colored mark floats on whatever surface it lands on.
// Strategy: lift the red channel as the alpha channel (white=255 stays opaque,
// black=0 becomes transparent). Then recolor the surviving pixels to bone.
async function fullLockupTransparent(): Promise<Buffer> {
  const flat = await sharp(SRC).removeAlpha().toBuffer();
  const alpha = await sharp(flat).extractChannel(0).toBuffer();
  const tinted = await sharp(flat)
    .removeAlpha()
    .tint({ r: 239, g: 233, b: 221 })
    .toBuffer();
  return sharp(tinted).joinChannel(alpha).png().toBuffer();
}

async function illustrationTransparent(): Promise<Buffer> {
  const cropped = await sharp(SRC).extract(CROP).removeAlpha().toBuffer();
  const alpha = await sharp(cropped).extractChannel(0).toBuffer();
  const tinted = await sharp(cropped)
    .removeAlpha()
    .tint({ r: 239, g: 233, b: 221 })
    .toBuffer();
  return sharp(tinted).joinChannel(alpha).png().toBuffer();
}

async function illustrationOnInk(): Promise<Buffer> {
  const transparent = await illustrationTransparent();
  return sharp({
    create: {
      width: SQUARE,
      height: SQUARE,
      channels: 4,
      background: INK,
    },
  })
    .composite([
      {
        input: transparent,
        top: Math.round((SQUARE - CROP.height) / 2),
        left: Math.round((SQUARE - CROP.width) / 2),
      },
    ])
    .png()
    .toBuffer();
}

async function illustrationOnBone(): Promise<Buffer> {
  // For bone surfaces: take the cropped white-on-black, recolor the white
  // pixels to ink and use the inverted red channel as alpha.
  const cropped = await sharp(SRC).extract(CROP).removeAlpha().toBuffer();
  const alpha = await sharp(cropped).extractChannel(0).toBuffer();
  const tinted = await sharp(cropped)
    .removeAlpha()
    .tint({ r: 10, g: 10, b: 10 })
    .toBuffer();
  const inkOnTransparent = await sharp(tinted).joinChannel(alpha).png().toBuffer();
  return sharp({
    create: {
      width: SQUARE,
      height: SQUARE,
      channels: 4,
      background: BONE,
    },
  })
    .composite([
      {
        input: inkOnTransparent,
        top: Math.round((SQUARE - CROP.height) / 2),
        left: Math.round((SQUARE - CROP.width) / 2),
      },
    ])
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log("Generating brand assets from", SRC);

  const transparent = await illustrationTransparent();
  await sharp(transparent).toFile(
    join(OUT, "stoned-goose-mark-illustration.png"),
  );
  console.log(
    `  -> stoned-goose-mark-illustration.png (${CROP.width}x${CROP.height}, transparent bg)`,
  );

  // Small + WebP variants for in-flow placements (nav, hero status, footer,
  // mobile menu, 404 hero). The 2400x2400 master is overkill for a 24-200px
  // render and the static export ships it raw because next.config.mjs runs
  // images.unoptimized: true. A 512px source + WebP shrinks the per-page
  // mark payload from ~760KB to ~10-30KB depending on browser support.
  // These ship the FULL lockup (illustration + wordmark) so placements
  // never look "cut off."
  const SMALL = 512;
  const fullLockup = await fullLockupTransparent();
  await sharp(fullLockup)
    .resize(SMALL, SMALL)
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, "stoned-goose-mark-sm.png"));
  console.log(`  -> stoned-goose-mark-sm.png (${SMALL}x${SMALL})`);
  await sharp(fullLockup)
    .resize(SMALL, SMALL)
    .webp({ quality: 88 })
    .toFile(join(OUT, "stoned-goose-mark-sm.webp"));
  console.log(`  -> stoned-goose-mark-sm.webp (${SMALL}x${SMALL})`);

  const onInk = await illustrationOnInk();
  await sharp(onInk).toFile(join(OUT, "stoned-goose-mark-on-ink.png"));
  console.log("  -> stoned-goose-mark-on-ink.png (2000x2000)");

  const onBone = await illustrationOnBone();
  await sharp(onBone).toFile(join(OUT, "stoned-goose-mark-on-bone.png"));
  console.log("  -> stoned-goose-mark-on-bone.png (2000x2000)");

  const ogMark = await sharp(onInk).resize(256, 256).png().toBuffer();
  await sharp(ogMark).toFile(join(OUT, "og-mark.png"));
  console.log("  -> og-mark.png (256x256)");

  // iOS expects a fully opaque square. Inset the illustration so the rounded
  // corners on iOS don't crop the goose.
  const appleInset = 24;
  const appleSize = 180;
  const appleInner = await sharp(onInk)
    .resize(appleSize - appleInset * 2, appleSize - appleInset * 2)
    .toBuffer();
  await sharp({
    create: {
      width: appleSize,
      height: appleSize,
      channels: 4,
      background: INK,
    },
  })
    .composite([{ input: appleInner, top: appleInset, left: appleInset }])
    .png()
    .toFile(join(OUT, "apple-touch-icon.png"));
  console.log("  -> apple-touch-icon.png (180x180)");

  for (const size of [16, 32, 64, 128, 256, 512] as const) {
    const out = join(OUT, `favicon-${size}.png`);
    await sharp(onInk).resize(size, size).png().toFile(out);
    console.log(`  -> favicon-${size}.png`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
