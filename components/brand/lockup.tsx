import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The lockup: goose with the joint, wordmark beneath.
 *
 * Use on anything sold to an AUDIENCE. Home, shows, tickets, merch. Gold on
 * tuxedo is the hero version. For client-facing surfaces use `<Badge />`.
 *
 * Four rules are enforced here rather than left to the call site:
 *
 * 1. Clear space is baked into the artwork (245px of the 3353px canvas on
 *    every side, measured from the cap height of the S in STONED). Do NOT add
 *    padding on top of it. Padding twice floats the mark and reads undersized.
 * 2. Minimum width is 281px of FILE, which is the 240px artwork minimum plus
 *    the clear space on both sides. Anything smaller is clamped.
 * 3. The canvas is 3353 x 3028, about 1.107:1, not square. Size by width and
 *    let height follow. No aspect-square, no cropping container.
 * 4. Every colorway is a separate file. Never recolor with filter,
 *    mix-blend-mode, or a background behind the knockout.
 */

const CANVAS = { width: 3353, height: 3028 } as const;

/** 240px artwork minimum converted to file width: 240 * 3353 / 2863. */
export const LOCKUP_MIN_WIDTH = 281;

const FILE = {
  tuxedo: "SGP_Lockup_Tuxedo.png",
  ivory: "SGP_Lockup_Ivory.png",
  gold: "SGP_Lockup_Gold.png",
  white: "SGP_Lockup_White.png",
} as const;

/**
 * Widest web use the 800px rendition stays retina-sharp for. Above this the
 * master is served instead, so a large placement never upscales.
 *
 * This matters because static export sets images.unoptimized: next/image will
 * not resize anything, so whatever is referenced here is what the browser
 * downloads. The master is 3353px and 523KB, which is ten times the pixels a
 * 320px footer slot needs. `npm run brand:generate` writes the renditions.
 */
const WEB_MAX = 400;

export type LockupColorway = keyof typeof FILE;

type Props = {
  colorway: LockupColorway;
  /** Rendered width in px. Clamped up to LOCKUP_MIN_WIDTH. Height follows. */
  width: number;
  /**
   * Empty string marks it decorative, which is right when the wordmark is
   * repeated as text nearby. Otherwise it carries the company name.
   */
  alt?: string;
  priority?: boolean;
  /** Layout only: margin, alignment. Never padding, never color. */
  className?: string;
};

export function Lockup({
  colorway,
  width,
  alt = "Stoned Goose Productions",
  priority = false,
  className,
}: Props) {
  if (process.env.NODE_ENV !== "production" && width < LOCKUP_MIN_WIDTH) {
    console.warn(
      `<Lockup> asked for ${width}px, below the ${LOCKUP_MIN_WIDTH}px minimum. Clamped. ` +
        `If it does not fit, the surface wants the wordmark set in type, not a shrunken mark.`,
    );
  }
  const w = Math.max(width, LOCKUP_MIN_WIDTH);
  const h = Math.round((w * CANVAS.height) / CANVAS.width);
  const src = `/brand/${w <= WEB_MAX ? "web/" : ""}${FILE[colorway]}`;

  return (
    <Image
      src={src}
      alt={alt}
      width={w}
      height={h}
      priority={priority}
      className={cn("block h-auto", className)}
    />
  );
}
