import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ComedyCalendar } from "@/components/comedy-calendar";

export const metadata: Metadata = {
  title: "Calendar",
  description:
    "Every Pacific Northwest open mic and Stoned Goose show on one interactive calendar. Filter by city, find tonight's room, get on stage.",
  alternates: {
    canonical: "/calendar",
  },
};

export default function CalendarPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Circuit"
        title={
          <>
            The <span className="italic text-hazard">Calendar</span>
          </>
        }
        body="Every open mic and every Stoned Goose show across the Pacific Northwest, one grid. Filter by city, find tonight's room, get on stage."
      />

      <section className="border-b border-bone/10 bg-ink py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <ComedyCalendar />
          <p className="mt-6 max-w-2xl font-body text-sm text-bone/65">
            Cadence on biweekly and monthly mics can drift. Check the room
            before you drive. Spot something wrong? Flag it on the{" "}
            <Link
              href="/open-mics"
              className="text-bone underline decoration-hazard underline-offset-4 hover:text-slime hover:decoration-slime"
            >
              Open Mic Explorer
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/feed.ics"
              className="inline-flex h-12 items-center border border-bone/25 px-6 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-bone hover:border-slime hover:text-slime"
            >
              Subscribe to shows (.ics) ↗
            </a>
            <Link
              href="/open-mics"
              className="inline-flex h-12 items-center border border-bone/25 px-6 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-bone hover:border-slime hover:text-slime"
            >
              Open the map ↗
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
