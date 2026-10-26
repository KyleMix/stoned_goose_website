import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { SectionRenderer } from "@/components/section-renderer";
import { HostAMic } from "@/components/open-mic/host-a-mic";
import { buildBreadcrumbs } from "@/lib/schema";
import {
  openMic,
  openMicBottomSections,
  openMicHost,
  openMicTopSections,
} from "@/content/open-mic";

// /open-mics, coming soon.
//
// The Log Cabin Monday mic was cancelled for good in October 2026. Until the
// next room exists this page says so and asks venues to get in touch, through
// the same Instagram DM and prefilled email buttons the mic used for spots.
//
// Per CLAUDE.md this page is an information utility, not a sales surface: it
// carries no page-level mark. No Event markup, because there is no event.

export const metadata: Metadata = {
  title: "Open Mic: Coming Soon",
  description:
    "The Stoned Goose open mic is looking for a new home. Run a bar, brewery, coffee shop or other public space that wants a comedy open mic? Message us on Instagram or email.",
  alternates: {
    canonical: "/open-mics",
  },
};

export default function OpenMicsPage() {
  return (
    <>
      <JsonLd schema={buildBreadcrumbs("/open-mics", "Open Mic")} />

      <PageHeader
        eyebrow={openMic.eyebrow}
        title={
          <>
            {openMic.titleLead}{" "}
            <span className="text-accent-gold">{openMic.titleEmphasis}</span>{" "}
            {openMic.titleTrail}
          </>
        }
        body={openMic.subhead}
      />

      <SectionRenderer sections={openMicTopSections} pageSlug="open-mics" />

      <section
        data-surface="tuxedo"
        aria-labelledby="open-mic-host"
        className="border-b border-smoke bg-surface-tuxedo section-y"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <HostAMic copy={openMicHost} />
        </div>
      </section>

      <section
        data-surface="tuxedo"
        aria-labelledby="open-mic-more"
        className="bg-surface-tuxedo section-y-tight"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="t-eyebrow">In the meantime</p>
              <h2 id="open-mic-more" className="display-2 mt-4 text-surface-ivory">
                We still put on shows.
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="t-body text-base md:text-lg">
                Booked shows, showcases, and whatever else we are running. If
                you want to get on a real lineup, write to us.
              </p>
              <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/shows"
                  className="inline-flex h-12 items-center justify-center bg-accent-gold px-6 t-ui text-surface-tuxedo transition-colors hover:bg-surface-ivory sm:justify-start"
                >
                  See the shows ↗
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center border border-smoke px-6 t-ui text-surface-ivory transition-colors hover:border-accent-gold hover:text-accent-gold sm:justify-start"
                >
                  Get in touch ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionRenderer sections={openMicBottomSections} pageSlug="open-mics" />
    </>
  );
}
