import Image from "next/image";
import Link from "next/link";
import { upcomingShows } from "@/content/shows";
import { youtubeVideos } from "@/content/watch";
import { site } from "@/content/site";
import { extractYouTubeId } from "@/lib/youtube";
import { TrackedAnchor } from "@/components/tracked-anchor";

// Tight home-page version. With real shows it renders a 3-row preview and
// defers detail to /shows. With an empty calendar it shows a graceful
// "recently produced" fallback built from the real watch episodes rather than
// a bare "nothing here" line.
export function UpcomingShowsBlock() {
  const hasShows = upcomingShows.length > 0;

  // Real, hand-picked work for the empty-calendar fallback. No invented data:
  // if the watch list is empty the block degrades to a follow CTA.
  const recentWork = youtubeVideos
    .map((v) => ({ ...v, id: extractYouTubeId(v.url) }))
    .filter((v): v is (typeof youtubeVideos)[number] & { id: string } =>
      Boolean(v.id),
    )
    .slice(0, 3);

  const showWork = !hasShows && recentWork.length > 0;

  return (
    <section
      id="shows"
      aria-label="Upcoming shows"
      className="section-y relative bg-ink"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-4">
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
              {hasShows ? "Next on stage" : "Recently produced"}
            </p>
            <h2 className="display-1 mt-4 text-bone">Shows</h2>
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
            ) : showWork ? (
              <>
                <p className="display-3 max-w-2xl text-bone/85">
                  Nothing booked this exact second.{" "}
                  <span className="text-bone/55">
                    Here is what we have been making while the next lineup comes
                    together.
                  </span>
                </p>
                <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentWork.map((v) => {
                    const href = v.url.startsWith("http")
                      ? v.url
                      : `https://www.youtube.com/watch?v=${v.id}`;
                    const poster = `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
                    return (
                      <li key={v.id}>
                        <TrackedAnchor
                          destination="youtube"
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block border border-bone/15 bg-ink transition-colors hover:border-slime/60"
                        >
                          <div className="relative aspect-video w-full overflow-hidden bg-haze-500">
                            <Image
                              src={poster}
                              alt={v.title.trim()}
                              fill
                              sizes="(min-width: 1024px) 26vw, (min-width: 640px) 45vw, 90vw"
                              className="object-cover [filter:grayscale(1)_contrast(1.05)] transition-[filter] duration-500 group-hover:[filter:grayscale(0)_contrast(1)]"
                              unoptimized
                            />
                            <span
                              aria-hidden
                              className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.5)_1px,transparent_1.2px)] [background-size:3px_3px] opacity-50 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0"
                            />
                            <span className="absolute right-2 top-2 inline-flex items-center bg-hazard px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-ink">
                              ▸
                            </span>
                          </div>
                          <div className="p-4">
                            <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/55">
                              YouTube
                            </p>
                            <p className="mt-2 line-clamp-2 font-display text-base text-bone group-hover:text-slime">
                              {v.title.trim()}
                            </p>
                          </div>
                        </TrackedAnchor>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <p className="display-3 text-bone/85">
                Nothing on the calendar right now.{" "}
                <span className="text-bone/55">
                  Follow Stoned Goose Productions to be the first to hear when
                  the next lineup drops.
                </span>
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={showWork ? "/watch" : "/shows"}
                className="inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-slime"
              >
                {showWork ? "Watch the work ↗" : "See the shows page ↗"}
              </Link>
              {showWork ? (
                <Link
                  href="/shows"
                  className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone/65 hover:text-slime"
                >
                  Shows page ↗
                </Link>
              ) : null}
              <TrackedAnchor
                destination="eventbrite"
                href={site.social.eventbrite}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone/65 hover:text-slime"
              >
                Eventbrite ↗
              </TrackedAnchor>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
