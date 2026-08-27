import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/content/services";
import { Badge } from "@/components/brand/badge";
import { sponsorshipTiers, sponsors } from "@/content/sponsorships";
import { site } from "@/content/site";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { ContactForm } from "@/components/contact-form";
import { TextField } from "@/components/form-field";
import { StickyQuoteRail } from "@/components/sticky-quote-rail";
import { SponsorStrip } from "@/components/brand/sponsor-strip";
import { Surface } from "@/components/brand/surface";
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
            Book <span className="text-accent-gold">Us</span>
          </>
        }
        body="Live shows, on-camera production, podcasts, collaborations, and sponsorships. Start with a free intro call and we'll map the rest together."
      />

      <nav
        aria-label="Book Us sections"
        className="border-b border-smoke bg-surface-tuxedo"
      >
        <div className="mx-auto flex max-w-[1400px] flex-wrap gap-x-8 gap-y-3 px-5 py-5 md:px-10">
          {calLink ? (
            <a
              href="#call"
              className="t-eyebrow text-smoke hover:text-accent-gold"
            >
              Book a call ↓
            </a>
          ) : null}
          <a
            href="#plan"
            className="t-eyebrow text-smoke hover:text-accent-gold"
          >
            Build your show ↓
          </a>
          <a
            href="#venues"
            className="t-eyebrow text-smoke hover:text-accent-gold"
          >
            All services ↓
          </a>
          <a
            href="#sponsors"
            className="t-eyebrow text-smoke hover:text-accent-gold"
          >
            Sponsors ↓
          </a>
          <a
            href="#quote"
            className="t-eyebrow text-smoke hover:text-accent-gold"
          >
            Quote form ↓
          </a>
        </div>
      </nav>

      <BookPlanner calLink={calLink} />

      <section
        id="venues"
        className="section-y-tight scroll-mt-24 border-b border-smoke bg-surface-tuxedo"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          {/* Client-facing band, so it carries the badge, not the lockup. The
              two never share a section: the lockup lives in the site footer. */}
          <div className="flex items-start justify-between gap-10">
            <SectionHeader
              eyebrow="All services"
              title={
                <>
                  Pick the <span className="text-accent-gold">lane</span> that fits.
                </>
              }
              subtitle="Live shows, on-camera production, podcasts, collaboration. Each one ships a brief and a quote form."
            />
            <Badge
              colorway="ivory"
              width={140}
              alt=""
              className="hidden shrink-0 md:block"
            />
          </div>
          <ol className="mt-10">
            {services.filter((s) => !s.draft).map((s, i) => (
              <li
                key={s.slug}
                className="group grid grid-cols-12 items-baseline gap-x-6 gap-y-3 border-t border-smoke py-7 last:border-b transition-colors hover:bg-surface-ivory/[0.025]"
              >
                <span className="col-span-2 t-eyebrow text-smoke md:col-span-1">
                  /{String(i + 1).padStart(2, "0")}
                </span>
                <div className="col-span-10 md:col-span-7">
                  <Link
                    href={`/book/${s.slug}`}
                    className="t-subhead text-2xl transition-colors group-hover:text-accent-gold md:text-4xl"
                  >
                    {s.title}
                  </Link>
                  <p className="t-body mt-2 max-w-prose text-sm md:text-base">
                    {s.summary}
                  </p>
                </div>
                <Link
                  href={`/book/${s.slug}`}
                  className="col-span-12 t-eyebrow text-smoke transition-colors hover:text-accent-gold md:col-span-4 md:text-right"
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
        className="section-y scroll-mt-24 border-b border-smoke bg-surface-tuxedo"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <SectionHeader
            eyebrow="For Sponsors"
            title={
              <>
                Put your name on live{" "}
                <span className="text-accent-gold">comedy</span> in the South
                Sound.
              </>
            }
            subtitle="Sponsor recurring live comedy and get in front of real rooms in Olympia, Lacey, Tacoma, and beyond."
          />

          <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-smoke md:grid-cols-3">
            {sponsorshipTiers.map((t) => (
              <li key={t.name} className="flex flex-col bg-surface-tuxedo p-8 md:p-10">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="t-headline text-3xl md:text-4xl">
                    {t.name}
                  </h3>
                  <span className="t-eyebrow">
                    {t.price}
                  </span>
                </div>
                <ul className="mt-6 space-y-3 border-t border-smoke pt-6">
                  {t.deliverables.map((d) => (
                    <li
                      key={d}
                      className="flex items-baseline gap-3 text-sm text-surface-ivory"
                    >
                      <span aria-hidden className="text-accent-gold">/</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border border-smoke p-8 md:p-10">
            <p className="t-body max-w-xl text-base md:text-lg">
              Want the one-sheet, the numbers, or a custom build? Book the
              intro call and we&apos;ll bring the deck.
            </p>
            <a
              href={calLink ? "#call" : "#quote"}
              className="inline-flex h-12 shrink-0 items-center bg-accent-gold px-6 t-eyebrow text-surface-tuxedo hover:bg-surface-ivory"
            >
              {calLink ? "Book a call ↗" : "Get a quote ↗"}
            </a>
          </div>
        </div>
      </section>

      <PressStrip tone="ivory" />

      <Surface
        tone="ivory"
        as="section"
        id="quote"
        className="section-y scroll-mt-24"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="t-eyebrow">
                Quote
              </p>
              <h2 className="display-2 mt-4 text-surface-ivory">
                Can&apos;t do a call? Get a{" "}
                <span className="text-accent-gold">quote</span>.
              </h2>
              <p className="t-body mt-6 text-base md:text-lg">
                Tell us what you&apos;re planning and we&apos;ll map the right
                package.
              </p>
              <ul className="mt-8 space-y-2 text-sm text-surface-ivory">
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
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    id="quote-name"
                    name="name"
                    label="Your name"
                    autoComplete="name"
                    placeholder="Who are we talking to?"
                  />
                  <TextField
                    id="quote-email"
                    name="email"
                    label="Contact email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@email.com"
                  />
                </div>
              </ContactForm>
            </div>
          </div>
        </div>
      </Surface>

      {/* The one sanctioned Smoke surface, at the page foot as the spec puts
          it. Renders nothing until there are real sponsors in the CMS. */}
      <SponsorStrip sponsors={sponsors} />

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
