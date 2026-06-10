import type { Metadata } from "next";
import Link from "next/link";
import { services, pricingTiers } from "@/content/services";
import { sponsorshipStats, sponsorshipTiers } from "@/content/sponsorships";
import { site } from "@/content/site";
import { BookCallEmbed } from "@/components/book-call-embed";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { ContactForm } from "@/components/contact-form";
import { TextField, TextAreaField } from "@/components/form-field";
import { StickyQuoteRail } from "@/components/sticky-quote-rail";
import { PressStrip } from "@/components/press-strip";

export const metadata: Metadata = {
  title: "Book Us",
  description:
    "Book Stoned Goose Productions for live shows, comedy filming, podcasts, collaborations, and sponsorships across the Pacific Northwest.",
  alternates: {
    canonical: "/book",
  },
};

export default function BookPage() {
  return (
    <>
      <PageHeader
        eyebrow="Work With Us"
        title={
          <>
            Book <span className="italic text-hazard">Us</span>
          </>
        }
        body="Live shows, on-camera production, podcasts, collaborations, and sponsorships. Pick the lane that fits and tell us what you're planning."
      />

      <nav
        aria-label="Book Us sections"
        className="border-b border-bone/10 bg-ink"
      >
        <div className="mx-auto flex max-w-[1400px] flex-wrap gap-x-8 gap-y-3 px-5 py-5 md:px-10">
          <a
            href="#venues"
            className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-slime"
          >
            All services ↓
          </a>
          <a
            href="#corporate"
            className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-slime"
          >
            Corporate / Media ↓
          </a>
          <a
            href="#sponsors"
            className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-slime"
          >
            Sponsors ↓
          </a>
          {site.booking.calLink ? (
            <a
              href="#call"
              className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-slime"
            >
              Book a call ↓
            </a>
          ) : null}
        </div>
      </nav>

      <section
        id="venues"
        className="scroll-mt-24 border-b border-bone/10 bg-ink py-16 md:py-20"
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
        id="corporate"
        className="scroll-mt-24 border-b border-bone/10 bg-ink py-20 md:py-24"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <SectionHeader
            eyebrow="For Corporate / Media"
            title={
              <>
                Packages &amp; <span className="italic text-hazard">Pricing</span>
              </>
            }
            subtitle="Tiered packages for full-stack production. Custom builds welcome."
          />
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

          <div id="quote" className="scroll-mt-24 mt-16 grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                Quote
              </p>
              <h3 className="heading-display mt-4 text-[clamp(2rem,5vw,3.5rem)] text-bone">
                Get a <span className="italic text-hazard">quote</span>.
              </h3>
              <p className="mt-6 font-body text-base text-bone/85 md:text-lg">
                Tell us what you&apos;re planning and we&apos;ll map the right package.
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
                    placeholder="Live show, filming, podcast, collab"
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

      {site.booking.calLink ? (
        <section
          id="call"
          className="scroll-mt-24 border-b border-bone/10 bg-ink py-20 md:py-24"
        >
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <SectionHeader
              eyebrow="Intro call"
              title={
                <>
                  Or just <span className="italic text-hazard">talk</span> to us.
                </>
              }
              subtitle="Fifteen minutes, free, no prep needed. Pick a slot and we'll show up with ideas."
            />
            <div className="mt-12">
              <BookCallEmbed calLink={site.booking.calLink} />
            </div>
          </div>
        </section>
      ) : null}

      <section
        id="sponsors"
        className="scroll-mt-24 border-b border-bone/10 bg-ink py-20 md:py-24"
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

          <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-bone/15 md:grid-cols-3">
            {sponsorshipStats.map((s) => (
              <li key={s.label} className="bg-ink p-8 md:p-10">
                <p className="font-display text-5xl text-bone md:text-6xl">
                  {s.value ?? <span className="text-bone/35">.</span>}
                </p>
                <p className="mt-3 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                  {s.label}
                </p>
                <p className="mt-3 font-body text-sm text-bone/85">
                  {s.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PressStrip />

      <section
        id="one-sheet"
        className="scroll-mt-24 border-b border-bone/10 bg-ink py-16 md:py-20"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-5">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                One-sheet
              </p>
              <h2 className="heading-display mt-4 text-[clamp(2rem,5vw,3.5rem)] text-bone">
                Request the deck.
              </h2>
              <p className="mt-4 max-w-md font-body text-sm text-bone/85">
                Tell us where to send it. We&apos;ll follow up with the sponsor deck and a quick intro.
              </p>
            </div>
            <div className="md:col-span-7">
              <ContactForm
                subject="One-sheet request"
                source="/book#one-sheet"
                submitLabel="Send the deck"
                successText="Got it. We'll send the one-sheet shortly."
                formName="one-sheet-request"
                schema="sponsorInquiry"
              >
                <div className="grid gap-6 sm:grid-cols-3">
                  <TextField
                    id="onesheet-name"
                    name="name"
                    label="Name"
                    required
                    autoComplete="name"
                  />
                  <TextField
                    id="onesheet-email"
                    name="email"
                    label="Email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                  <TextField
                    id="onesheet-company"
                    name="company"
                    label="Company"
                    required
                    autoComplete="organization"
                  />
                </div>
              </ContactForm>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-bone/10 bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <h2 className="heading-display text-[clamp(2.4rem,7vw,5rem)] text-bone">
            Tiers
          </h2>
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
        </div>
      </section>

      <section className="bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                Inquiry
              </p>
              <h2 className="heading-display mt-4 text-[clamp(2.4rem,7vw,5rem)] text-bone">
                Start a <span className="italic text-hazard">sponsorship</span>.
              </h2>
              <p className="mt-6 font-body text-base text-bone/85 md:text-lg">
                Tell us your goals and a tier you&apos;re considering. We&apos;ll
                follow up with the right package and timeline.
              </p>
            </div>
            <div className="md:col-span-7">
              <ContactForm
                subject="Sponsorship inquiry"
                source="/book#sponsors"
                submitLabel="Submit Sponsorship Inquiry"
                successText="Thanks. We received your sponsorship inquiry and will follow up shortly."
                formName="sponsor-inquiry"
                schema="sponsorBooking"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    id="sponsor-name"
                    name="name"
                    label="Name"
                    required
                    autoComplete="name"
                  />
                  <TextField
                    id="sponsor-company"
                    name="company"
                    label="Company"
                    required
                    autoComplete="organization"
                  />
                  <TextField
                    id="sponsor-email"
                    name="email"
                    label="Email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                  <TextField
                    id="sponsor-tier"
                    name="tier"
                    label="Tier of interest"
                    required
                    placeholder="Bronze, Silver, Gold, or Custom"
                  />
                </div>
                <TextAreaField
                  id="sponsor-goals"
                  name="goals"
                  label="Sponsorship goals"
                  required
                  rows={5}
                  placeholder="What are you hoping to get out of the partnership?"
                />
              </ContactForm>
            </div>
          </div>
        </div>
      </section>

      <StickyQuoteRail label="All services" targetId="quote" />
    </>
  );
}
