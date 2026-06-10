import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ProShowsCalendar } from "@/components/pro-shows-calendar";
import { proClubs, proShowsFetchedAt } from "@/content/pro-shows";

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

      <section className="border-b border-bone/10 bg-ink py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <ProShowsCalendar />
          <p className="mt-6 max-w-2xl font-body text-sm text-bone/65">
            Listings sync automatically from each club&apos;s site
            {proShowsFetchedAt
              ? `, last updated ${new Date(proShowsFetchedAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`
              : ""}
            . Tickets are sold by the clubs, not by us. Spot a missing show?
            Tell us at the contact page and we&apos;ll add it.
          </p>
        </div>
      </section>
    </>
  );
}
