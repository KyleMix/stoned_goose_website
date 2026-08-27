import type { VideoEmbedBlock as VideoEmbedBlockData } from "@/lib/blocks";

function youtubeId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const m = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([a-zA-Z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

function tiktokEmbedUrl(input: string): string | null {
  const m = input.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  return m ? `https://www.tiktok.com/embed/v2/${m[1]}` : null;
}

function instagramEmbedUrl(input: string): string | null {
  const m = input.match(/instagram\.com\/(p|reel)\/([\w-]+)/);
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed` : null;
}

export function VideoEmbedBlock({ block }: { block: VideoEmbedBlockData }) {
  let src: string | null = null;
  if (block.provider === "youtube") {
    const id = youtubeId(block.url);
    src = id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } else if (block.provider === "tiktok") {
    src = tiktokEmbedUrl(block.url);
  } else if (block.provider === "instagram") {
    src = instagramEmbedUrl(block.url);
  }

  if (!src) return null;

  return (
    <section className="border-b border-smoke bg-surface-tuxedo py-16 md:py-20">
      <div className="mx-auto max-w-[1100px] px-5 md:px-10">
        <figure>
          <div className="relative w-full overflow-hidden bg-surface-tuxedo aspect-video">
            <iframe
              src={src}
              title={block.caption || "Embedded video"}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
          {block.caption ? (
            <figcaption className="mt-4 t-eyebrow text-smoke">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      </div>
    </section>
  );
}
