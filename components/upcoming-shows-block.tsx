import Link from "next/link";
import { site } from "@/content/site";
import { SectionHeader } from "@/components/section-header";

// Static placeholder. The full /shows page (next phase) will read from a typed file
// or mock that mirrors the existing /api/eventbrite shape.
export function UpcomingShowsBlock() {
  return (
    <section
      id="shows"
      aria-label="Upcoming shows"
      className="relative border-b border-bone/10 bg-ink py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <SectionHeader
              index="02"
              eyebrow="Tour Diary"
              title={
                <>
                  Upcoming <span className="italic text-hazard">Shows</span>
                </>
              }
              subtitle="Live lineups, presales, and ticket drops across Olympia and the South Sound."
            />
            <a
              href={site.social.eventbrite}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex h-12 items-center gap-3 border border-bone/30 px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone transition-colors hover:border-hazard hover:bg-hazard hover:text-ink"
            >
              View all shows on Eventbrite <span aria-hidden>↗</span>
            </a>
          </div>

          <div className="md:col-span-7">
            <div className="border-y border-bone/15 px-1 py-12 md:py-16">
              <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/45">
                Currently — empty calendar
              </p>
              <p className="mt-4 font-display text-3xl leading-[1.05] text-bone md:text-5xl">
                We don&apos;t have any shows on the calendar right now. Follow
                Stoned Goose Productions to be the first to hear when the next
                lineup drops.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
                >
                  Get presale codes ↗
                </Link>
                <a
                  href={site.social.eventbrite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
                >
                  See all dates ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
