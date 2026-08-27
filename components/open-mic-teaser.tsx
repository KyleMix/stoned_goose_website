import Link from "next/link";
import { openMicsFeed } from "@/content/open-mics";

// Lightweight home-page teaser. Skips the Leaflet bundle by rendering a
// short text list of the next mics. The full map lives at /open-mics/map.
export function OpenMicTeaser() {
  const sample = openMicsFeed.mics.slice(0, 4);

  return (
    <section
      aria-labelledby="home-open-mics"
      className="section-y border-y border-surface-ivory/10 bg-surface-tuxedo"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-accent-gold">
              New / Open Mic Explorer
            </p>
            <h2
              id="home-open-mics"
              className="display-1 mt-4 text-surface-ivory"
            >
              Find an <span className="italic text-accent-gold">open mic</span>.
            </h2>
            <p className="mt-6 max-w-xl font-body text-base text-surface-ivory/85 md:text-lg">
              We map open mics across the Pacific Northwest so comics can
              actually find a stage. New rooms, weekly signups, real
              addresses.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/open-mics/map"
                className="inline-flex h-12 items-center bg-accent-gold px-6 font-body text-xs font-bold uppercase tracking-[0.18em] text-surface-tuxedo hover:bg-surface-ivory"
              >
                Open the map ↗
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center border border-surface-ivory/30 px-6 font-body text-xs font-bold uppercase tracking-[0.18em] text-surface-ivory hover:border-accent-gold hover:text-accent-gold"
              >
                Submit a mic ↗
              </Link>
            </div>
          </div>
          <div className="md:col-span-5">
            {sample.length > 0 ? (
              <ul className="divide-y divide-surface-ivory/15 border-y border-surface-ivory/15">
                {sample.map((m) => (
                  <li
                    key={m.id}
                    className="grid grid-cols-12 items-baseline gap-x-4 py-4"
                  >
                    <p className="col-span-3 font-body text-[11px] font-normal uppercase tracking-[0.18em] text-accent-gold">
                      {m.day.slice(0, 3)}
                    </p>
                    <div className="col-span-9">
                      <p className="font-display text-lg text-surface-ivory">
                        {m.nameDisplay}
                      </p>
                      <p className="font-body text-xs text-surface-ivory/65">
                        {[m.venueDisplay, m.city].filter(Boolean).join(". ")}.
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border border-surface-ivory/15 p-6 font-body text-sm text-surface-ivory/70">
                The map is loading mics now. Check back soon, or open the
                explorer and tell us what we missed.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
