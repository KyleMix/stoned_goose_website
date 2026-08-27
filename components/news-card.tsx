import Image from "next/image";
import Link from "next/link";
import { FeedLink } from "@/components/feed-link";
import { relativeAge } from "@/lib/feeds";

export type NewsItem =
  | {
      kind: "instagram";
      id: string;
      title: string;
      poster: string | null;
      posterAlt?: string;
      href: string;
      isVideo: boolean;
      date: string;
    }
  | {
      kind: "tiktok";
      id: string;
      title: string;
      poster: string;
      posterAlt?: string;
      href: string;
      date: string;
    }
  | {
      kind: "post";
      id: string;
      title: string;
      summary: string;
      poster?: string;
      posterAlt?: string;
      href?: string;
      date: string;
    };

const labels: Record<NewsItem["kind"], string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  post: "Update",
};

export function NewsCard({ item }: { item: NewsItem }) {
  if (item.kind === "post") {
    return (
      <article className="group flex flex-col border border-surface-ivory/15 bg-surface-tuxedo p-6 transition-colors hover:border-accent-gold/60 md:p-7">
        {item.poster ? (
          <div className="relative mb-5 aspect-video w-full overflow-hidden bg-surface-tuxedo">
            <Image
              src={item.poster}
              alt={item.posterAlt || item.title}
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              className="object-cover [filter:grayscale(1)_contrast(1.05)] transition-[filter] duration-500 group-hover:[filter:grayscale(0)_contrast(1)]"
              unoptimized
            />
          </div>
        ) : null}
        <p className="font-body text-[10px] font-normal uppercase tracking-[0.18em] text-accent-gold">
          {labels.post}
        </p>
        <h3 className="mt-3 font-display text-2xl text-surface-ivory group-hover:text-accent-gold md:text-3xl">
          {item.href ? (
            <Link href={item.href}>{item.title}</Link>
          ) : (
            item.title
          )}
        </h3>
        <p className="mt-3 max-w-prose font-body text-sm text-surface-ivory/85">
          {item.summary}
        </p>
      </article>
    );
  }

  return (
    <FeedLink
      platform={item.kind}
      placement="news-feed"
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border border-surface-ivory/15 bg-surface-tuxedo transition-colors hover:border-accent-gold/60"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface-tuxedo">
        {item.poster ? (
          <Image
            src={item.poster}
            alt={item.posterAlt || item.title}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover [filter:grayscale(1)_contrast(1.05)] transition-[filter] duration-500 group-hover:[filter:grayscale(0)_contrast(1)]"
            unoptimized
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-body text-xs uppercase tracking-[0.18em] text-surface-ivory/55">
            {labels[item.kind]}
          </span>
        )}
        <span
          aria-hidden
          className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.5)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-50 transition-opacity duration-500 group-hover:opacity-0"
        />
        {item.kind === "tiktok" || (item.kind === "instagram" && item.isVideo) ? (
          <span className="absolute right-2 top-2 inline-flex items-center bg-accent-gold px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-[0.18em] text-surface-tuxedo">
            ▸
          </span>
        ) : null}
      </div>
      <div className="p-5 md:p-6">
        <p className="flex flex-wrap items-baseline gap-x-3 font-body text-[10px] font-normal uppercase tracking-[0.18em] text-surface-ivory/55">
          <span>{labels[item.kind]}</span>
          <span className="font-mono text-[10px] text-surface-ivory/55">
            {relativeAge(item.date)}
          </span>
        </p>
        <p className="mt-3 font-display text-lg text-surface-ivory group-hover:text-accent-gold md:text-xl">
          {item.title}
        </p>
      </div>
    </FeedLink>
  );
}
