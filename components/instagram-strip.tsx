import Image from "next/image";
import { instagramFeed } from "@/lib/feeds";
import { site } from "@/content/site";
import { FeedLink } from "@/components/feed-link";

// Home-page Instagram strip. Six most recent posts, three columns on
// mobile and six on desktop. Click opens the permalink in a new tab.
// Renders nothing when the feed is empty.
export function InstagramStrip() {
  const posts = instagramFeed.posts.slice(0, 6);
  if (posts.length === 0) return null;

  return (
    <section
      aria-labelledby="home-ig-strip"
      className="border-y border-bone/10 bg-ink py-16 md:py-20"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
              Latest from the feed
            </p>
            <h2
              id="home-ig-strip"
              className="heading-display mt-3 text-[clamp(1.8rem,4vw,2.6rem)] text-bone"
            >
              @stonedgooseproductions on Instagram
              <span className="text-hazard">.</span>
            </h2>
          </div>
          <FeedLink
            platform="instagram"
            placement="home-strip"
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
          >
            Open Instagram ↗
          </FeedLink>
        </div>
        <ul className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
          {posts.map((post) => {
            const poster = post.thumbnailUrl ?? post.mediaUrl;
            const label = post.caption?.slice(0, 80) || "Instagram post";
            return (
              <li key={post.id} className="aspect-square">
                <FeedLink
                  platform="instagram"
                  placement="home-strip"
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group relative block h-full w-full overflow-hidden bg-haze-500"
                >
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
                    <span className="absolute inset-0 flex items-center justify-center font-body text-[10px] uppercase tracking-[0.18em] text-bone/45">
                      IG
                    </span>
                  )}
                  <span
                    aria-hidden
                    className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.5)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-50 transition-opacity duration-500 group-hover:opacity-0"
                  />
                  {post.mediaType === "REEL" || post.mediaType === "VIDEO" ? (
                    <span className="absolute right-1.5 top-1.5 inline-flex items-center bg-hazard px-1.5 py-0.5 font-body text-[8px] font-semibold uppercase tracking-[0.18em] text-ink">
                      Reel
                    </span>
                  ) : null}
                </FeedLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
