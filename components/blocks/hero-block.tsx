"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import { TextEffect } from "@/components/text-effect";
import type { HeroBlock as HeroBlockData } from "@/lib/blocks";

// Editor-configurable hero. Visually mirrors the home hero but takes its copy
// and CTAs from a page block instead of the site singleton, so the same
// component can drop into any composed page.
export function HeroBlock({ block, pageSlug }: { block: HeroBlockData; pageSlug: string }) {
  const headline = block.headline.trim();
  const words = headline.split(/\s+/);
  const firstHalf = words.slice(0, Math.ceil(words.length / 2)).join(" ");
  const secondHalf = words.slice(Math.ceil(words.length / 2)).join(" ");

  return (
    <section
      aria-label="Hero"
      className="relative isolate overflow-hidden border-b border-smoke bg-surface-tuxedo"
    >

      <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-32 md:px-10 md:pb-20 md:pt-36">
        {block.eyebrow ? (
          <p className="t-eyebrow text-smoke">
            {block.eyebrow}
          </p>
        ) : null}

        <h1 className="t-headline mt-8 display-hero">
          {secondHalf.length > 0 ? (
            <>
              <TextEffect as="span" text={firstHalf} className="block" />
              <TextEffect
                as="span"
                text={secondHalf}
                className="block"
                delay={0.35}
                trailing={<span className="text-accent-gold">.</span>}
              />
            </>
          ) : (
            <TextEffect
              as="span"
              text={firstHalf}
              className="block"
              trailing={<span className="text-accent-gold">.</span>}
            />
          )}
        </h1>

        {(block.subhead || block.italicLine) && (
          <div className="mt-10 grid grid-cols-12 items-baseline gap-x-8 gap-y-4 border-t border-smoke pt-8 md:mt-12">
            {block.subhead ? (
              <p className="t-body col-span-12 max-w-md text-base leading-snug md:col-span-7 md:text-lg">
                {block.subhead}
              </p>
            ) : null}
            {block.italicLine ? (
              <p className="col-span-12 t-subhead text-3xl leading-snug md:col-span-5 md:text-right md:text-4xl">
                {block.italicLine}
              </p>
            ) : null}
          </div>
        )}

        {(block.primaryCtaLabel || block.secondaryCtaLabel) && (
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4 md:mt-12">
            {block.primaryCtaLabel && block.primaryCtaHref ? (
              <Link
                href={block.primaryCtaHref}
                onClick={() => track("CTA Click", { cta: `${pageSlug}-hero-primary` })}
                className="group inline-flex h-12 items-center gap-3 bg-accent-gold px-7 text-sm t-eyebrow text-surface-tuxedo transition-colors hover:bg-surface-ivory"
              >
                {block.primaryCtaLabel}
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ) : null}
            {block.secondaryCtaLabel && block.secondaryCtaHref ? (
              <Link
                href={block.secondaryCtaHref}
                className="t-eyebrow text-smoke underline-offset-4 hover:text-accent-gold hover:underline"
              >
                {block.secondaryCtaLabel} ↗
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
