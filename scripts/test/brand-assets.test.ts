// Guards the seven logo masters against silent corruption.
//
// This exists because it already happened: the optimize-images workflow ran on
// the upload commit and resized every master from 3353x3028 RGBA to 720x650
// indexed palette, which destroys both the documented canvas and the straight
// alpha the flat-ink guarantee depends on. The optimizer now skips SGP_ files,
// and this test fails the build if anything else ever does the same.
//
// Checks, per file:
//   1. exact canvas from SGP_Logo_Corrected/MANIFEST.md
//   2. colour type 6 (RGBA), never a palette
//   3. exactly one opaque ink value, and it is the expected palette colour
//   4. alpha masks identical across a family, proving one shared knockout
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { inflateSync } from "node:zlib";

const DIR = join(process.cwd(), "public/brand");

const EXPECTED = [
  { file: "SGP_Lockup_Tuxedo.png", w: 3353, h: 3028, ink: [0x0f, 0x0f, 0x0f], family: "lockup" },
  { file: "SGP_Lockup_Ivory.png", w: 3353, h: 3028, ink: [0xf4, 0xee, 0xe2], family: "lockup" },
  { file: "SGP_Lockup_Gold.png", w: 3353, h: 3028, ink: [0xd4, 0xaa, 0x4a], family: "lockup" },
  { file: "SGP_Lockup_White.png", w: 3353, h: 3028, ink: [0xff, 0xff, 0xff], family: "lockup" },
  { file: "SGP_Badge_Tuxedo.png", w: 1750, h: 1750, ink: [0x0f, 0x0f, 0x0f], family: "badge" },
  { file: "SGP_Badge_Ivory.png", w: 1750, h: 1750, ink: [0xf4, 0xee, 0xe2], family: "badge" },
  { file: "SGP_Badge_Gold.png", w: 1750, h: 1750, ink: [0xd4, 0xaa, 0x4a], family: "badge" },
] as const;

let failures = 0;
function check(label: string, condition: boolean, detail?: string) {
  if (!condition) {
    failures += 1;
    console.error(`  FAIL ${label}${detail ? `: ${detail}` : ""}`);
  }
}

type Png = { width: number; height: number; colorType: number; pixels: Buffer };

