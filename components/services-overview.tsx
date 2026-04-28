import Link from "next/link";
import { services } from "@/content/home";

// Tight TV-guide style listing. Just titles. The detail pages carry the
// depth. The home is for orientation, not selling.
export function ServicesOverview() {
  return (
    <section
      id="services"
      aria-label="Services"
      className="relative bg-ink py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-4">
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
              Now hiring out
            </p>
            <h2 className="heading-display mt-4 text-[clamp(2.4rem,7vw,5rem)] text-bone">
              We do five things.
            </h2>
          </div>

          <ol className="md:col-span-8">
            {services.map((s, i) => (
              <li
                key={s.slug}
                className="group grid grid-cols-12 items-baseline border-t border-bone/15 py-5 last:border-b transition-colors hover:bg-bone/[0.025]"
              >
                <span className="col-span-2 font-body text-xs font-medium uppercase tracking-[0.18em] text-bone/55 md:col-span-1">
                  /{String(i + 1).padStart(2, "0")}
                </span>
                <Link
                  href={`/services/${s.slug}`}
                  className="col-span-9 font-display text-2xl text-bone transition-colors group-hover:text-hazard md:col-span-9 md:text-3xl"
                >
                  {s.title}
                </Link>
                <span
                  aria-hidden
                  className="col-span-1 text-right font-body text-base text-bone/55 transition-colors group-hover:text-hazard md:col-span-2"
                >
                  ↗
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-bone/15 pt-8 md:mt-14">
          <Link
            href="/services"
            className="inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
          >
            See all services ↗
          </Link>
          <Link
            href="/contact"
            className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
          >
            Or just contact us ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
