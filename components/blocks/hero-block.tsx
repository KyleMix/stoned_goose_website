"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import { TextEffect } from "@/components/text-effect";
import type { HeroBlock as HeroBlockData } from "@/lib/blocks";

// Editor-configurable hero. Visually mirrors the home hero but takes its copy
// and CTAs from a Keystatic block instead of the site singleton, so the same
// component can drop into any composed page.
export function HeroBlock({ block, pageSlug }: { block: HeroBlockData; pageSlug: string }) {
  const headline = block.headline.trim();
  const words = headline.split(/\s+/);
  const firstHalf = words.slice(0, Math.ceil(words.length / 2)).join(" ");
  const secondHalf = words.slice(Math.ceil(words.length / 2)).join(" ");

  return (
    <section
      aria-label="Hero"
      className="relative isolate overflow-hidden border-b border-bone/10 bg-ink"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_0%,rgba(239,233,221,0.06),transparent_55%),radial-gradient(ellipse_at_85%_85%,rgba(242,234,0,0.05),transparent_55%)]"
      />

      <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-32 md:px-10 md:pb-20 md:pt-36">
        {block.eyebrow ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/55">
            {block.eyebrow}
          </p>
        ) : null}

        <h1 className="heading-display mt-8 text-[clamp(3.5rem,12vw,11rem)] text-bone">
          {secondHalf.length > 0 ? (
            <>
              <TextEffect as="span" text={firstHalf} className="block" />
              <TextEffect
                as="span"
                text={secondHalf}
                className="block"
                delay={0.35}
                trailing={<span className="text-hazard">.</span>}
              />
            </>
          ) : (
            <TextEffect
              as="span"
              text={firstHalf}
              className="block"
              trailing={<span className="text-hazard">.</span>}
            />
          )}
        </h1>

        {(block.subhead || block.italicLine) && (
          <div className="mt-10 grid grid-cols-12 items-baseline gap-x-8 gap-y-4 border-t border-bone/15 pt-8 md:mt-12">
            {block.subhead ? (
              <p className="col-span-12 max-w-md font-body text-base leading-snug text-bone/85 md:col-span-7 md:text-lg">
                {block.subhead}
              </p>
            ) : null}
            {block.italicLine ? (
              <p className="col-span-12 font-display text-3xl italic leading-snug text-bone md:col-span-5 md:text-right md:text-4xl">
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
                className="group inline-flex h-12 items-center gap-3 bg-hazard px-7 font-body text-sm font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-bone"
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
                className="font-body text-xs font-medium uppercase tracking-[0.18em] text-bone/85 underline-offset-4 hover:text-hazard hover:underline"
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
