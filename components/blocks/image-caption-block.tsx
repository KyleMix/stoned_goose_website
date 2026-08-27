import Image from "next/image";
import type { ImageCaptionBlock as ImageCaptionBlockData } from "@/lib/blocks";

const ASPECT_CLASS: Record<ImageCaptionBlockData["aspect"], string> = {
  "16x9": "aspect-video",
  "4x5": "aspect-[4/5]",
  "1x1": "aspect-square",
};

export function ImageCaptionBlock({ block }: { block: ImageCaptionBlockData }) {
  if (!block.image) return null;
  return (
    <section className="border-b border-smoke bg-surface-tuxedo py-16 md:py-20">
      <div className="mx-auto max-w-[1100px] px-5 md:px-10">
        <figure>
          <div className={`relative w-full overflow-hidden bg-surface-tuxedo ${ASPECT_CLASS[block.aspect]}`}>
            <Image
              src={block.image}
              alt={block.alt}
              fill
              sizes="(min-width: 1024px) 1100px, 90vw"
              className="object-cover [filter:grayscale(1)_contrast(1.05)]"
              unoptimized
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
