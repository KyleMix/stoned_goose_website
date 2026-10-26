"use client";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { track } from "@/lib/analytics";

type Props = {
  /** The headliner's name or the event title, for the dialog title and the download filename. */
  name: string;
  /** The original file, offered as the download. */
  href: string;
  /** The rendered flyer, a server-built <ShowPicture />. */
  children: ReactNode;
};

/**
 * "View flyer" and the dialog it opens.
 *
 * Radix Dialog (already a dependency, also behind the featured special player)
 * provides the focus trap, Escape to close, and focus returning to the
 * trigger. The backdrop is a flat tuxedo panel: no blur, no scrim.
 */
export function FlyerLightbox({ name, href, children }: Props) {
  const ext = href.match(/\.(png|jpe?g|webp)$/i)?.[1].toLowerCase() ?? "png";
  const filename = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-flyer.${ext}`;

  return (
    <Dialog.Root onOpenChange={(open) => open && track("View Flyer", { name })}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex min-h-[44px] items-center t-ui underline underline-offset-4 hover:text-accent-gold"
        >
          View flyer
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-surface-tuxedo" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto px-4 py-4 focus:outline-none md:py-6"
        >
          <div className="flex w-full max-w-[816px] flex-wrap items-center justify-between gap-3">
            <Dialog.Title className="t-ui">{name}: show flyer</Dialog.Title>
            <div className="flex items-center gap-3">
              <a
                href={href}
                download={filename}
                onClick={() => track("Download Flyer", { name })}
                className="inline-flex h-11 items-center border border-smoke px-4 t-ui hover:border-accent-gold hover:text-accent-gold"
              >
                Download
              </a>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-11 items-center bg-accent-gold px-4 t-ui text-surface-tuxedo hover:bg-surface-ivory"
                >
                  Close
                </button>
              </Dialog.Close>
            </div>
          </div>
          {/* Sized to the viewport so the whole flyer is readable without
              scrolling; the flyer's own 816px is the upper bound. */}
          <div className="mt-4 w-full max-w-[816px] [&_img]:mx-auto [&_img]:max-h-[calc(100dvh-7rem)] [&_img]:w-auto">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
