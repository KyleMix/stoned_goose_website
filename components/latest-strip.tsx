import Image from "next/image";
import Link from "next/link";
import { FeedLink } from "@/components/feed-link";
import { buildNewsFeed } from "@/lib/news-feed";
import { site } from "@/content/site";

type Props = {
  limit?: number;
};

// Home-page strip pulling from the unified news feed (curated posts +
// auto-synced Instagram + TikTok). Replaces the old InstagramStrip.
// Renders nothing when the feed is empty.
export function LatestStrip({ limit = 6 }: Props) {
  const items = buildNewsFeed().slice(0, limit);
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="home-latest-strip"
      className="border-y border-bone/10 bg-ink py-16 md:py-20"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
              Latest
            </p>
            <h2
              id="home-latest-strip"
              className="heading-display mt-3 text-[clamp(1.8rem,4vw,2.6rem)] text-bone"
            >
              From the feed
              <span className="text-hazard">.</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <Link
              href="/watch"
              className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-slime"
            >
              See all on Watch ↗
            </Link>
            <FeedLink
              platform="instagram"
              placement="home-strip"
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-slime"
            >
              Open Instagram ↗
            </FeedLink>
          </div>
        </div>
        <ul className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
          {items.map((item) => {
            const href = item.kind === "post" ? item.href ?? "/watch" : item.href;
            const poster = item.kind === "post" ? item.poster ?? null : item.poster;
            const label = item.title;
            return (
              <li key={`${item.kind}-${item.id}`} className="aspect-square">
                {item.kind === "post" ? (
                  <Link
                    href={href ?? "/watch"}
                    aria-label={label}
                    className="group relative block h-full w-full overflow-hidden bg-haze-500"
                  >
                    <PosterContent poster={poster} label={label} kind="Update" />
                  </Link>
                ) : (
                  <FeedLink
                    platform={item.kind}
                    placement="home-strip"
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="group relative block h-full w-full overflow-hidden bg-haze-500"
                  >
                    <PosterContent
                      poster={poster}
                      label={label}
                      kind={
                        item.kind === "instagram"
                          ? item.isVideo
                            ? "Reel"
                            : "IG"
                          : "TT"
                      }
                    />
                  </FeedLink>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function PosterContent({
  poster,
  label,
  kind,
}: {
  poster: string | null | undefined;
  label: string;
  kind: string;
}) {
  return (
    <>
      {poster ? (
        <Image
          src={poster}
          alt={label}
          fill
          sizes="(min-width: 768px) 16vw, 33vw"
          className="object-cover [filter:grayscale(1)_contrast(1.05)] transition-[filter] duration-500 group-hover:[filter:grayscale(0)]"
          unoptimized
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center font-body text-[10px] uppercase tracking-[0.18em] text-bone/55">
          {kind}
        </span>
      )}
      <span
        aria-hidden
        className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.5)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-50 transition-opacity duration-500 group-hover:opacity-0"
      />
      <span className="absolute right-1.5 top-1.5 inline-flex items-center bg-hazard px-1.5 py-0.5 font-body text-[8px] font-semibold uppercase tracking-[0.18em] text-ink">
        {kind}
      </span>
    </>
  );
}
