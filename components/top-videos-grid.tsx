import Image from "next/image";
import { TrackedAnchor } from "@/components/tracked-anchor";
import type { YouTubeVideoLink } from "@/content/watch";

// Extract a YouTube ID from a watch / share / embed URL. When the input is
// already a bare 11-char ID we return it as-is.
function extractYouTubeId(url: string): string | null {
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url;
  const patterns = [/(?:v=|\/embed\/|youtu\.be\/|\/v\/|\/shorts\/)([A-Za-z0-9_-]{11})/];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function watchUrl(idOrUrl: string, id: string): string {
  if (idOrUrl.startsWith("http")) return idOrUrl;
  return `https://www.youtube.com/watch?v=${id}`;
}

type Props = {
  videos: YouTubeVideoLink[];
};

// Renders a small grid of hand-picked YouTube videos. Each card is a thumbnail
// that opens the video on YouTube in a new tab. Owner edits content/watch.ts
// `youtubeVideos` to swap or reorder. Empty array renders nothing.
export function TopVideosGrid({ videos }: Props) {
  const valid = videos
    .map((v) => ({ ...v, id: extractYouTubeId(v.url) }))
    .filter((v): v is YouTubeVideoLink & { id: string } => Boolean(v.id));

  if (valid.length === 0) return null;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {valid.map((v) => {
        const href = watchUrl(v.url, v.id);
        const poster = `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
        return (
          <li key={v.id}>
            <TrackedAnchor
              destination="youtube"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block border border-smoke bg-surface-tuxedo transition-colors hover:border-accent-gold"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-surface-tuxedo">
                <Image
                  src={poster}
                  alt={v.title}
                  fill
                  sizes="(min-width: 1024px) 18vw, (min-width: 640px) 45vw, 90vw"
                  className="object-cover [filter:grayscale(1)_contrast(1.05)] transition-[filter] duration-500 group-hover:[filter:grayscale(0)_contrast(1)]"
                  unoptimized
                />
                <span className="absolute right-2 top-2 inline-flex items-center bg-accent-gold px-2 py-0.5 t-eyebrow text-surface-tuxedo">
                  ▸
                </span>
              </div>
              <div className="p-4">
                <p className="t-eyebrow text-smoke">
                  YouTube
                </p>
                <p className="mt-2 t-subhead text-base group-hover:text-accent-gold md:text-lg">
                  {v.title}
                </p>
              </div>
            </TrackedAnchor>
          </li>
        );
      })}
    </ul>
  );
}
