"use client";

import dynamic from "next/dynamic";
import { SectionHeader } from "@/components/section-header";

// The Cal.com embed pulls in @calcom/embed-react plus Cal's remote loader.
// Load it on demand so /book's route bundle stays lean; the placeholder
// height keeps the section from jumping when the scheduler mounts.
const BookCallEmbed = dynamic(
  () => import("@/components/book-call-embed").then((mod) => mod.BookCallEmbed),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="min-h-[420px] animate-pulse border border-smoke bg-surface-ivory/[0.03]"
      />
    ),
  },
);

// Was the top half of BookPlanner, which also carried the build-your-show
// estimator and existed only so the estimator could prefill the booking's
// notes field. With the estimator gone this is just the embed.
export function BookCallSection({ calLink }: { calLink: string | null }) {
  if (!calLink) return null;

  return (
    <section
      id="call"
      className="scroll-mt-24 border-b border-smoke bg-surface-tuxedo py-16 md:py-20"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHeader
          eyebrow="Start here"
          title={
            <>
              {/* The space is load-bearing. It used to be swallowed by a {""}
                  expression between the span and the word, which rendered the
                  headline as one word: BOOK A FREE INTROCALL. */}
              Book a free <span className="text-accent-gold">intro</span> call.
            </>
          }
          subtitle="Fifteen minutes, no prep needed. Tell us what you're planning and we'll show up with ideas."
        />
        <div className="mt-12">
          <BookCallEmbed calLink={calLink} />
        </div>
      </div>
    </section>
  );
}
