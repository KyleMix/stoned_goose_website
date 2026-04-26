import type { Metadata } from "next";
import Link from "next/link";
import { services, pricingTiers } from "@/content/services";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import { TextField } from "@/components/form-field";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Live show production, comedian booking, corporate events, media & podcasts, and headshots & promo shoots — across Olympia, Lacey, Tacoma, and the South Sound.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="What We Do"
        title={
          <>
            Services<span className="text-hazard">.</span>
          </>
        }
        body="We don't just tell jokes. We build the stage for them—and capture the headshots to match."
      />

      <section className="border-b border-bone/10 bg-ink py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <ol>
            {services.map((s, i) => (
              <li
                key={s.slug}
                className="group grid grid-cols-12 items-baseline gap-x-6 gap-y-3 border-t border-bone/15 py-7 last:border-b transition-colors hover:bg-bone/[0.025]"
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
                    {s.summary}
                  </p>
                </div>
                <Link
                  href={`/services/${s.slug}`}
                  className="col-span-12 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55 transition-colors hover:text-hazard md:col-span-4 md:text-right"
                >
                  Read brief ↗
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="venue-partner-program"
        className="border-b border-bone/10 bg-ink py-20 md:py-24"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                Venue Partner Program
              </p>
              <h2 className="heading-display mt-4 text-[clamp(2.4rem,7vw,5rem)] text-bone">
                Bring consistent <span className="italic text-hazard">comedy</span>{" "}
                to your room.
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="font-body text-base text-bone/85 md:text-lg">
                Collaborate on recurring nights, co-marketing, and revenue
                splits tailored to your venue&apos;s footprint.
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
              >
                Join the Program ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-bone/10 bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <h2 className="heading-display text-[clamp(2.4rem,7vw,5rem)] text-bone">
            Packages &amp; <span className="italic text-hazard">Pricing</span>
          </h2>
          <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-bone/15 md:grid-cols-3">
            {pricingTiers.map((t) => (
              <li key={t.name} className="flex flex-col bg-ink p-8 md:p-10">
                <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                  {t.bestFor}
                </p>
                <h3 className="heading-display mt-3 text-3xl text-bone md:text-4xl">
                  {t.name}
                </h3>
                <p className="mt-2 font-body text-sm font-semibold uppercase tracking-[0.18em] text-hazard">
                  {t.price}
                </p>
                <ul className="mt-6 space-y-3 border-t border-bone/15 pt-6">
                  {t.items.map((it) => (
                    <li
                      key={it}
                      className="flex items-baseline gap-3 font-body text-sm text-bone/85"
                    >
                      <span aria-hidden className="text-hazard">/</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                Quote
              </p>
              <h2 className="heading-display mt-4 text-[clamp(2.4rem,7vw,5rem)] text-bone">
                Get a <span className="italic text-hazard">quote</span>.
              </h2>
              <p className="mt-6 font-body text-base text-bone/85 md:text-lg">
                Tell us what you&apos;re planning and we&apos;ll map the perfect
                package.
              </p>
              <ul className="mt-8 space-y-2 font-body text-sm text-bone/85">
                <li>/ Fast turnaround within 1-2 business days.</li>
                <li>/ Clear options tailored to your audience size.</li>
                <li>/ Bundled pricing for production + talent.</li>
              </ul>
            </div>
            <div className="md:col-span-7">
              <ContactForm
                subject="Quick Quote"
                source="Services page"
                submitLabel="Request Quote"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    id="quote-service"
                    name="serviceType"
                    label="Service type"
                    required
                    placeholder="Corporate night, comedy showcase, podcast taping"
                  />
                  <TextField
                    id="quote-date"
                    name="eventDate"
                    label="Event date"
                    type="date"
                  />
                  <TextField
                    id="quote-budget"
                    name="budget"
                    label="Budget range"
                    placeholder="$2k-$5k"
                  />
                  <TextField
                    id="quote-venue"
                    name="venueSize"
                    label="Venue size"
                    placeholder="Estimated audience or seat count"
                  />
                </div>
                <TextField
                  id="quote-email"
                  name="email"
                  label="Contact email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@email.com"
                />
              </ContactForm>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
