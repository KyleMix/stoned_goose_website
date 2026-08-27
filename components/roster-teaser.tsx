import Image from "next/image";
import Link from "next/link";
import { comedians } from "@/content/comedians";
import { getPlaceholder } from "@/lib/placeholders";

export function RosterTeaser({ limit = 8 }: { limit?: number }) {
  const slice = comedians.slice(0, limit);
  if (slice.length === 0) return null;

  return (
    <section
      aria-labelledby="home-roster"
      data-surface="ivory"
      className="border-b border-smoke bg-surface-ivory py-20 text-surface-tuxedo md:py-24"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="t-eyebrow text-smoke">
              The Roster
            </p>
            <h2
              id="home-roster"
              className="t-headline mt-4 display-1 text-surface-tuxedo"
            >
              Comics in the rotation<span className="text-accent-gold">.</span>
            </h2>
          </div>
          <Link
            href="/roster"
            className="inline-flex h-12 items-center border border-smoke px-6 t-eyebrow text-surface-tuxedo hover:border-accent-gold hover:text-accent-gold"
          >
            Meet the roster ↗
          </Link>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4 lg:grid-cols-8">
          {slice.map((c) => {
            const blur = getPlaceholder(c.photo);
            return (
            <li key={c.name} className="group">
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={c.photo}
                  alt={c.photoAlt || c.name}
                  fill
                  sizes="(min-width: 1024px) 12vw, (min-width: 640px) 22vw, 45vw"
                  {...(blur ? { placeholder: "blur" as const, blurDataURL: blur } : {})}
                  className="object-cover [filter:grayscale(1)_contrast(1.05)] transition-[filter] duration-500 group-hover:[filter:grayscale(0)_contrast(1)]"
                />
              </div>
              <p className="mt-3 t-subhead text-sm text-surface-tuxedo md:text-base">
                {c.name}
              </p>
            </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
