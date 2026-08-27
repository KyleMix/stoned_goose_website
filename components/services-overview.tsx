import Link from "next/link";
import { services } from "@/content/services";

// Tight TV-guide style listing. Just titles. The detail pages carry the
// depth. The home is for orientation, not selling.
export function ServicesOverview() {
  return (
    <section
      id="services"
      aria-label="Services"
      className="relative bg-surface-tuxedo py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-4">
            <p className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-accent-gold">
              Now hiring out
            </p>
            <h2 className="heading-display mt-4 text-[clamp(2.4rem,7vw,5rem)] text-surface-ivory">
              We do four things.
            </h2>
          </div>

          <ol className="md:col-span-8">
            {services.map((s, i) => (
              <li
                key={s.slug}
                className="group grid grid-cols-12 items-baseline border-t border-surface-ivory/15 py-5 last:border-b transition-colors hover:bg-surface-ivory/[0.025]"
              >
                <span className="col-span-2 font-body text-xs font-normal uppercase tracking-[0.18em] text-surface-ivory/55 md:col-span-1">
                  /{String(i + 1).padStart(2, "0")}
                </span>
                <Link
                  href={`/book/${s.slug}`}
                  className="col-span-9 font-display text-2xl text-surface-ivory transition-colors group-hover:text-accent-gold md:col-span-9 md:text-3xl"
                >
                  {s.title}
                </Link>
                <span
                  aria-hidden
                  className="col-span-1 text-right font-body text-base text-surface-ivory/55 transition-colors group-hover:text-accent-gold md:col-span-2"
                >
                  ↗
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-surface-ivory/15 pt-8 md:mt-14">
          <Link
            href="/book"
            className="inline-flex h-12 items-center bg-accent-gold px-6 font-body text-xs font-bold uppercase tracking-[0.18em] text-surface-tuxedo hover:bg-surface-ivory"
          >
            Book us ↗
          </Link>
          <Link
            href="/contact"
            className="font-body text-xs font-bold uppercase tracking-[0.18em] text-surface-ivory/65 hover:text-accent-gold"
          >
            Or just email us ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
