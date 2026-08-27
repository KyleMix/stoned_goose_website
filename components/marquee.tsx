"use client";

import { cn } from "@/lib/utils";

type MarqueeProps = {
  items: readonly string[];
  className?: string;
  separator?: string;
  reverse?: boolean;
};

// Pure CSS marquee. Doubled track for seamless loop. Pauses for prefers-reduced-motion.
export function Marquee({
  items,
  className,
  separator = "//",
  reverse = false,
}: MarqueeProps) {
  const track = [...items, ...items];
  return (
    <div
      className={cn(
        "marquee relative w-full overflow-hidden border-y border-smoke bg-surface-tuxedo py-5",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-max items-center gap-10 whitespace-nowrap will-change-transform",
          "animate-marquee motion-reduce:animate-none",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {track.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="t-subhead text-3xl md:text-5xl"
          >
            <span>{word}</span>
            <span className="ml-10 inline-block text-accent-gold">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
