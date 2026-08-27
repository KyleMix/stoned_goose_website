"use client";

import Link from "next/link";
import { Lockup } from "@/components/brand/lockup";
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
    <section className="relative flex min-h-[88svh] flex-col items-start bg-surface-tuxedo pt-32 md:pt-40">
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
        <Lockup colorway="gold" width={300} priority />
        <p className="mt-10 t-eyebrow">
          [ Static / 500 / Bombed ]
        </p>
        <h1 className="t-headline mt-6 display-mega">
          Tanked.
        </h1>
        <p className="t-body mt-6 max-w-xl text-base md:text-lg">
          Something on this page died on stage. Give it another shot, or take
          the exit.
        </p>

        <div className="mt-10 flex flex-wrap gap-3 pb-20">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-12 items-center bg-accent-gold px-6 t-eyebrow text-surface-tuxedo hover:bg-surface-ivory"
          >
            Try again ↗
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center border border-smoke px-6 t-eyebrow text-surface-ivory hover:border-accent-gold hover:text-accent-gold"
          >
            Back to home ↗
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center border border-smoke px-6 t-eyebrow text-surface-ivory hover:border-accent-gold hover:text-accent-gold"
          >
            Talk to us ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
