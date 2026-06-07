import type { Metadata } from "next";
import Link from "next/link";
import {
  openMicsCopy,
  openMicsFeed,
  openMicsTopSections,
  openMicsBottomSections,
} from "@/content/open-mics";
import { PageHeader } from "@/components/page-header";
import { OpenMicExplorer } from "@/components/open-mic-explorer";
import { OpenMicSubmitDialog } from "@/components/open-mic-submit-dialog";
import { SectionRenderer } from "@/components/section-renderer";

export const metadata: Metadata = {
  title: "Open Mics",
  description:
    "Open Mic Explorer. An interactive map of stand-up open mics across the Pacific Northwest, maintained by Stoned Goose Productions.",
  alternates: {
    canonical: "/open-mics",
  },
};

export default function OpenMicsPage() {
  const mics = openMicsFeed.mics;

  return (
    <>
      <PageHeader
        eyebrow="Open Mic Explorer"
        title={
          <>
            Open <span className="italic text-hazard">Mics</span>
          </>
        }
        body={openMicsCopy.subhead}
      />

      <SectionRenderer sections={openMicsTopSections} pageSlug="open-mics" />

      <section className="border-b border-bone/10 bg-ink py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <p className="mb-10 font-mono text-[11px] uppercase tracking-[0.28em] text-bone/55">
            {openMicsCopy.kicker}
          </p>
          {mics.length > 0 ? (
            <OpenMicExplorer mics={mics} />
          ) : (
            <div className="border border-bone/15 p-8 md:p-10">
              <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-hazard">
                Loading the map
              </p>
              <h2 className="mt-3 font-display text-3xl text-bone md:text-4xl">
                The map is being built right now.
              </h2>
              <p className="mt-4 max-w-xl font-body text-base text-bone/85">
                We&apos;re collecting open mics across Olympia, Tacoma,
                Seattle, and the rest of the Pacific Northwest. New mics are
                added as we confirm them.
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-flex h-12 items-center border border-bone/30 px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone hover:border-hazard hover:text-hazard"
              >
                Tell us about a mic ↗
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                Spotted a missing mic?
              </p>
              <h2 className="heading-display mt-4 text-[clamp(2rem,5vw,3.5rem)] text-bone">
                Help us keep the map honest.
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="font-body text-base text-bone/85 md:text-lg">
                If a mic moved, died, or was never on here in the first place,
                send a note. Local knowledge runs this list.
              </p>
              <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone sm:justify-start"
                >
                  Send us a tip ↗
                </Link>
                <OpenMicSubmitDialog
                  triggerLabel="Submit a mic ↗"
                  triggerClassName="inline-flex h-12 items-center justify-center border border-bone/30 px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone hover:border-slime hover:text-slime sm:justify-start"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionRenderer sections={openMicsBottomSections} pageSlug="open-mics" />
    </>
  );
}
