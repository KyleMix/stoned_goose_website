import showImages from "@/content/.generated/show-images.json";
import { cn } from "@/lib/utils";

/**
 * A headliner photo or flyer: WebP variants from
 * scripts/build-show-images.ts, with the PNG original as the fallback.
 *
 * next/image cannot do this here. The site is a static export with
 * `images.unoptimized`, so it would ship the 1.5 MB original to every phone.
 * The variants are built ahead of time instead, and this is the plain
 * <picture> that serves them.
 *
 * An image the manifest has not seen yet (a CMS upload the image workflow has
 * not processed) still renders, from the original.
 */

type Entry = {
  width: number;
  height: number;
  webp: { src: string; width: number }[];
};

const manifest = showImages as Record<string, Entry>;

/** Intrinsic size of an original, when the manifest knows it. */
export function showImageSize(src: string): { width: number; height: number } | null {
  const entry = manifest[src];
  return entry ? { width: entry.width, height: entry.height } : null;
}

// An original that is already WebP and wider than every variant joins the
// srcset, so a 1500px flyer still serves sharp on a 2x screen.
function webpSources(src: string, entry: Entry) {
  const widest = Math.max(0, ...entry.webp.map((v) => v.width));
  return /\.webp$/i.test(src) && entry.width > widest
    ? [...entry.webp, { src, width: entry.width }]
    : entry.webp;
}

type Props = {
  src: string;
  alt: string;
  /** The `sizes` attribute: the rendered width, e.g. "300px". */
  sizes: string;
  /** Above the fold: load eagerly instead of lazily. */
  priority?: boolean;
  className?: string;
};

export function ShowPicture({ src, alt, sizes, priority = false, className }: Props) {
  const entry = manifest[src];
  return (
    <picture>
      {entry ? (
        <source
          type="image/webp"
          srcSet={webpSources(src, entry)
            .map((v) => `${v.src} ${v.width}w`)
            .join(", ")}
          sizes={sizes}
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- static export: next/image would serve the unoptimized original, see above. */}
      <img
        src={src}
        alt={alt}
        width={entry?.width}
        height={entry?.height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn("block h-auto", className)}
      />
    </picture>
  );
}
