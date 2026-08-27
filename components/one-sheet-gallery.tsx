"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import type { OneSheetPage } from "@/content/open-mic-app";

// Page gallery for the Open Mic Explorer feature overview.
//
// This is the secondary way to read the sheet. The web summary above it on
// /open-mics is the primary one, because the sheet is two columns of small
// body text on US Letter and needs pinch zoom at phone widths. If either has
// to go, this does.
//
// Radix Dialog supplies the focus trap, the Escape handler, and the aria
// wiring. Arrow keys page through once the dialog is open. Thumbnails are
// ordinary buttons, so tab order and focus rings come for free.

type Props = {
  pages: OneSheetPage[];
};

export function OneSheetGallery({ pages }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const current = openIndex === null ? null : pages[openIndex];

  // Radix restores focus to its own Dialog.Trigger on close. This gallery has
  // five triggers and drives `open` itself, so there is no Trigger to restore
  // to and focus would land on <body>: a keyboard user closes the dialog and
  // has to tab from the top of the page again. Track the thumbnails and put
  // focus back on the page they were last looking at.
  const thumbnails = useRef<Array<HTMLButtonElement | null>>([]);
  const lastIndex = useRef(0);

  function open(index: number) {
    lastIndex.current = index;
    setOpenIndex(index);
  }

  function step(delta: number) {
    setOpenIndex((i) => {
      if (i === null) return i;
      const next = (i + delta + pages.length) % pages.length;
      lastIndex.current = next;
      return next;
    });
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {pages.map((page, i) => (
          <li key={page.page}>
            <button
              type="button"
              ref={(node) => {
                thumbnails.current[i] = node;
              }}
              onClick={() => open(i)}
              className="group block w-full border border-smoke bg-surface-tuxedo p-2 text-left transition-colors hover:border-accent-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
            >
              <Image
                src={page.src}
                alt={page.alt}
                width={page.width}
                height={page.height}
                loading="lazy"
                sizes="(min-width: 1024px) 250px, (min-width: 640px) 30vw, 45vw"
                className="h-auto w-full"
              />
              <span className="mt-2 block t-eyebrow text-smoke group-hover:text-accent-gold">
                Page {page.page} of {pages.length}
              </span>
              <span className="sr-only">. Enlarge.</span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog.Root
        open={openIndex !== null}
        onOpenChange={(next) => {
          if (!next) setOpenIndex(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-surface-tuxedo/90" />
          <Dialog.Content
            aria-label="Feature overview pages"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              thumbnails.current[lastIndex.current]?.focus();
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                step(1);
              }
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                step(-1);
              }
            }}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[94svh] w-[min(1000px,94vw)] -translate-x-1/2 -translate-y-1/2 flex-col border border-smoke bg-surface-tuxedo p-4 md:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <Dialog.Title asChild>
                <h3 className="t-eyebrow text-smoke">
                  Feature overview. Page {current ? current.page : 1} of{" "}
                  {pages.length}
                </h3>
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="shrink-0 t-eyebrow text-smoke hover:text-accent-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
                >
                  Close (esc)
                </button>
              </Dialog.Close>
            </div>

            <Dialog.Description asChild>
              <p className="t-body mt-2 text-xs text-smoke">
                Use the arrow keys or the buttons below to move between pages.
              </p>
            </Dialog.Description>

            {current ? (
              <div className="mt-4 min-h-0 flex-1 overflow-auto">
                <Image
                  key={current.src}
                  src={current.src}
                  alt={current.alt}
                  width={current.width}
                  height={current.height}
                  sizes="(min-width: 1024px) 960px, 94vw"
                  className="mx-auto h-auto w-full max-w-[820px]"
                />
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-4 border-t border-smoke pt-4">
              <button
                type="button"
                onClick={() => step(-1)}
                className="inline-flex h-11 items-center border border-smoke px-4 t-eyebrow text-surface-ivory hover:border-accent-gold hover:text-accent-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
              >
                ← Previous page
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className="inline-flex h-11 items-center border border-smoke px-4 t-eyebrow text-surface-ivory hover:border-accent-gold hover:text-accent-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
              >
                Next page →
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
