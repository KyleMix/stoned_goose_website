import type { Metadata } from "next";
import { watchCopy } from "@/content/watch";
import { featuredSpecial } from "@/content/shows";
import { site } from "@/content/site";
import { patreonPosts } from "@/content/social";
import { news } from "@/content/news";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { MailingListCapture } from "@/components/mailing-list-capture";
import { FeaturedSpecialPlayer } from "@/components/featured-special-player";
import { TrackedAnchor } from "@/components/tracked-anchor";
import { NewsFeed } from "@/components/news-feed";
import { instagramFeed, youtubeFeed, relativeAge } from "@/lib/feeds";
import { FeedFreshness } from "@/components/feed-freshness";

export const metadata: Metadata = {
  title: "Watch",
  description:
    "Featured comedy special, latest social posts, and announcements from Stoned Goose Productions.",
};

export default function WatchPage() {
  const feedFresh =
    instagramFeed.posts.length > 0 || youtubeFeed.videos.length > 0;

  return (
    <>
      <PageHeader
        eyebrow="Now Streaming"
        title={
          <>
            Media{" "}
            <span className="italic text-hazard">&amp;</span>{" "}
            Clips
          </>
        }
        body={watchCopy.subhead}
      />

      <section className="border-b border-bone/10 bg-ink py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
              Featured / Full Special
            </p>
            <TrackedAnchor
              destination="instagram"
              href={featuredSpecial.comedianHandle}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
            >
              {featuredSpecial.title} on Instagram ↗
            </TrackedAnchor>
          </div>

          <article className="grid gap-8 md:grid-cols-12">
            <div className="relative md:col-span-8">
              <FeaturedSpecialPlayer
                poster={featuredSpecial.poster}
                alt={`${featuredSpecial.title} - ${featuredSpecial.subtitle}`}
                videoUrl={featuredSpecial.videoUrl}
              />
            </div>

            <div className="md:col-span-4">
              <h2 className="heading-display text-[clamp(2.5rem,5vw,4rem)] text-bone">
                {featuredSpecial.title}
              </h2>
              <p className="mt-2 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                {featuredSpecial.subtitle}
              </p>
              <p className="mt-6 font-body text-base text-bone/85 md:text-lg">
                {featuredSpecial.blurb}
              </p>
              <TrackedAnchor
                destination="youtube"
                href={site.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex h-12 items-center border border-bone/30 px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone hover:border-hazard hover:bg-hazard hover:text-ink"
              >
                Channel on YouTube ↗
              </TrackedAnchor>
            </div>
          </article>
        </div>
      </section>

      <section
        id="latest"
        className="border-b border-bone/10 bg-ink py-20 md:py-24"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
            <SectionHeader
              eyebrow="Latest"
              title={
                <>
                  From the <span className="italic text-hazard">feed</span>
                </>
              }
              subtitle={
                feedFresh
                  ? `Auto-synced. Instagram updated ${relativeAge(instagramFeed.fetchedAt)}. YouTube updated ${relativeAge(youtubeFeed.fetchedAt)}.`
                  : "Auto-synced from Instagram, YouTube, and TikTok. Posts here when we post there."
              }
            />
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <TrackedAnchor
                destination="instagram"
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
              >
                Instagram ↗
              </TrackedAnchor>
              <TrackedAnchor
                destination="youtube"
                href={site.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
              >
                YouTube ↗
              </TrackedAnchor>
              <TrackedAnchor
                destination="tiktok"
                href={site.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
              >
                TikTok ↗
              </TrackedAnchor>
            </div>
          </div>
          <NewsFeed limit={12} />
          {!feedFresh ? (
            <div className="mt-10">
              <FeedFreshness
                source="instagram"
                fetchedAt={instagramFeed.fetchedAt}
                status={instagramFeed.status}
                placement="watch-latest"
              />
            </div>
          ) : null}
        </div>
      </section>

      {news.length > 0 ? (
        <section
          id="from-the-goose"
          className="border-b border-bone/10 bg-ink py-20 md:py-24"
        >
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <SectionHeader
              eyebrow="From the Goose"
              title={
                <>
                  News &amp; <span className="italic text-hazard">notes</span>
                </>
              }
              subtitle="Hand-written announcements. Show drops, behind-the-scenes, and the things that don't fit on Instagram."
            />
            <ul className="mt-10 divide-y divide-bone/15 border-y border-bone/15">
              {news.map((post) => (
                <li key={post.slug} className="py-7">
                  <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-bone md:text-3xl">
                    {post.title}
                  </h3>
                  <p className="mt-3 max-w-prose font-body text-base text-bone/85">
                    {post.summary}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <h2 className="heading-display text-[clamp(2rem,5vw,3.5rem)] text-bone">
            Channel
          </h2>
          <p className="mt-4 max-w-2xl font-body text-base text-bone/85 md:text-lg">
            {watchCopy.emptyClipsLine}
          </p>
          <TrackedAnchor
            destination="youtube"
            href={site.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
          >
            Open the channel ↗
          </TrackedAnchor>
        </div>
      </section>

      <section
        aria-label="Support on Patreon"
        className="border-b border-bone/10 bg-ink py-16 md:py-20"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                Patreon
              </p>
              <h2 className="heading-display mt-4 text-[clamp(2.4rem,7vw,5rem)] text-bone">
                Back the <span className="italic text-hazard">crew</span>.
              </h2>
              <p className="mt-6 max-w-xl font-body text-base text-bone/85 md:text-lg">
                Patreon supporters bankroll the cinematics, the editor hours,
                and the next dumb idea. Tier up if you want to ride along.
              </p>
              {patreonPosts.length > 0 ? (
                <ul className="mt-8 space-y-3 border-y border-bone/15 py-6">
                  {patreonPosts.map((p) => (
                    <li key={p.link}>
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-sm text-bone hover:text-hazard"
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
                className="inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
              >
                Support on Patreon ↗
              </TrackedAnchor>
            </div>
          </div>
        </div>
      </section>

      <MailingListCapture page="watch" />
    </>
  );
}
