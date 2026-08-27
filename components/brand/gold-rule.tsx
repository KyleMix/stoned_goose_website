import { cn } from "@/lib/utils";

/**
 * The gold hairline. A flat 1px accent-gold rule, used to divide a headline
 * from the credits beneath it, or to close a section.
 *
 * Flat only. The old sitewide `.rule` was a linear-gradient fade, which the
 * spec forbids. If a rule needs to be quieter, it is a Smoke hairline
 * (`border-smoke`), not a faded gold one.
 */
export function GoldRule({
  className,
  /** Cap the rule's width. Omit to span the container. */
  width,
}: {
  className?: string;
  width?: number | string;
}) {
  return (
    <hr
      aria-hidden
      className={cn("h-px border-0 bg-accent-gold", className)}
      style={width ? { width, maxWidth: "100%" } : undefined}
    />
  );
}
