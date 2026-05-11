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
      className="border-b border-bone/10 bg-bone py-20 text-ink md:py-24"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-ink/55">
              The Roster
            </p>
            <h2
              id="home-roster"
              className="heading-display mt-4 text-[clamp(2.4rem,7vw,5rem)] text-ink"
            >
              Comics in the rotation<span className="text-hazard">.</span>
            </h2>
          </div>
          <Link
            href="/roster"
            className="inline-flex h-12 items-center border border-ink/30 px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:border-hazard hover:text-hazard"
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
                <span
                  aria-hidden
                  className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.45)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-60 transition-opacity duration-500 group-hover:opacity-0"
                />
              </div>
              <p className="mt-3 font-display text-sm text-ink md:text-base">
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
