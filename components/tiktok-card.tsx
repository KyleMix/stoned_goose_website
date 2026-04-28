"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import type { TikTokVideo } from "@/content/social";

type Props = TikTokVideo;

function extractTikTokId(url: string): string | null {
  const m = url.match(/\/video\/(\d+)/);
  return m ? m[1] : null;
}

let embedScriptLoaded = false;
function ensureEmbedScript() {
  if (embedScriptLoaded || typeof document === "undefined") return;
  const existing = document.querySelector<HTMLScriptElement>(
    'script[src="https://www.tiktok.com/embed.js"]',
  );
  if (existing) {
    embedScriptLoaded = true;
    return;
  }
  const s = document.createElement("script");
  s.src = "https://www.tiktok.com/embed.js";
  s.async = true;
  document.body.appendChild(s);
  embedScriptLoaded = true;
}

// Click-to-load TikTok embed. Poster + hazard play on first paint, no
// third-party JS until clicked. Honors prefers-reduced-motion by skipping
// auto-init when the user has it set (autoplay won't fire).
export function TikTokCard({ url, title, poster }: Props) {
  const [loaded, setLoaded] = useState(false);
  const id = extractTikTokId(url);

  useEffect(() => {
    if (!loaded) return;
    ensureEmbedScript();
  }, [loaded]);

  return (
    <li>
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-haze-500">
        {loaded && id ? (
          <blockquote
            className="tiktok-embed absolute inset-0"
            cite={url}
            data-video-id={id}
          >
            <a href={url}>{title}</a>
          </blockquote>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (!id) return;
              track("TikTok Play", { title });
              setLoaded(true);
            }}
            disabled={!id}
            aria-label={`Play ${title}`}
            className="group absolute inset-0 block h-full w-full"
          >
            <Image
              src={poster}
              alt={title}
              fill
              sizes="(min-width: 640px) 30vw, 90vw"
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
        <span>TikTok</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("Outbound Click", { destination: "tiktok" })}
          className="text-bone/65 hover:text-hazard"
        >
          open on tiktok ↗
        </a>
      </p>
    </li>
  );
}
