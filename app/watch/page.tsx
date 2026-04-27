import type { Metadata } from "next";
import Image from "next/image";
import { reels, watchCopy, youtubeVideos } from "@/content/watch";
import { featuredSpecial } from "@/content/shows";
import { site } from "@/content/site";
import { PageHeader } from "@/components/page-header";
import { ReelCard } from "@/components/reel-card";
import { MailingListCapture } from "@/components/mailing-list-capture";
import { FeaturedSpecialPlayer } from "@/components/featured-special-player";
import { TrackedAnchor } from "@/components/tracked-anchor";

export const metadata: Metadata = {
  title: "Watch",
  description:
    "Watch Stoned Goose Productions clips, reels, and Xavier Rake's full comedy special when it lands.",
};

export default function WatchPage() {
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

      <section className="border-b border-bone/10 bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="heading-display text-[clamp(2rem,5vw,3.5rem)] text-bone">
              Reels
            </h2>
            <TrackedAnchor
              destination="instagram"
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
            >
              @stonedgooseproductions ↗
            </TrackedAnchor>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2">
            {reels.map((r) => (
              <ReelCard key={r.url} title={r.title} url={r.url} poster={r.poster} />
            ))}
          </ul>
        </div>
      </section>

      {youtubeVideos.length > 0 ? (
        <section className="border-b border-bone/10 bg-ink py-20 md:py-24">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="heading-display text-[clamp(2rem,5vw,3.5rem)] text-bone">
                From the channel
              </h2>
              <TrackedAnchor
                destination="youtube"
                href={site.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
              >
                @stonedgooseproductions ↗
              </TrackedAnchor>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {youtubeVideos.map((v) => (
                <li key={v.id}>
                  <TrackedAnchor
                    destination="youtube"
                    href={`https://www.youtube.com/watch?v=${v.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-haze-500">
                      <Image
                        src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                        alt={v.title}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                        className="object-cover [filter:grayscale(1)_contrast(1.05)] transition-[filter] duration-500 group-hover:[filter:grayscale(0)]"
                      />
                      <span
                        aria-hidden
                        className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.5)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-50 transition-opacity duration-500 group-hover:opacity-0"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-14 w-14 items-center justify-center bg-hazard text-ink">
                          <span aria-hidden className="text-xl">
                            ▸
                          </span>
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 font-display text-xl text-bone group-hover:text-hazard md:text-2xl">
                      {v.title}
                    </p>
                    <p className="mt-1 font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/45">
                      YouTube
                    </p>
                  </TrackedAnchor>
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

      <MailingListCapture page="watch" />
    </>
  );
}
