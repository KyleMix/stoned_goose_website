import type { Metadata } from "next";
import Link from "next/link";
import { sponsorshipTiers, sponsors } from "@/content/sponsorships";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { BookingEnquiry } from "@/components/booking-enquiry";
import { SponsorStrip } from "@/components/brand/sponsor-strip";
import { Surface } from "@/components/brand/surface";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Sponsor a Show",
  description:
    "Sponsor recurring live comedy in Olympia, Lacey, Tacoma, and the South Sound. Packages, what each one includes, and how to start.",
  alternates: {
    canonical: "/sponsor",
  },
};

// Sponsorship used to be a section on /book, plus a footer link pointing at
// /book#sponsors, plus a /sponsor URL that 308'd back to that anchor. Three
// references to a thing with no page of its own.
//
// It is a different audience from a booking client: a business buying
// visibility, not someone hiring a production company. It also accounted for
// one of the five sections that made /book hard to use.
export default function SponsorPage() {
  return (
    <>
      <JsonLd schema={buildBreadcrumbs("/sponsor")} />
      <PageHeader
        eyebrow="For sponsors"
        title={
          <>
            Sponsor a <span className="text-accent-gold">show</span>
          </>
        }
        body="Put your name on live comedy in the South Sound. Recurring shows, real rooms, in Olympia, Lacey, Tacoma, and beyond."
      />

      {sponsorshipTiers.length > 0 ? (
        <section
          aria-labelledby="sponsor-tiers"
          className="section-y border-b border-smoke bg-surface-tuxedo"
        >
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <SectionHeader
              eyebrow="Packages"
              title="What a sponsorship includes"
            />
            <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-smoke md:grid-cols-3">
              {sponsorshipTiers.map((t) => (
                <li key={t.name} className="flex flex-col bg-surface-tuxedo p-8 md:p-10">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="t-headline text-3xl md:text-4xl">{t.name}</h3>
                    <span className="t-ui text-accent-gold">{t.price}</span>
                  </div>
                  <ul className="mt-6 space-y-3 border-t border-smoke pt-6">
                    {t.deliverables.map((d) => (
                      <li
                        key={d}
                        className="flex items-baseline gap-3 text-sm text-surface-ivory"
                      >
                        <span aria-hidden className="text-smoke">
                          /
                        </span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <Surface
        tone="ivory"
        as="section"
        id="enquiry"
        className="section-y scroll-mt-24 border-b border-smoke"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="t-eyebrow">Start here</p>
              <h2 className="t-headline mt-4 display-2">
                Tell us about your{" "}
                <span className="text-accent-gold">brand</span>.
              </h2>
              <p className="t-body mt-6 text-base md:text-lg">
                Want the one-sheet, the numbers, or a package built around
                something specific? Send the details and we will bring the deck.
              </p>
              <p className="t-body mt-6 text-sm">
                Looking to hire us for a show instead?{" "}
                <Link
                  href="/book"
                  className="underline underline-offset-4 transition-colors hover:text-accent-gold"
                >
                  That lives here
                </Link>
                .
              </p>
            </div>
            <div className="md:col-span-7">
              <BookingEnquiry
                subject="New sponsorship enquiry"
                source="/sponsor"
                formName="enquiry-sponsor"
                idPrefix="sponsor"
                planningPlaceholder="Your company, the audience you want to reach, and any package you have in mind."
              />
            </div>
          </div>
        </div>
      </Surface>

      {/* The one sanctioned Smoke surface, at the page foot as the spec puts
          it. Renders nothing until there are real sponsors in the CMS. */}
      <SponsorStrip sponsors={sponsors} />
    </>
  );
}
