import Link from "next/link";
import { services } from "@/content/services";
import { servicesCopy } from "@/content/home";
import { Surface } from "@/components/brand/surface";

// Four lines. Title, one sentence, a link to the brief.
//
// The numbering is gone: /01 through /04 in front of four items told a reader
// there were four items, which the four items already did. Draft services are
// filtered here as well as on /book, which is the fix for the homepage
// advertising a service the booking page did not list.
export function ServicesRow() {
  const live = services.filter((s) => !s.draft);
  if (live.length === 0) return null;

  return (
    <section
      id="services"
      aria-labelledby="home-services"
      className="section-y border-b border-smoke bg-surface-tuxedo"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-10 md:grid-cols-12 md:items-start">
          <div className="md:col-span-4">
            <p className="t-eyebrow">{servicesCopy.eyebrow}</p>
            <h2 id="home-services" className="t-headline mt-4 display-1">
              {servicesCopy.heading}
            </h2>
          </div>

          <ul className="md:col-span-8">
            {live.map((s) => (
              <li key={s.slug} className="border-t border-smoke last:border-b">
                <Link
                  href={`/book/${s.slug}`}
                  className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-6 transition-colors hover:bg-surface-ivory/[0.025]"
                >
                  <span className="t-subhead text-xl transition-colors group-hover:text-accent-gold md:text-2xl">
                    {s.title}
                  </span>
                  <span
                    aria-hidden
                    className="text-base text-smoke transition-colors group-hover:text-accent-gold"
                  >
                    &#8599;
                  </span>
                  <span className="t-body w-full text-sm text-smoke md:text-base">
                    {s.summary}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
