import Link from "next/link";
import { hero } from "@/content/home";
import { CtaAnchor } from "@/components/cta-anchor";
import { TextEffect } from "@/components/text-effect";
import { MonocleRing } from "@/components/brand/monocle-ring";
import { GoldRule } from "@/components/brand/gold-rule";

// The hero answers three questions in the space above the fold: who we are,
// where we are, and what we do. It used to answer none of them. The old
// subhead ("crafting cinematic stand-up, curated showcases, and comedy chaos
// across your city") named no place, no size, and no service, and the one gold
// button on the page pointed at the ticket calendar.
//
// One primary CTA, jumping to the contact form further down this same page,
// and one plain text link to the calendar. The next show itself appears once,
// in the "what we're working on" row, rather than three times as it used to.
export function Hero() {
  return (
    <section
      aria-label="Introduction"
      className="relative isolate overflow-hidden border-b border-smoke bg-surface-tuxedo"
    >
      {/* The signature device, once. One ring per section is the rule, and
          scripts/test/monocle-ring.test.ts fails the build if a second lands
          in here. The section is `relative`, which the bleed anchors to. */}
      <MonocleRing corner="bottom-right" size={420} sizeSm={200} />

      <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-28 md:px-10 md:pb-24 md:pt-36">
        {hero.eyebrow ? <p className="t-eyebrow">{hero.eyebrow}</p> : null}

        <h1 className="t-headline mt-6 display-hero">
          <TextEffect as="span" text="Stoned Goose" className="block" />
          <TextEffect
            as="span"
            text="Productions"
            className="block"
            delay={0.35}
            trailing={<span className="text-accent-gold">.</span>}
          />
        </h1>

        <GoldRule className="mt-10 md:mt-12" />

        <p className="t-body mt-8 max-w-2xl text-lg leading-relaxed md:text-xl">
          {hero.subhead}
        </p>

        <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-7 md:mt-12">
          <CtaAnchor
            cta="hero-book"
            href={hero.primary.href}
            className="group inline-flex h-12 items-center justify-center gap-3 bg-accent-gold px-7 t-ui text-surface-tuxedo transition-colors hover:bg-surface-ivory sm:justify-start"
          >
            {hero.primary.label}
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </CtaAnchor>
          <Link
            href={hero.secondary.href}
            className="inline-flex min-h-[44px] items-center justify-center t-ui text-smoke underline-offset-4 transition-colors hover:text-accent-gold hover:underline sm:justify-start"
          >
            {hero.secondary.label} <span aria-hidden className="ml-1">&#8599;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
