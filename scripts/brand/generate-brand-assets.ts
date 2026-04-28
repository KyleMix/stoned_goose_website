// Generates illustration-only brand assets from the master logo PNG.
//
// Source asset (`public/brand/stoned-goose-mark.png`) is a 2400x2400 lockup
// that bakes the goose illustration above the "STONED GOOSE PRODUCTIONS"
// wordmark. House rule keeps the illustration and the Fraunces wordmark as
// separate identities, so this script crops the illustration and generates
// the favicon set, apple-touch-icon, OG corner mark, and a clean square
// on-ink variant. Run with `npm run brand:generate`. Commit the outputs.
//
// Outputs (all under public/brand/):
//   stoned-goose-mark-on-ink.png   illustration centered on a black square (2000)
//   stoned-goose-mark-on-bone.png  illustration recolored ink on a bone square
//   og-mark.png                    256x256 on-ink mark for OG card watermark
//   apple-touch-icon.png           180x180 on-ink, padded for iOS rounding
//   favicon-{16,32,64,128,256,512}.png
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

async function illustrationOnInk(): Promise<Buffer> {
  const cropped = await sharp(SRC)
    .extract(CROP)
    .toBuffer();
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
        input: cropped,
        top: Math.round((SQUARE - CROP.height) / 2),
        left: Math.round((SQUARE - CROP.width) / 2),
      },
    ])
    .png()
    .toBuffer();
}

async function illustrationOnBone(): Promise<Buffer> {
  // The cropped illustration is white-on-black. To produce a bone-friendly
  // ink-on-bone version, invert the colors then composite onto a bone canvas.
  const cropped = await sharp(SRC)
    .extract(CROP)
    .negate({ alpha: false })
    .toBuffer();
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
        input: cropped,
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