function decode(path: string): Png {
  const buf = readFileSync(path);
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idat: Buffer[] = [];
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString("latin1", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    }
    offset += 12 + length;
  }
  if (colorType !== 6) return { width, height, colorType, pixels: Buffer.alloc(0) };

  const raw = inflateSync(Buffer.concat(idat));
  const bpp = 4;
  const stride = width * bpp;
  const out = Buffer.alloc(stride * height);
  let pos = 0;
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[pos];
    pos += 1;
    const line = Buffer.from(raw.subarray(pos, pos + stride));
    pos += stride;
    for (let x = 0; x < stride; x += 1) {
      const a = x >= bpp ? line[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      if (filter === 1) line[x] = (line[x] + a) & 0xff;
      else if (filter === 2) line[x] = (line[x] + b) & 0xff;
      else if (filter === 3) line[x] = (line[x] + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        line[x] = (line[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
      }
    }
    line.copy(out, y * stride);
    prev = line;
  }
  return { width, height, colorType, pixels: out };
}

const masks = new Map<string, Set<string>>();

for (const spec of EXPECTED) {
  const png = decode(join(DIR, spec.file));
  check(`${spec.file} is RGBA`, png.colorType === 6, `colour type ${png.colorType}, a palette PNG cannot carry straight alpha`);
  if (png.colorType !== 6) continue;

  check(
    `${spec.file} canvas`,
    png.width === spec.w && png.height === spec.h,
    `${png.width}x${png.height}, expected ${spec.w}x${spec.h}`,
  );

  const inks = new Set<string>();
  const alpha = Buffer.alloc(png.pixels.length / 4);
  for (let i = 0, a = 0; i < png.pixels.length; i += 4, a += 1) {
    alpha[a] = png.pixels[i + 3];
    if (png.pixels[i + 3] === 0xff) {
      inks.add(`${png.pixels[i]},${png.pixels[i + 1]},${png.pixels[i + 2]}`);
    }
  }
  const want = spec.ink.join(",");
  check(`${spec.file} flat ink`, inks.size === 1, `${inks.size} distinct opaque inks, expected 1`);
  check(`${spec.file} ink value`, inks.has(want), `expected rgb(${want})`);

  const digest = createHash("sha256").update(alpha).digest("hex");
  if (!masks.has(spec.family)) masks.set(spec.family, new Set());
  masks.get(spec.family)!.add(digest);
}

for (const [family, digests] of masks) {
  check(`${family} alpha masks identical`, digests.size === 1, `${digests.size} distinct masks, expected 1 shared knockout`);
}

// The simplified icon master is optional until it is supplied, but once it is
// there it must be square, RGBA, and made only of palette colours. Unlike the
// marks it is allowed two inks, since it carries its own Tuxedo ground.
const ICON = join(DIR, "SGP_Icon_Gold.png");
if (existsSync(ICON)) {
  const png = decode(ICON);
  check("SGP_Icon_Gold.png is RGBA", png.colorType === 6, `colour type ${png.colorType}`);
  check(
    "SGP_Icon_Gold.png is square",
    png.width === png.height,
    `${png.width}x${png.height}`,
  );
  check(
    "SGP_Icon_Gold.png is at least 512px",
    png.width >= 512,
    `${png.width}px, too small to downscale cleanly`,
  );
  if (png.colorType === 6) {
    // The icon grounds the mark on an opaque disc, so its antialiased edges
    // are opaque blends between two palette colours rather than partially
    // transparent. Those are legitimate. What is not legitimate is a hue that
    // does not sit on a line between two palette values, which is how an
    // off-palette colour would show up. So: allow anything close to such a
    // blend, reject anything else.
    const PALETTE: [number, number, number][] = [
      [15, 15, 15],
      [244, 238, 226],
      [212, 170, 74],
      [135, 104, 31],
      [140, 135, 129],
    ];
    const TOLERANCE = 6; // per-channel, absorbs rounding in the compositor

    function onPaletteBlend(r: number, g: number, b: number) {
      for (let i = 0; i < PALETTE.length; i += 1) {
        for (let j = i; j < PALETTE.length; j += 1) {
          const A = PALETTE[i];
          const B = PALETTE[j];
          // Project the pixel onto segment AB, then measure how far off it is.
          const ab = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
          const ap = [r - A[0], g - A[1], b - A[2]];
          const len2 = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2;
          const t = len2 === 0 ? 0 : Math.min(1, Math.max(0,
            (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / len2));
          const dr = r - (A[0] + ab[0] * t);
          const dg = g - (A[1] + ab[1] * t);
          const db = b - (A[2] + ab[2] * t);
          if (Math.abs(dr) <= TOLERANCE && Math.abs(dg) <= TOLERANCE && Math.abs(db) <= TOLERANCE) {
            return true;
          }
        }
      }
      return false;
    }

    const offPalette = new Set<string>();
    for (let i = 0; i < png.pixels.length; i += 4) {
      if (png.pixels[i + 3] !== 0xff) continue;
      const [r, g, b] = [png.pixels[i], png.pixels[i + 1], png.pixels[i + 2]];
      if (!onPaletteBlend(r, g, b)) offPalette.add(`${r},${g},${b}`);
    }
    check(
      "SGP_Icon_Gold.png stays on the palette",
      offPalette.size === 0,
      `${offPalette.size} opaque values are not palette colours or blends of two, e.g. rgb(${[...offPalette][0]})`,
    );
  }
} else {
  console.log("  note: SGP_Icon_Gold.png not supplied; small favicons fall back to the badge.");
}

if (failures > 0) {
  console.error(`\nbrand-assets test: ${failures} failure(s). The logo masters are final art; restore them from git rather than re-encoding.`);
  process.exit(1);
}
console.log(`brand-assets test: all ${EXPECTED.length} masters match the manifest.`);
