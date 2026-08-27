// CURRENTLY UNPUBLISHED. The underscore prefix on this folder makes
// Next.js skip the route, so /calendar does not ship in the static
// export. The page still needs work before it goes live. To republish:
// rename app/(site)/_calendar back to app/(site)/calendar and re-add
// the nav, footer (content/site/index.json), and sitemap entries.

import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { FinePrint } from "@/components/fine-print";
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
            Pro <span className="text-accent-gold">Comedy</span> Calendar
          </>
        }
        body={`Big-name touring comics across the Pacific Northwest, one grid. ${clubNames}. Click a show and go straight to tickets.`}
      />

      <FinePrint
        eyebrow={proCalendarDisclaimer.eyebrow}
        body={proCalendarDisclaimer.body}
        footnote={proCalendarDisclaimer.footnote}
      />

      <section className="border-b border-smoke bg-surface-tuxedo py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <ProShowsCalendar />
          <p className="t-body mt-6 max-w-2xl text-sm text-smoke">
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
