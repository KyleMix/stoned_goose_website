import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/content/services";
import { sponsorshipTiers } from "@/content/sponsorships";
import { site } from "@/content/site";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { ContactForm } from "@/components/contact-form";
import { TextField } from "@/components/form-field";
import { StickyQuoteRail } from "@/components/sticky-quote-rail";
import { PressStrip } from "@/components/press-strip";
import { BookPlanner } from "@/components/book-planner";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Book Us",
  description:
    "Book Stoned Goose Productions for live shows, comedy filming, podcasts, collaborations, and sponsorships across the Pacific Northwest.",
  alternates: {
    canonical: "/book",
  },
};

export default function BookPage() {
  const calLink = site.booking.calLink;

  return (
    <>
      <JsonLd schema={buildBreadcrumbs("/book")} />
      <PageHeader
        eyebrow="Work With Us"
        title={
          <>
            Book <span className="italic text-hazard">Us</span>
          </>
        }
        body="Live shows, on-camera production, podcasts, collaborations, and sponsorships. Start with a free intro call and we'll map the rest together."
      />

      <nav
        aria-label="Book Us sections"
        className="border-b border-bone/10 bg-ink"
      >
        <div className="mx-auto flex max-w-[1400px] flex-wrap gap-x-8 gap-y-3 px-5 py-5 md:px-10">
          {calLink ? (
            <a
              href="#call"
              className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-slime"
            >
              Book a call ↓
            </a>
          ) : null}
          <a
            href="#plan"
            className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-slime"
          >
            Build your show ↓
          </a>
          <a
            href="#venues"
            className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-slime"
          >
            All services ↓
          </a>
          <a
            href="#sponsors"
            className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-slime"
          >
            Sponsors ↓
          </a>
          <a
            href="#quote"
            className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-slime"
          >
            Quote form ↓
          </a>
        </div>
      </nav>

      <BookPlanner calLink={calLink} />

      <section
        id="venues"
        className="section-y-tight scroll-mt-24 border-b border-bone/10 bg-ink"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <SectionHeader
            eyebrow="All services"
            title={
              <>
                Pick the <span className="italic text-hazard">lane</span> that fits.
              </>
            }
            subtitle="Live shows, on-camera production, podcasts, collaboration. Each one ships a brief and a quote form."
          />
          <ol className="mt-10">
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
                    href={`/book/${s.slug}`}
                    className="font-display text-2xl text-bone transition-colors group-hover:text-slime md:text-4xl"
                  >
                    {s.title}
                  </Link>
                  <p className="mt-2 max-w-prose font-body text-sm text-bone/85 md:text-base">
                    {s.summary}
                  </p>
                </div>
                <Link
                  href={`/book/${s.slug}`}
                  className="col-span-12 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55 transition-colors hover:text-slime md:col-span-4 md:text-right"
                >
                  Read brief ↗
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="sponsors"
        className="section-y scroll-mt-24 border-b border-bone/10 bg-ink"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <SectionHeader
            eyebrow="For Sponsors"
            title={
              <>
                Partner with the South Sound&apos;s fastest-growing{" "}
                <span className="italic text-hazard">comedy</span> platform.
              </>
            }
            subtitle="Sponsor recurring live comedy experiences and get in front of engaged audiences in Olympia, Lacey, Tacoma, and beyond."
          />

          <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-bone/15 md:grid-cols-3">
            {sponsorshipTiers.map((t) => (
              <li key={t.name} className="flex flex-col bg-ink p-8 md:p-10">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="heading-display text-3xl text-bone md:text-4xl">
                    {t.name}
                  </h3>
                  <span className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-hazard">
                    {t.price}
                  </span>
                </div>
                <ul className="mt-6 space-y-3 border-t border-bone/15 pt-6">
                  {t.deliverables.map((d) => (
                    <li
                      key={d}
                      className="flex items-baseline gap-3 font-body text-sm text-bone/85"
                    >
                      <span aria-hidden className="text-hazard">/</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border border-bone/15 p-8 md:p-10">
            <p className="max-w-xl font-body text-base text-bone/85 md:text-lg">
              Want the one-sheet, the numbers, or a custom build? Book the
              intro call and we&apos;ll bring the deck.
            </p>
            <a
              href={calLink ? "#call" : "#quote"}
              className="inline-flex h-12 shrink-0 items-center bg-hazard px-6 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-ink hover:bg-slime"
            >
              {calLink ? "Book a call ↗" : "Get a quote ↗"}
            </a>
          </div>
        </div>
      </section>

      <PressStrip />

      <section id="quote" className="section-y scroll-mt-24 bg-ink">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                Quote
              </p>
              <h2 className="display-2 mt-4 text-bone">
                Can&apos;t do a call? Get a{" "}
                <span className="italic text-hazard">quote</span>.
              </h2>
              <p className="mt-6 font-body text-base text-bone/85 md:text-lg">
                Tell us what you&apos;re planning and we&apos;ll map the right
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
                source="/book"
                submitLabel="Request Quote"
                formName="quote"
                schema="generalQuote"
                staticPayload={{ service: "general" }}
                successEvents={[
                  { name: "Quote Submitted", props: { service: "general" } },
                ]}
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    id="quote-service"
                    name="serviceType"
                    label="Service type"
                    required
                    placeholder="Live show, filming, podcast, collab, sponsorship"
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

      {calLink ? (
        <StickyQuoteRail
          kicker="Intro call"
          label="Free, 15 minutes"
          ctaLabel="Book a call ↗"
          targetId="call"
        />
      ) : (
        <StickyQuoteRail label="All services" targetId="quote" />
      )}
    </>
  );
}
