"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

type Props = {
  poster: string;
  alt: string;
  videoUrl: string | null;
};

// Extract a YouTube ID from a watch / share / embed URL. When the supplied
// videoUrl is already a bare 11-char ID we just return it.
function extractYouTubeId(url: string): string | null {
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url;
  const patterns = [
    /(?:v=|\/embed\/|youtu\.be\/|\/v\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

// Featured special player. When videoUrl is null we render the editorial
// "Coming soon" badge instead of a dead play button. When set, a click opens
// a lightweight YouTube embed modal. No third-party JS until first click.
export function FeaturedSpecialPlayer({ poster, alt, videoUrl }: Props) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const ytId = videoUrl ? extractYouTubeId(videoUrl) : null;

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  function handlePlay() {
    track("Special Play");
    setOpen(true);
  }

  return (
    <>
      <div className="relative aspect-video w-full overflow-hidden bg-haze-500">
        <Image
          src={poster}
          alt={alt}
          fill
          sizes="(min-width: 768px) 66vw, 100vw"
          className="object-cover [filter:grayscale(1)_contrast(1.1)]"
          priority
        />
        <span
          aria-hidden
          className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.4)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-50"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {ytId ? (
            <button
              type="button"
              onClick={handlePlay}
              aria-label="Play featured special"
              className="group flex h-20 w-20 items-center justify-center bg-hazard text-ink transition-transform hover:scale-105 md:h-28 md:w-28"
            >
              <span aria-hidden className="text-3xl md:text-5xl">
                ▸
              </span>
            </button>
          ) : (
            <span className="border border-hazard bg-ink/85 px-5 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-bone backdrop-blur-sm md:text-xs">
              Coming soon
            </span>
          )}
        </div>
      </div>

      {open && ytId ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Featured special player"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 px-4 py-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="relative w-full max-w-[1200px]">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close player"
              className="absolute -top-12 right-0 inline-flex h-10 items-center bg-hazard px-4 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
            >
              Close ✕
            </button>
            <div className="relative aspect-video w-full overflow-hidden bg-ink">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                title="Featured special"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
