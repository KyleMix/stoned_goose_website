"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

// Client error boundary for the site. Keeps the Adult Swim register of the 404
// and reuses its layout so a runtime miss still feels on-brand.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the failure in the console for debugging. No server logging in
    // a static export, so this is the only signal we get.
    console.error(error);
  }, [error]);

  return (
    <section className="relative flex min-h-[88svh] flex-col items-start bg-ink pt-32 md:pt-40">
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
        <div className="relative h-[180px] w-[180px] md:h-[260px] md:w-[260px]">
          <Image
            src="/brand/stoned-goose-logo-full.png"
            alt="Stoned Goose Productions"
            fill
            sizes="(min-width: 768px) 260px, 180px"
            className="object-contain"
            priority
          />
        </div>
        <p className="mt-10 font-body text-[10px] font-medium uppercase tracking-[0.18em] text-hazard">
          [ Static / 500 / Bombed ]
        </p>
        <h1 className="heading-display mt-6 text-[clamp(4rem,18vw,16rem)] text-bone">
          Tanked.
        </h1>
        <p className="mt-6 max-w-xl font-body text-base text-bone/85 md:text-lg">
          Something on this page died on stage. Give it another shot, or take
          the exit.
        </p>

        <div className="mt-10 flex flex-wrap gap-3 pb-20">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-slime"
          >
            Try again ↗
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center border border-bone/30 px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone hover:border-slime hover:text-slime"
          >
            Back to home ↗
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center border border-bone/30 px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone hover:border-slime hover:text-slime"
          >
            Talk to us ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
