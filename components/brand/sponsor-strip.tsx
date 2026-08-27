import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Sponsor logos at the page foot, in a Smoke strip.
 *
 * This is the ONE sanctioned exception to the five-color palette: sponsor
 * logos run in their own brand colors. That licence covers the logos and
 * nothing else. The strip itself is Smoke, its label is an Eyebrow, and no
 * other element inside may introduce a sixth color.
 *
 * Logos are never recolored to fit the palette. A sponsor's mark is their
 * asset, not ours to restyle, and the whole reason the exception exists is
 * that a recolored sponsor logo is worse than an off-palette one.
 *
 * Renders nothing when there are no sponsors, so a page can always mount it.
 */

export type Sponsor = {
  name: string;
  /** Path under /public. The sponsor's own artwork, unmodified. */
  logo: string;
  /** Rendered width in px. Height follows the intrinsic ratio. */
  width: number;
  height: number;
  url?: string;
};

export function SponsorStrip({
  sponsors,
  label = "With support from",
  className,
}: {
  sponsors: Sponsor[];
  label?: string;
  className?: string;
}) {
  if (!sponsors.length) return null;

  return (
    <section
      aria-label="Sponsors"
      data-surface="smoke"
      className={cn("bg-smoke py-10 md:py-12", className)}
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <p className="t-eyebrow">{label}</p>
        <ul className="mt-6 flex flex-wrap items-center gap-x-12 gap-y-8">
          {sponsors.map((s) => {
            const logo = (
              <Image
                src={s.logo}
                alt={s.name}
                width={s.width}
                height={s.height}
                className="block h-auto w-auto"
              />
            );
            return (
              <li key={s.name}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer sponsored">
                    {logo}
                  </a>
                ) : (
                  logo
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
