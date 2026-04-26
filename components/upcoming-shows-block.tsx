import Link from "next/link";
import { upcomingShows } from "@/content/shows";
import { site } from "@/content/site";

// Tight home-page version. Empty state shown verbatim; a future state with
// real shows renders a 3-row preview, then defers detail to /shows.
export function UpcomingShowsBlock() {
  const hasShows = upcomingShows.length > 0;

  return (
    <section
      id="shows"
      aria-label="Upcoming shows"
      className="relative bg-ink py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-4">
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
              Next on stage
            </p>
            <h2 className="heading-display mt-4 text-[clamp(2.4rem,7vw,5rem)] text-bone">
              Shows
            </h2>
          </div>

          <div className="md:col-span-8">
            {hasShows ? (
              <ul className="divide-y divide-bone/15 border-y border-bone/15">
                {upcomingShows.slice(0, 3).map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-5"
                  >
                    <span className="font-display text-2xl text-bone md:text-3xl">
                      {s.name}
                    </span>
                    <span className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                      {s.venue?.city ?? "TBD"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-display text-[clamp(1.8rem,3.6vw,2.6rem)] leading-tight text-bone/85">
                Nothing on the calendar right now.{" "}
                <span className="text-bone/55">
                  Follow Stoned Goose Productions to be the first to hear when
                  the next lineup drops.
                </span>
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/shows"
                className="inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
              >
                See the shows page ↗
              </Link>
              <a
                href={site.social.eventbrite}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
              >
                Eventbrite ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
