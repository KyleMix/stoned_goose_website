import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { Badge } from "@/components/brand/badge";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { BookingEnquiry } from "@/components/booking-enquiry";
import { BookCallSection } from "@/components/book-call-section";
import { PressStrip } from "@/components/press-strip";
import { Surface } from "@/components/brand/surface";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Book Us",
  description:
    "Book Stoned Goose Productions for live shows, comedy filming, podcasts, and collaborations across the Pacific Northwest. Free intro call or send us the details.",
  alternates: {
    canonical: "/book",
  },
};

// One primary path, one secondary path.
//
// This page used to offer five ways to start the same conversation: a row of
// five jump links, a Cal.com embed, a build-your-show estimator, a services
// list, a sponsor section, a quote form, and a sticky bar repeating the call
// CTA at every scroll position. Every one of them asked for the same thing.
//
// Now: book a call, or send the details. The estimator is gone (its own copy
// called the result "ballpark only", and the call does that job with a person
// in it) and sponsors moved to /sponsor, which is a different audience.
export default function BookPage() {
  const calLink = site.booking.calLink;
  const live = services.filter((s) => !s.draft);

  return (
    <>
      <JsonLd schema={buildBreadcrumbs("/book")} />
      <PageHeader
        eyebrow="Work with us"
        title={
          <>
            Book <span className="text-accent-gold">us</span>
          </>
        }
        body="Live shows, on-camera production, podcasts, and collaborations. Start with a free intro call, or send us the details and we will come back within two business days."
      />

      <section className="border-b border-smoke bg-surface-tuxedo">
        <div className="mx-auto flex max-w-[1400px] flex-col items-stretch gap-4 px-5 py-8 sm:flex-row sm:items-center md:px-10">
          {calLink ? (
            <a
              href="#call"
              className="inline-flex h-12 items-center justify-center bg-accent-gold px-6 t-ui text-surface-tuxedo transition-colors hover:bg-surface-ivory sm:justify-start"
            >
              Book a free intro call
            </a>
          ) : null}
          <a
            href="#enquiry"
            className="inline-flex min-h-[44px] items-center justify-center t-ui text-smoke underline-offset-4 transition-colors hover:text-accent-gold hover:underline sm:justify-start"
          >
            Or send us the details <span aria-hidden className="ml-1">&darr;</span>
          </a>
        </div>
      </section>

      <BookCallSection calLink={calLink} />

      <section
        id="services"
        className="section-y-tight scroll-mt-24 border-b border-smoke bg-surface-tuxedo"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          {/* Client-facing band, so it carries the badge, not the lockup. The
              two never share a section: the lockup lives in the site footer. */}
          <div className="flex items-start justify-between gap-10">
            <SectionHeader
              eyebrow="What we do"
              title={
                <>
                  Pick the <span className="text-accent-gold">lane</span> that fits.
                </>
              }
              subtitle="Live shows, on-camera production, podcasts, collaboration. Each one has a brief."
            />
            <Badge
              colorway="ivory"
              width={140}
              alt=""
              className="hidden shrink-0 md:block"
            />
          </div>
          <ul className="mt-10">
            {live.map((s) => (
              <li key={s.slug} className="border-t border-smoke last:border-b">
                <Link
                  href={`/book/${s.slug}`}
                  className="group grid grid-cols-12 items-baseline gap-x-6 gap-y-3 py-7 transition-colors hover:bg-surface-ivory/[0.025]"
                >
                  <div className="col-span-12 md:col-span-8">
                    <span className="t-subhead text-2xl transition-colors group-hover:text-accent-gold md:text-3xl">
                      {s.title}
                    </span>
                    <span className="t-body mt-2 block max-w-prose text-sm md:text-base">
                      {s.summary}
                    </span>
                  </div>
                  <span className="col-span-12 t-ui text-smoke transition-colors group-hover:text-accent-gold md:col-span-4 md:text-right">
                    Read brief <span aria-hidden>&#8599;</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PressStrip tone="ivory" />

      <Surface
        tone="ivory"
        as="section"
        id="enquiry"
        className="section-y scroll-mt-24"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="t-eyebrow">Send us the details</p>
              <h2 className="t-headline mt-4 display-2">
                Can&apos;t do a call? Tell us{" "}
                <span className="text-accent-gold">here</span>.
              </h2>
              <p className="t-body mt-6 text-base md:text-lg">
                Same inbox, same people. We come back within two business days.
              </p>
              <p className="t-body mt-6 text-sm">
                Sponsoring a show instead?{" "}
                <Link
                  href="/sponsor"
                  className="underline underline-offset-4 transition-colors hover:text-accent-gold"
                >
                  That lives here
                </Link>
                .
              </p>
            </div>
            <div className="md:col-span-7">
              <BookingEnquiry
                subject="New enquiry from Book Us"
                source="/book"
                formName="enquiry-book"
                idPrefix="book"
              />
            </div>
          </div>
        </div>
      </Surface>
    </>
  );
}
