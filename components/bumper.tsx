import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** Top-left clinical eyebrow line. Lowercase preserves the late-night-cable vibe. */
  eyebrow?: string;
  /** The statement itself. Short. Declarative. Don't try to be funny. The format is the joke. */
  children: ReactNode;
  /** Bottom kicker. Optional. */
  footnote?: string;
  /** Network-bug style brand mark in the corner. Mimics the [adult swim] bug. Defaults on. */
  bug?: boolean;
  /** Vertical density. */
  density?: "default" | "compact";
  className?: string;
};

// A black-field interstitial card, modeled on Adult Swim cable bumpers.
// Lots of negative space, one short statement, tiny brand bug. Don't put
// links or buttons in here. Bumpers are pauses, not destinations.
export function Bumper({
  eyebrow,
  children,
  footnote,
  bug = true,
  density = "default",
  className,
}: Props) {
  return (
    <section
      aria-hidden
      className={cn(
        "relative border-y border-smoke bg-surface-tuxedo",
        density === "default" ? "py-24 md:py-36" : "py-16 md:py-24",
        className,
      )}
    >
      <div className="mx-auto flex max-w-[900px] flex-col items-center px-5 text-center">
        {eyebrow && (
          <p className="t-eyebrow text-smoke">
            {eyebrow}
          </p>
        )}

        <p
          className={cn(
            "mt-6 t-subhead leading-[1.05]",
            "display-1",
          )}
        >
          {children}
        </p>

        {footnote && (
          <p className="mt-8 t-eyebrow text-smoke">
            {footnote}
          </p>
        )}
      </div>

      {bug && (
        <span className="pointer-events-none absolute bottom-4 right-5 t-eyebrow text-smoke md:bottom-6 md:right-10">
          [ stoned goose ]
        </span>
      )}
    </section>
  );
}
