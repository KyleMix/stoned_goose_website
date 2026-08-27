import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The badge: circular monocle ring goose, no joint.
 *
 * Use on anything sold to a CLIENT. Production services, vendor and sponsor
 * material, invoices, lower thirds. For audience surfaces use `<Lockup />`.
 *
 * Never on a gold background: the badge is solid line art and loses contrast.
 * The same four rules as the lockup apply, see components/brand/lockup.tsx.
 */

const CANVAS = { width: 1750, height: 1750 } as const;

/** 96px artwork minimum converted to file width: 96 * 1750 / 1466. */
export const BADGE_MIN_WIDTH = 115;

const SRC = {
  tuxedo: "/brand/SGP_Badge_Tuxedo.png",
  ivory: "/brand/SGP_Badge_Ivory.png",
  gold: "/brand/SGP_Badge_Gold.png",
} as const;

export type BadgeColorway = keyof typeof SRC;

type Props = {
  colorway: BadgeColorway;
  /** Rendered width in px. Clamped up to BADGE_MIN_WIDTH. */
  width: number;
  alt?: string;
  priority?: boolean;
  /** Layout only: margin, alignment. Never padding, never color. */
  className?: string;
};

export function Badge({
  colorway,
  width,
  alt = "Stoned Goose Productions",
  priority = false,
  className,
}: Props) {
  if (process.env.NODE_ENV !== "production" && width < BADGE_MIN_WIDTH) {
    console.warn(
      `<Badge> asked for ${width}px, below the ${BADGE_MIN_WIDTH}px minimum. Clamped.`,
    );
  }
  const w = Math.max(width, BADGE_MIN_WIDTH);

  return (
    <Image
      src={SRC[colorway]}
      alt={alt}
      width={w}
      height={w}
      priority={priority}
      className={cn("block h-auto", className)}
    />
  );
}
