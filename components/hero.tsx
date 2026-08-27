"use client";

import Image from "next/image";
import Link from "next/link";
import { hero } from "@/content/home";
import { upcomingShows } from "@/content/shows";
import { track } from "@/lib/analytics";
import { TextEffect } from "@/components/text-effect";

function formatShowDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export function Hero() {
  // The next real show gets a ticket strip above the fold. Renders nothing
  // while the calendar is empty, lights up the moment a show is entered.
  const next = upcomingShows[0];
  const nextDate = next ? formatShowDate(next.start) : null;
  const nextVenue = next ? next.venue?.name ?? next.venue?.city ?? null : null;
  return (
    <section
      aria-label="Hero"
      className="relative isolate overflow-hidden border-b border-smoke bg-surface-tuxedo"
    >
      {/* Background: solid black + a soft directional vignette. Site-wide grain
          handles texture on top. No video, no stock photo. */}

      <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-32 md:px-10 md:pb-20 md:pt-36">
        {/* The single mono use, per the spec: a status banner. The 32px mark
            sits left as a quiet brand-anchor: opacity holds it back so the
            wordmark below stays the focal point. */}
        <div className="flex items-center gap-3">
          <Image
            src="/brand/stoned-goose-mark-illustration.png"
            alt=""
            width={32}
            height={28}
            priority
            className="h-7 w-auto opacity-60"
          />
          <p className="t-eyebrow text-smoke">
            Now booking{" "}
            <span className="text-surface-ivory">corporate events + media production</span>
          </p>
        </div>

        {/* Two-line lockup, same display size, left-aligned, period-as-accent.
            Per-letter rise on mount via TextEffect. Reduced-motion renders
            the static string. */}
        <h1 className="t-headline mt-8 display-hero">
          <TextEffect as="span" text="Stoned Goose" className="block" />
          <TextEffect
            as="span"
            text="Productions"
            className="block"
            delay={0.35}
            trailing={<span className="text-accent-gold">.</span>}
          />
        </h1>

        {/* Baseline-aligned row: subhead left, tagline right.
            items-baseline anchors both first-line baselines to the same line. */}
        <div className="mt-10 grid grid-cols-12 items-baseline gap-x-8 gap-y-4 border-t border-smoke pt-8 md:mt-12">
          <p className="t-body col-span-12 max-w-md text-base leading-snug md:col-span-7 md:text-lg">
            {hero.subhead}
          </p>
          <p className="col-span-12 t-subhead text-3xl leading-snug md:col-span-5 md:text-right md:text-4xl">
            {hero.italicLine}
          </p>
        </div>

        {/* Single primary CTA + tertiary text links. The hero answers one
            question: book a show. */}
        <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4 md:mt-12">
          <Link
            href={hero.primary.href}
            onClick={() => track("CTA Click", { cta: "hero-primary" })}
            className="group inline-flex h-12 items-center gap-3 bg-accent-gold px-7 text-sm t-eyebrow text-surface-tuxedo transition-colors hover:bg-surface-ivory"
          >
            {hero.primary.label}
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href={hero.secondary.href}
            className="t-eyebrow text-smoke underline-offset-4 hover:text-accent-gold hover:underline"
          >
            {hero.secondary.label} ↗
          </Link>
          {hero.tertiary.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="t-eyebrow text-smoke underline-offset-4 hover:text-accent-gold hover:underline"
            >
              {t.label} ↗
            </Link>
          ))}
        </div>

        {next ? (
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t-2 border-accent-gold pt-6">
            <p className="t-eyebrow">
              Next on stage
            </p>
            <p className="t-body text-sm md:text-base">
              {[nextDate, next.name, nextVenue].filter(Boolean).join(". ")}
            </p>
            <a
              href={next.ticketUrl ?? "/shows"}
              {...(next.ticketUrl
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              onClick={() => track("CTA Click", { cta: "hero-next-show" })}
              className="inline-flex h-11 items-center bg-accent-gold px-5 t-eyebrow text-surface-tuxedo transition-colors hover:bg-surface-ivory"
            >
              Get tickets ↗
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
