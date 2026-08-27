import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The monocle ring. A thin accent-gold circle, 3px stroke, either bleeding off
 * a section corner or framing a headshot.
 *
 * ONE RING PER PAGE SECTION, MAXIMUM. It is the signature device; at full size
 * on everything it stops meaning anything. The limit is enforced by
 * `scripts/test/monocle-ring.test.ts`, which fails the build when a single
 * <section> contains more than one, so this is a real constraint rather than a
 * comment asking nicely.
 *
 * It is a `<div>` with a border. No SVG, no dependency, no gradient, no glow.
 */

const STROKE = 3;

type BleedProps = {
  mode?: "bleed";
  /** Which section corner the ring hangs off. */
  corner: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /** Diameter in px. */
  size: number;
  className?: string;
  children?: never;
};

type FrameProps = {
  mode: "frame";
  /** Diameter in px. The framed content is inset by the stroke. */
  size: number;
  children: ReactNode;
  corner?: never;
  className?: string;
};

const CORNER: Record<NonNullable<BleedProps["corner"]>, string> = {
  "top-left": "-translate-x-1/3 -translate-y-1/3 left-0 top-0",
  "top-right": "translate-x-1/3 -translate-y-1/3 right-0 top-0",
  "bottom-left": "-translate-x-1/3 translate-y-1/3 left-0 bottom-0",
  "bottom-right": "translate-x-1/3 translate-y-1/3 right-0 bottom-0",
};

export function MonocleRing(props: BleedProps | FrameProps) {
  if (props.mode === "frame") {
    const { size, children, className } = props;
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full border-accent-gold",
          className,
        )}
        style={{ width: size, height: size, borderWidth: STROKE }}
      >
        {children}
      </div>
    );
  }

  const { corner, size, className } = props;
  return (
    <div
      aria-hidden
      className={cn(
        // The parent section must be `relative` for the bleed to anchor.
        "pointer-events-none absolute rounded-full border-accent-gold",
        CORNER[corner],
        className,
      )}
      style={{ width: size, height: size, borderWidth: STROKE }}
    />
  );
}
