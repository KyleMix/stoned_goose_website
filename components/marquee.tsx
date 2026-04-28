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
      // Decorative cable-bumper-style ticker. The track is the items array
      // doubled for a seamless loop, so screen readers would announce every
      // item twice. Hide from the a11y tree; sighted users get the ticker,
      // AT users get the headings and CTAs around it.
      aria-hidden
      className={cn(
        "marquee relative w-full overflow-hidden border-y border-bone/15 bg-ink py-5",
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
            className="font-display text-3xl uppercase tracking-display text-bone/90 md:text-5xl"
          >
            <span>{word}</span>
            <span className="ml-10 inline-block text-hazard">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
