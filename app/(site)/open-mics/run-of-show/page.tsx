import type { Metadata } from "next";
import { RunOfShowView } from "@/components/open-mic/run-of-show-view";
import {
  MIC_SLOT_COUNT,
  MIC_SPOT_MINUTES,
} from "@/lib/open-mic-schedule";

// The running order, for whoever is working the room on a Monday.
//
// Not a page anybody discovers. It needs the host token on the query string
// and shows nothing without it, so it is kept out of the sitemap (which is an
// explicit route list in app/(site)/sitemap.ts, so there is nothing to
// remove) and marked noindex here as well.
//
// The host token is a separate credential from the export token and cannot
// reach email addresses. See docs/OPEN_MIC_SIGNUPS.md.

export const metadata: Metadata = {
  title: "Running order",
  robots: { index: false, follow: false },
};

export default function RunOfShowPage() {
  return (
    <section
      data-surface="tuxedo"
      // Turns on the print rules in app/globals.css, which drop the site
      // chrome and the on-screen controls and put the list on white paper.
      data-print-sheet=""
      aria-labelledby="run-of-show"
      className="min-h-screen bg-surface-tuxedo pb-24 pt-32 md:pt-36 print:pt-0"
    >
      <div className="mx-auto max-w-[900px] px-5 md:px-10">
        <p className="t-eyebrow">Log Cabin open mic</p>
        <h1 id="run-of-show" className="t-headline mt-4 display-1">
          Running order
        </h1>
        <p className="t-body mt-6 max-w-[52ch] text-base md:text-lg">
          {MIC_SLOT_COUNT} spots, {MIC_SPOT_MINUTES} minutes each. This is who
          signed up, in the order they signed up.
        </p>

        <div className="mt-12">
          <RunOfShowView />
        </div>
      </div>
    </section>
  );
}
