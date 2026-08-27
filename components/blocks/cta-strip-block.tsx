"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import type { CtaStripBlock as CtaStripBlockData } from "@/lib/blocks";

export function CtaStripBlock({
  block,
  pageSlug,
}: {
  block: CtaStripBlockData;
  pageSlug: string;
}) {
  return (
    <section className="border-y border-smoke bg-surface-tuxedo py-20 md:py-28">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-5 md:flex-row md:items-end md:justify-between md:px-10">
        <div className="max-w-2xl">
          {block.heading ? (
            <h2 className="t-headline display-2">
              {block.heading}
            </h2>
          ) : null}
          {block.subhead ? (
            <p className="t-body mt-5 text-base leading-relaxed md:text-lg">
              {block.subhead}
            </p>
          ) : null}
        </div>
        {block.primaryCtaLabel && block.primaryCtaHref ? (
          <div className="flex flex-col items-start gap-3">
            <Link
              href={block.primaryCtaHref}
              onClick={() =>
                track("CTA Click", { cta: `${pageSlug}-cta-strip` })
              }
              className="group inline-flex h-12 items-center gap-3 bg-accent-gold px-7 text-sm t-eyebrow text-surface-tuxedo transition-colors hover:bg-surface-ivory"
            >
              {block.primaryCtaLabel}
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            {block.note ? (
              <p className="t-eyebrow text-smoke">
                {block.note}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
