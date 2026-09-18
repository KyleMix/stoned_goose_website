import Image from "next/image";
import type { Comedian } from "@/content/comedians";
import { getPlaceholder } from "@/lib/placeholders";
import { InstagramIcon, FacebookIcon } from "@/components/icons/social";
import { cn } from "@/lib/utils";

// The comics we have booked, as proof rather than as a directory.
//
// Denser than the crew grid on purpose: six columns against five, smaller
// cards, smaller names. The hierarchy is carried by the grid itself, so
// neither section needs a line of copy explaining which one is secondary.
//
// Columns: 2 below 640, 3 at 640, 4 at 768, 6 at 1024.
//
// The social links used to be 11px "IG ↗ / FB ↗" text inside a panel that
// slid up on hover, which meant that on a touch screen they were invisible and
// on a desktop they were an 11px target. They are glyphs now, always visible,
// each in a 44px box.

type Props = {
  comedians: Comedian[];
  /** Cap the list. Used by the home page preview. */
  limit?: number;
};

export function ComicsGrid({ comedians, limit }: Props) {
  const list = typeof limit === "number" ? comedians.slice(0, limit) : comedians;
  if (list.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {list.map((c) => (
        <li key={c.slug || c.name} className="flex flex-col">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-tuxedo">
            <Image
              src={c.photo}
              alt={c.photoAlt || c.name}
              fill
              sizes="(min-width: 1024px) 16vw, (min-width: 768px) 23vw, (min-width: 640px) 30vw, 45vw"
              {...(getPlaceholder(c.photo)
                ? {
                    placeholder: "blur" as const,
                    blurDataURL: getPlaceholder(c.photo)!,
                  }
                : {})}
              loading="lazy"
              className="object-cover object-[50%_25%] [filter:grayscale(1)_contrast(1.05)]"
            />
          </div>

          {/* Two lines of height reserved whether or not this name needs them,
              so the icon rows stay on one baseline across the row and nothing
              gets truncated to keep them there. */}
          <h3 className="mt-3 min-h-[2.6em] t-subhead text-[13px] leading-[1.3] text-balance md:text-sm">
            {c.name}
          </h3>

          {c.instagram || c.facebook ? (
            <div className="-ml-2 flex items-center">
              {c.instagram ? (
                <SocialLink
                  href={c.instagram}
                  label={`${c.name} on Instagram`}
                >
                  <InstagramIcon className="h-5 w-5" />
                </SocialLink>
              ) : null}
              {c.facebook ? (
                <SocialLink href={c.facebook} label={`${c.name} on Facebook`}>
                  <FacebookIcon className="h-5 w-5" />
                </SocialLink>
              ) : null}
            </div>
          ) : (
            // Keeps every card the same height whether or not a comic has
            // socials on file, so the grid rows stay square.
            <div aria-hidden className="h-11" />
          )}
        </li>
      ))}
    </ul>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        // 44x44 is the WCAG 2.5.5 (AAA) target size. The glyph inside is 20px;
        // the rest is hit area.
        "inline-flex h-11 w-11 items-center justify-center text-smoke transition-colors",
        "hover:text-accent-gold focus-visible:text-accent-gold",
      )}
    >
      {children}
    </a>
  );
}
