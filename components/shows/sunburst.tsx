import { cn } from "@/lib/utils";

/**
 * Art Deco rays behind the hero headshot, after the flyers.
 *
 * The flyers paint their rays as gold at low opacity. On the site that would
 * be a sixth color (gold over tuxedo at 13% is a brown that is not in the
 * palette), so these are solid accent-gold hairlines instead: the same
 * radiating figure, in a color and weight the spec already allows for rules.
 * No gradient, no fill, nothing over the photo, which sits on top of it.
 */
const RAYS = 36;
const INNER = 22;
const OUTER = 160;
const CX = 50;
const CY = 58;

const lines = Array.from({ length: RAYS }, (_, i) => {
  const a = (i / RAYS) * Math.PI * 2;
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    x1: round(CX + Math.cos(a) * INNER),
    y1: round(CY + Math.sin(a) * INNER),
    x2: round(CX + Math.cos(a) * OUTER),
    y2: round(CY + Math.sin(a) * OUTER),
  };
});

export function Sunburst({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none text-accent-gold", className)}
    >
      {lines.map((l, i) => (
        <line
          key={i}
          {...l}
          stroke="currentColor"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
