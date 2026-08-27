"use client";

import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { track } from "@/lib/analytics";

export type GridVideo = {
  id: string;
  title: string;
  url: string;
};

type Props = {
  videos: GridVideo[];
};

// Grid of YouTube videos that play inline. Each card is a thumbnail button; a
// single grid-level Radix Dialog renders the autoplay embed for whichever video
// is active. No third-party JS until the first click. Mirrors the modal pattern
// in featured-special-player.tsx so the playback UX stays consistent.
export function YouTubeGrid({ videos }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  if (videos.length === 0) return null;

  const active = videos.find((v) => v.id === activeId) ?? null;

  function handleOpenChange(next: boolean) {
    if (!next) setActiveId(null);
  }

  function openVideo(id: string) {
    setActiveId(id);
    track("Video Play", { id });
  }

  return (
    <Dialog.Root open={active !== null} onOpenChange={handleOpenChange}>
      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {videos.map((v) => {
          const poster = `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
          return (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => openVideo(v.id)}
                className="group block w-full border border-surface-ivory/15 bg-surface-tuxedo text-left transition-colors hover:border-accent-gold/60"
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
                  <span
                    aria-hidden
                    className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.5)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-50 transition-opacity duration-500 group-hover:opacity-0"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center bg-accent-gold text-surface-tuxedo transition-transform group-hover:scale-105">
                      <span aria-hidden className="text-xl">
                        ▸
                      </span>
                    </span>
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-body text-[10px] font-normal uppercase tracking-[0.18em] text-surface-ivory/55">
                    YouTube
                  </p>
                  <p className="mt-2 font-display text-base text-surface-ivory group-hover:text-accent-gold md:text-lg">
                    {v.title}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {active ? (
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-surface-tuxedo/95 data-[state=open]:animate-in data-[state=closed]:animate-out" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 focus:outline-none"
          >
            <div className="relative w-full max-w-[1200px]">
              <Dialog.Title className="sr-only">{active.title}</Dialog.Title>
              <div className="absolute -top-12 right-0 flex items-center gap-3">
                <a
                  href={active.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center px-3 font-body text-[11px] font-bold uppercase tracking-[0.18em] text-surface-ivory/65 hover:text-accent-gold"
                >
                  Watch on YouTube ↗
                </a>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Close player"
                    className="inline-flex h-10 items-center bg-accent-gold px-4 font-body text-[11px] font-bold uppercase tracking-[0.18em] text-surface-tuxedo hover:bg-surface-ivory"
                  >
                    Close ✕
                  </button>
                </Dialog.Close>
              </div>
              <div className="relative aspect-video w-full overflow-hidden bg-surface-tuxedo">
                <iframe
                  src={`https://www.youtube.com/embed/${active.id}?autoplay=1&rel=0`}
                  title={active.title}
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
