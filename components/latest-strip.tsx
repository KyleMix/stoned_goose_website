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
      className="border-y border-smoke bg-surface-tuxedo py-16 md:py-20"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="t-eyebrow">
              Latest
            </p>
            <h2
              id="home-latest-strip"
              className="t-headline mt-3 display-3"
            >
              From the feed
              <span className="text-accent-gold">.</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <Link
              href="/watch"
              className="t-eyebrow text-smoke hover:text-accent-gold"
            >
              See all on Watch ↗
            </Link>
            <FeedLink
              platform="instagram"
              placement="home-strip"
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="t-eyebrow text-smoke hover:text-accent-gold"
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
                    className="group relative block h-full w-full overflow-hidden bg-surface-tuxedo"
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
                    className="group relative block h-full w-full overflow-hidden bg-surface-tuxedo"
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
        <span className="absolute inset-0 flex items-center justify-center t-eyebrow text-smoke">
          {kind}
        </span>
      )}
      <span className="absolute right-1.5 top-1.5 inline-flex items-center bg-accent-gold px-1.5 py-0.5 t-eyebrow text-surface-tuxedo">
        {kind}
      </span>
    </>
  );
}
