"use client";

import Image from "next/image";
import { useState } from "react";
import { track } from "@/lib/analytics";

type Props = {
  title: string;
  url: string;
  poster: string;
  /** Plausible "Feed Click" placement key. Defaults to watch-reels since
   *  that's the only current consumer. */
  placement?: "watch-reels" | "watch-grid" | "home-strip" | "shows-fb-plugin";
};

function extractInstagramId(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

// Click-to-load Instagram embed. First paint ships a poster only, no third-party
// JS or iframes. Clicking the play button swaps in the official IG embed iframe,
// which loads its own JS lazily. "Open on Instagram" link survives as a fallback.
export function ReelCard({ title, url, poster, placement = "watch-reels" }: Props) {
  const [loaded, setLoaded] = useState(false);
  const id = extractInstagramId(url);
  const embedSrc = id ? `https://www.instagram.com/reel/${id}/embed/` : null;

  return (
    <li>
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-haze-500">
        {loaded && embedSrc ? (
          <iframe
            src={embedSrc}
            title={title}
            allow="encrypted-media"
            scrolling="no"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              if (!embedSrc) return;
              track("Reel Play", { reel: title });
              setLoaded(true);
            }}
            disabled={!embedSrc}
            aria-label={`Play ${title}`}
            className="group absolute inset-0 block h-full w-full"
          >
            <Image
              src={poster}
              alt={title}
              fill
              sizes="(min-width: 640px) 45vw, 90vw"
              className="object-cover [filter:grayscale(1)_contrast(1.05)] transition-[filter] duration-500 group-hover:[filter:grayscale(0)]"
            />
            <span
              aria-hidden
              className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.5)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-50 transition-opacity duration-500 group-hover:opacity-0"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center bg-hazard text-ink">
                <span aria-hidden className="text-xl">
                  ▸
                </span>
              </span>
            </span>
          </button>
        )}
      </div>
      <p className="mt-3 font-display text-xl text-bone md:text-2xl">{title}</p>
      <p className="mt-1 flex items-center gap-3 font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/55">
        <span>Instagram Reel</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            track("Feed Click", { platform: "instagram", placement })
          }
          className="text-bone/65 hover:text-hazard"
        >
          open on instagram ↗
        </a>
      </p>
    </li>
  );
}
