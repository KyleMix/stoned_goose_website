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
            <p className="t-eyebrow">
              Now hiring out
            </p>
            <h2 className="t-headline mt-4 display-1">
              We do four things.
            </h2>
          </div>

          <ol className="md:col-span-8">
            {services.map((s, i) => (
              <li
                key={s.slug}
                className="group grid grid-cols-12 items-baseline border-t border-smoke py-5 last:border-b transition-colors hover:bg-surface-ivory/[0.025]"
              >
                <span className="col-span-2 t-eyebrow text-smoke md:col-span-1">
                  /{String(i + 1).padStart(2, "0")}
                </span>
                <Link
                  href={`/book/${s.slug}`}
                  className="col-span-9 t-subhead text-2xl transition-colors group-hover:text-accent-gold md:col-span-9 md:text-3xl"
                >
                  {s.title}
                </Link>
                <span
                  aria-hidden
                  className="col-span-1 text-right text-base text-smoke transition-colors group-hover:text-accent-gold md:col-span-2"
                >
                  ↗
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-smoke pt-8 md:mt-14">
          <Link
            href="/book"
            className="inline-flex h-12 items-center bg-accent-gold px-6 t-eyebrow text-surface-tuxedo hover:bg-surface-ivory"
          >
            Book us ↗
          </Link>
          <Link
            href="/contact"
            className="t-eyebrow text-smoke hover:text-accent-gold"
          >
            Or just email us ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
