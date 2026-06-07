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
              className="group block border border-bone/15 bg-ink transition-colors hover:border-slime/60"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-haze-500">
                <Image
                  src={poster}
                  alt={v.title}
                  fill
                  sizes="(min-width: 1024px) 18vw, (min-width: 640px) 45vw, 90vw"
                  className="object-cover [filter:grayscale(1)_contrast(1.05)] transition-[filter] duration-500 group-hover:[filter:grayscale(0)_contrast(1)]"
                  unoptimized
                />
                <span
                  aria-hidden
                  className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.5)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-50 transition-opacity duration-500 group-hover:opacity-0"
                />
                <span className="absolute right-2 top-2 inline-flex items-center bg-hazard px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-ink">
                  ▸
                </span>
              </div>
              <div className="p-4">
                <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/55">
                  YouTube
                </p>
                <p className="mt-2 font-display text-base text-bone group-hover:text-slime md:text-lg">
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
