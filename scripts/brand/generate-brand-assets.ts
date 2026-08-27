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
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT = join(ROOT, "public/brand");
const BADGE = join(OUT, "SGP_Badge_Gold.png");

// Optional simplified icon master. The full badge is line art: its thinnest
// stroke is 18px of 1466px artwork, which renders at 0.16px in a 16px favicon
// and 0.33px at 32px. Both are invisible, so the small sizes come out a blob.
// When SGP_Icon_Gold.png is present it supplies every size below ICON_CUTOFF;
// the badge still supplies the rest. Until then the badge is used throughout
// and this script says so, rather than silently shipping the blob.
const ICON = join(OUT, "SGP_Icon_Gold.png");
const ICON_CUTOFF = 96;

/** Tuxedo. The one background this script paints, for the opaque iOS slot. */
const TUXEDO = { r: 0x0f, g: 0x0f, b: 0x0f, alpha: 1 };

// 48 is the Windows tile and Android launcher size; it was missing before.
// Web renditions. The masters are print-resolution: the lockup is 3353px wide
// and 523KB, and the footer renders it at 320px on every page, which is ten
// times more pixels than the slot needs and half a megabyte of transfer.
// Static export sets images.unoptimized, so next/image will not resize
// anything; nothing shrinks these unless this script does.
//
// One rendition per colorway at 2x the documented web maximum, so a 400px
// render is still retina-sharp. A call site asking for more than WEB_MAX falls
// back to the master rather than upscaling.
const WEB_DIR = join(OUT, "web");
const WEB_MAX = { lockup: 400, badge: 200 } as const;

const COLORWAYS = {
  lockup: ["Tuxedo", "Ivory", "Gold", "White"],
  badge: ["Tuxedo", "Ivory", "Gold"],
} as const;

async function webRenditions() {
  await mkdir(WEB_DIR, { recursive: true });
  for (const [kind, names] of Object.entries(COLORWAYS)) {
    const width = WEB_MAX[kind as keyof typeof WEB_MAX] * 2;
    for (const name of names) {
      const file = `SGP_${kind === "lockup" ? "Lockup" : "Badge"}_${name}.png`;
      // Linear, as with the icon: lanczos overshoots at hard edges and pushes
      // pixels off palette.
      await sharp(join(OUT, file))
        .resize({ width, kernel: "linear" })
        .png({ compressionLevel: 9 })
        .toFile(join(WEB_DIR, file));
      console.log(`  -> web/${file} (${width}px)`);
    }
  }
}

const FAVICON_SIZES = [16, 32, 48, 64, 128, 256, 512] as const;

const hasIcon = existsSync(ICON);

/** Which master a given size should come from. */
function sourceFor(size: number): string {
  return hasIcon && size < ICON_CUTOFF ? ICON : BADGE;
}

async function renderAt(source: string, size: number): Promise<Buffer> {
  return sharp(source)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log("[brand] badge master:", BADGE);
  if (hasIcon) {
    console.log(`[brand] icon master:  ${ICON} (sizes under ${ICON_CUTOFF}px)`);
  } else {
    console.warn(
      `[brand] NOTE: ${ICON} not found. Small favicons fall back to the badge, ` +
        `whose line art is illegible below ~96px. See docs/design-tokens.md.`,
    );
  }

  for (const size of FAVICON_SIZES) {
    const source = sourceFor(size);
    await sharp(await renderAt(source, size)).toFile(join(OUT, `favicon-${size}.png`));
    console.log(`  -> favicon-${size}.png  (${source.endsWith("SGP_Icon_Gold.png") ? "icon" : "badge"})`);
  }

  // iOS renders this on an opaque tile and rounds the corners itself, so the
  // badge is inset to keep its ring clear of the rounding.
  const APPLE = 180;
  const inset = Math.round(APPLE * 0.82);
  await sharp({
    create: { width: APPLE, height: APPLE, channels: 4, background: TUXEDO },
  })
    // The asset is 180px but iOS renders it at about 60pt on the home screen,
    // so it is a small-size slot despite the large file. It takes the icon
    // master, not the badge, whose line art would be illegible at 60pt.
    .composite([{ input: await renderAt(hasIcon ? ICON : BADGE, inset), gravity: "centre" }])
    .png()
    .toFile(join(OUT, "apple-touch-icon.png"));
  console.log("  -> apple-touch-icon.png (180x180 on Tuxedo)");

  await sharp(await renderAt(BADGE, 256)).toFile(join(OUT, "og-mark.png"));
  console.log("  -> og-mark.png (256x256)");

  await webRenditions();
}

main().catch((error) => {
  console.error("[brand] failed:", error);
  process.exit(1);
});
