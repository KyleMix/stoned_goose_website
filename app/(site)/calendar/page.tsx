import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ProShowsCalendar } from "@/components/pro-shows-calendar";
import {
  proCalendarDisclaimer,
  proClubs,
  proShowsFetchedAt,
} from "@/content/pro-shows";

export const metadata: Metadata = {
  title: "Pro Comedy Calendar",
  description:
    "Big-name touring comedians at Pacific Northwest comedy clubs, one calendar. Filter by club and click straight through to tickets.",
  alternates: {
    canonical: "/calendar",
  },
};

export default function ProCalendarPage() {
  const clubNames = proClubs.map((c) => c.name).join(", ");

  return (
    <>
      <PageHeader
        eyebrow="The Big Rooms"
        title={
          <>
            Pro <span className="italic text-hazard">Comedy</span> Calendar
          </>
        }
        body={`Big-name touring comics across the Pacific Northwest, one grid. ${clubNames}. Click a show and go straight to tickets.`}
      />

      {proCalendarDisclaimer.body ? (
        <section className="border-b border-bone/10 bg-ink py-10 md:py-12">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <div className="border border-bone/15 p-6 md:p-8">
              {proCalendarDisclaimer.eyebrow ? (
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-hazard">
                  {proCalendarDisclaimer.eyebrow}
                </p>
              ) : null}
              <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-bone/85">
                {proCalendarDisclaimer.body}
              </p>
              {proCalendarDisclaimer.footnote ? (
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.28em] text-bone/55">
                  {proCalendarDisclaimer.footnote}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-b border-bone/10 bg-ink py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <ProShowsCalendar />
          <p className="mt-6 max-w-2xl font-body text-sm text-bone/65">
            Listings sync automatically from each club&apos;s site
            {proShowsFetchedAt
              ? `, last updated ${new Date(proShowsFetchedAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`
              : ""}
            . Spot a missing show? Tell us at the contact page and we&apos;ll
            add it.
          </p>
        </div>
      </section>
    </>
  );
}
