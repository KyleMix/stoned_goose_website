"use client";

import Link from "next/link";
import { hero } from "@/content/home";
import { track } from "@/lib/analytics";

export function Hero() {
  return (
    <section
      aria-label="Hero"
      className="relative isolate overflow-hidden border-b border-bone/10 bg-ink"
    >
      {/* Background: solid black + a soft directional vignette. Site-wide grain
          handles texture on top. No video, no stock photo. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_0%,rgba(239,233,221,0.06),transparent_55%),radial-gradient(ellipse_at_85%_85%,rgba(242,234,0,0.05),transparent_55%)]"
      />

      <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-32 md:px-10 md:pb-20 md:pt-36">
        {/* The single mono use, per the spec: a status banner. */}
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/55">
          Now booking{" "}
          <span className="text-bone">corporate events + media production</span>
        </p>

        {/* Two-line lockup, same display size, left-aligned, period-as-accent. */}
        <h1 className="heading-display mt-8 text-[clamp(3.5rem,12vw,11rem)] text-bone">
          <span className="block">Stoned Goose</span>
          <span className="block">
            Productions<span className="text-hazard">.</span>
          </span>
        </h1>

        {/* Baseline-aligned row: subhead left, italic tagline right.
            items-baseline anchors both first-line baselines to the same line. */}
        <div className="mt-10 grid grid-cols-12 items-baseline gap-x-8 gap-y-4 border-t border-bone/15 pt-8 md:mt-12">
          <p className="col-span-12 max-w-md font-body text-base leading-snug text-bone/85 md:col-span-7 md:text-lg">
            {hero.subhead}
          </p>
          <p className="col-span-12 font-display text-3xl italic leading-snug text-bone md:col-span-5 md:text-right md:text-4xl">
            {hero.italicLine}
          </p>
        </div>

        {/* Single primary CTA + tertiary text links. The hero answers one
            question: book a show. */}
        <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4 md:mt-12">
          <Link
            href={hero.primary.href}
            onClick={() => track("CTA Click", { cta: "hero-primary" })}
            className="group inline-flex h-12 items-center gap-3 bg-hazard px-7 font-body text-sm font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-bone"
          >
            {hero.primary.label}
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href={hero.secondary.href}
            className="font-body text-xs font-medium uppercase tracking-[0.18em] text-bone/85 underline-offset-4 hover:text-hazard hover:underline"
          >
            {hero.secondary.label} ↗
          </Link>
          {hero.tertiary.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="font-body text-xs font-medium uppercase tracking-[0.18em] text-bone/65 underline-offset-4 hover:text-hazard hover:underline"
            >
              {t.label} ↗
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
