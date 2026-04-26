import Link from "next/link";
import { services, servicesIntro } from "@/content/home";
import { SectionHeader } from "@/components/section-header";

export function ServicesOverview() {
  return (
    <section
      id="services"
      aria-label="Services"
      className="relative border-b border-bone/10 bg-ink py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionHeader
              index="03"
              eyebrow={servicesIntro.eyebrow}
              title={
                <>
                  What We <span className="italic text-hazard">Do</span>
                </>
              }
              subtitle={servicesIntro.subhead}
            />
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65">
              <Link href="/contact" className="hover:text-hazard">
                Request a Quote ↗
              </Link>
              <Link href="/services" className="hover:text-hazard">
                View Services ↗
              </Link>
              <Link
                href="/services#venue-partner-program"
                className="hover:text-hazard"
              >
                Venue Partner Program ↗
              </Link>
            </div>
          </div>

          <ol className="md:col-span-7">
            {services.map((s, i) => (
              <li
                key={s.slug}
                className="group relative grid grid-cols-12 items-baseline gap-4 border-t border-bone/15 py-7 last:border-b transition-colors hover:bg-bone/[0.025]"
              >
                <span className="col-span-2 font-body text-xs font-medium uppercase tracking-[0.18em] text-bone/40 md:col-span-1">
                  /{String(i + 1).padStart(2, "0")}
                </span>
                <div className="col-span-10 md:col-span-7">
                  <Link
                    href={`/services/${s.slug}`}
                    className="font-display text-2xl text-bone transition-colors group-hover:text-hazard md:text-4xl"
                  >
                    {s.title}
                  </Link>
                  <p className="mt-2 max-w-prose font-body text-sm text-bone/85 md:text-base">
                    {s.blurb}
                  </p>
                </div>
                <Link
                  href={`/services/${s.slug}`}
                  aria-label={`Read about ${s.title}`}
                  className="col-span-12 mt-2 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55 transition-colors hover:text-hazard md:col-span-4 md:mt-0 md:text-right"
                >
                  Read brief ↗
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
