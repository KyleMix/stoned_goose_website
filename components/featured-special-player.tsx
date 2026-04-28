"use client";

import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
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
// a Radix Dialog with a YouTube embed. No third-party JS until first click.
export function FeaturedSpecialPlayer({ poster, alt, videoUrl }: Props) {
  const [open, setOpen] = useState(false);
  const ytId = videoUrl ? extractYouTubeId(videoUrl) : null;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) track("Special Play");
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
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
            <Dialog.Trigger asChild>
              <button
                type="button"
                aria-label="Play featured special"
                className="group flex h-20 w-20 items-center justify-center bg-hazard text-ink transition-transform hover:scale-105 md:h-28 md:w-28"
              >
                <span aria-hidden className="text-3xl md:text-5xl">
                  ▸
                </span>
              </button>
            </Dialog.Trigger>
          ) : (
            <span className="border border-hazard bg-ink/85 px-5 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-bone backdrop-blur-sm md:text-xs">
              Coming soon
            </span>
          )}
        </div>
      </div>

      {ytId ? (
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/95 data-[state=open]:animate-in data-[state=closed]:animate-out" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 focus:outline-none"
          >
            <div className="relative w-full max-w-[1200px]">
              <Dialog.Title className="sr-only">Featured special player</Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close player"
                  className="absolute -top-12 right-0 inline-flex h-10 items-center bg-hazard px-4 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
                >
                  Close ✕
                </button>
              </Dialog.Close>
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
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}
