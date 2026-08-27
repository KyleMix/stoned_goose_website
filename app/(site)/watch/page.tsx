import type { Metadata } from "next";
import Link from "next/link";
import {
  watchCopy,
  youtubeVideos,
  watchTopSections,
  watchBottomSections,
} from "@/content/watch";
import { SectionRenderer } from "@/components/section-renderer";
import { featuredSpecial } from "@/content/shows";
import { site } from "@/content/site";
import { patreonPosts } from "@/content/social";
import { news } from "@/content/news";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { MailingListCapture } from "@/components/mailing-list-capture";
import { FeaturedSpecialPlayer } from "@/components/featured-special-player";
import { TrackedAnchor } from "@/components/tracked-anchor";
import { YouTubeGrid, type GridVideo } from "@/components/youtube-grid";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs, buildVideoObject } from "@/lib/schema";
import { normalizeCuratedVideos, normalizeFeedVideo } from "@/lib/videos";
import { youtubeFeed, relativeAge } from "@/lib/feeds";
import { extractYouTubeId } from "@/lib/youtube";

export const metadata: Metadata = {
  title: "Watch",
  description:
    "Featured comedy special, latest social posts, and announcements from Stoned Goose Productions.",
  alternates: {
    canonical: "/watch",
  },
};

export default function WatchPage() {
  // Prefer the auto-synced channel feed. Fall back to the hand-curated list in
  // content/watch when the feed is empty (e.g. a build with no network to
  // youtube.com). Both render through the same inline-play grid.
  const feedVideos: GridVideo[] = youtubeFeed.videos.map((v) => ({
    id: v.id,
    title: v.title,
    url: v.url,
  }));
  const manualVideos: GridVideo[] = youtubeVideos
    .map((v) => {
      const id = extractYouTubeId(v.url);
      if (!id) return null;
      const url = v.url.startsWith("http")
        ? v.url
        : `https://www.youtube.com/watch?v=${id}`;
      return { id, title: v.title, url };
    })
    .filter((v): v is GridVideo => v !== null);
  const youtubeFresh = feedVideos.length > 0;
  const topVideos = youtubeFresh ? feedVideos.slice(0, 10) : manualVideos;
  const hasTopVideos = topVideos.length > 0;

  // VideoObject markup for the exact clips shown in the grid: the synced feed
  // when fresh, the curated list otherwise. Thumbnails and embed URLs are
  // derived from the video id (real, not faked); upload dates ride along only
  // when the source knows them.
  const videoObjects = (
    youtubeFresh
      ? youtubeFeed.videos.slice(0, 10).map(normalizeFeedVideo)
      : normalizeCuratedVideos(youtubeVideos)
  ).map(buildVideoObject);

  return (
    <>
      <JsonLd schema={buildBreadcrumbs("/watch")} />
      {videoObjects.map((video, i) => (
        <JsonLd key={i} schema={video} />
      ))}
      <PageHeader
        eyebrow="Now Streaming"
        title={
          <>
            Media{" "}
            <span className="italic text-accent-gold">&amp;</span>{" "}
            Clips
          </>
        }
        body={watchCopy.subhead}
      />

      <SectionRenderer sections={watchTopSections} pageSlug="watch" />

      <section className="border-b border-surface-ivory/10 bg-surface-tuxedo py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <p className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-surface-ivory/55">
                Featured / Full Special
              </p>
              <Link
                href="/shows"
                className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-surface-ivory/65 hover:text-accent-gold"
              >
                Catch the next one live ↗
              </Link>
            </div>
            <TrackedAnchor
              destination="instagram"
              href={featuredSpecial.comedianHandle}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-surface-ivory/65 hover:text-accent-gold"
            >
              {featuredSpecial.title} on Instagram ↗
            </TrackedAnchor>
          </div>

          <article className="grid gap-8 md:grid-cols-12">
            <div className="relative md:col-span-8">
              <FeaturedSpecialPlayer
                poster={featuredSpecial.poster}
                alt={featuredSpecial.posterAlt || `${featuredSpecial.title} - ${featuredSpecial.subtitle}`}
                videoUrl={featuredSpecial.videoUrl}
              />
            </div>

            <div className="md:col-span-4">
              <h2 className="heading-display text-[clamp(2.5rem,5vw,4rem)] text-surface-ivory">
                {featuredSpecial.title}
              </h2>
              <p className="mt-2 font-body text-[11px] font-normal uppercase tracking-[0.18em] text-accent-gold">
                {featuredSpecial.subtitle}
              </p>
              <p className="mt-6 font-body text-base text-surface-ivory/85 md:text-lg">
                {featuredSpecial.blurb}
              </p>
              <TrackedAnchor
                destination="youtube"
                href={site.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex h-12 items-center border border-surface-ivory/30 px-6 font-body text-xs font-bold uppercase tracking-[0.18em] text-surface-ivory hover:border-accent-gold hover:bg-surface-ivory hover:text-surface-tuxedo"
              >
                Channel on YouTube ↗
              </TrackedAnchor>
            </div>
          </article>
        </div>
      </section>

      {news.length > 0 ? (
        <section
          id="from-the-goose"
          className="border-b border-surface-ivory/10 bg-surface-tuxedo py-20 md:py-24"
        >
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <SectionHeader
              eyebrow="From the Goose"
              title={
                <>
                  News &amp; <span className="italic text-accent-gold">notes</span>
                </>
              }
              subtitle="Hand-written announcements. Show drops, behind-the-scenes, and the things that don't fit on Instagram."
            />
            <ul className="mt-10 divide-y divide-surface-ivory/15 border-y border-surface-ivory/15">
              {news.map((post) => (
                <li key={post.slug} className="py-7">
                  <p className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-surface-ivory/55">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-surface-ivory md:text-3xl">
                    {post.title}
                  </h3>
                  <p className="mt-3 max-w-prose font-body text-base text-surface-ivory/85">
                    {post.summary}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="border-b border-surface-ivory/10 bg-surface-tuxedo py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-accent-gold">
                Channel
              </p>
              <h2 className="heading-display mt-3 text-[clamp(2rem,5vw,3.5rem)] text-surface-ivory">
                Latest <span className="italic text-accent-gold">uploads</span>
              </h2>
              {youtubeFresh ? (
                <p className="mt-3 font-body text-sm text-surface-ivory/65">
                  Auto-synced. YouTube updated {relativeAge(youtubeFeed.fetchedAt)}.
                </p>
              ) : null}
            </div>
            <TrackedAnchor
              destination="youtube"
              href={site.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-surface-ivory/65 hover:text-accent-gold"
            >
              YouTube channel ↗
            </TrackedAnchor>
          </div>

          {hasTopVideos ? (
            <div className="mt-10">
              <YouTubeGrid videos={topVideos} />
            </div>
          ) : (
            <>
              <p className="mt-6 max-w-2xl font-body text-base text-surface-ivory/85 md:text-lg">
                {watchCopy.emptyClipsLine}
              </p>
              <TrackedAnchor
                destination="youtube"
                href={site.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex h-12 items-center bg-accent-gold px-6 font-body text-xs font-bold uppercase tracking-[0.18em] text-surface-tuxedo hover:bg-surface-ivory"
              >
                Open the channel ↗
              </TrackedAnchor>
            </>
          )}
        </div>
      </section>

      <section
        aria-label="Support on Patreon"
        className="border-b border-surface-ivory/10 bg-surface-tuxedo py-16 md:py-20"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-accent-gold">
                Patreon
              </p>
              <h2 className="heading-display mt-4 text-[clamp(2.4rem,7vw,5rem)] text-surface-ivory">
                Back the <span className="italic text-accent-gold">crew</span>.
              </h2>
              <p className="mt-6 max-w-xl font-body text-base text-surface-ivory/85 md:text-lg">
                Patreon supporters bankroll the cinematics, the editor hours,
                and the next dumb idea. Tier up if you want to ride along.
              </p>
              {patreonPosts.length > 0 ? (
                <ul className="mt-8 space-y-3 border-y border-surface-ivory/15 py-6">
                  {patreonPosts.map((p) => (
                    <li key={p.link}>
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-sm text-surface-ivory hover:text-accent-gold"
                      >
                        / {p.title} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="md:col-span-5 md:text-right">
              <TrackedAnchor
                destination="patreon"
                href={site.social.patreon}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center bg-accent-gold px-6 font-body text-xs font-bold uppercase tracking-[0.18em] text-surface-tuxedo hover:bg-surface-ivory"
              >
                Support on Patreon ↗
              </TrackedAnchor>
            </div>
          </div>
        </div>
      </section>

      <SectionRenderer sections={watchBottomSections} pageSlug="watch" />

      <MailingListCapture page="watch" />
    </>
  );
}
