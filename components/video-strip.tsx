import Link from "next/link";
import { youtubeVideos } from "@/content/watch";
import { TopVideosGrid } from "@/components/top-videos-grid";
import { normalizeCuratedVideos } from "@/lib/videos";

type Props = {
  limit?: number;
};

// Home-page strip of featured YouTube clips. Puts the videos on the site's
// highest-traffic page (and into its indexable HTML), not only on /watch.
// Renders nothing when there are no valid clips.
export function VideoStrip({ limit = 5 }: Props) {
  const valid = normalizeCuratedVideos(youtubeVideos);
  if (valid.length === 0) return null;

  const videos = youtubeVideos.slice(0, limit);

  return (
    <section
      aria-labelledby="home-video-strip"
      className="border-y border-smoke bg-surface-tuxedo py-16 md:py-20"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="t-eyebrow">
              Watch
            </p>
            <h2
              id="home-video-strip"
              className="t-headline mt-3 display-3"
            >
              On the channel
              <span className="text-accent-gold">.</span>
            </h2>
          </div>
          <Link
            href="/watch"
            className="t-eyebrow text-smoke hover:text-accent-gold"
          >
            All videos ↗
          </Link>
        </div>
        <TopVideosGrid videos={videos} />
      </div>
    </section>
  );
}
