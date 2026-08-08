import type { Metadata } from "next";
import Link from "next/link";
import {
  openMicsCopy,
  openMicsDisclaimer,
  openMicsFeed,
  openMicsTopSections,
  openMicsBottomSections,
} from "@/content/open-mics";
import { PageHeader } from "@/components/page-header";
import { FinePrint } from "@/components/fine-print";
import { OpenMicExplorer } from "@/components/open-mic-explorer";
import { OpenMicSubmitDialog } from "@/components/open-mic-submit-dialog";
import { SectionRenderer } from "@/components/section-renderer";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs, buildMicListSchema } from "@/lib/schema";

// The crew's Pacific Northwest open mic map. This used to live at /open-mics;
// that URL is now the Open Mic Explorer app announcement, so the map moved down
// a level and kept everything: the CMS copy, the 85 records, the submit dialog,
// and the ItemList markup. The ItemList belongs here because this is the page
// that actually lists the mics.

export const metadata: Metadata = {
  title: "Open Mic Map",
  description:
    "An interactive map of stand-up open mics across the Pacific Northwest, maintained by Stoned Goose Productions.",
  alternates: {
    canonical: "/open-mics/map",
  },
};

export default function OpenMicsMapPage() {
  const mics = openMicsFeed.mics;

  return (
    <>
      <JsonLd schema={buildBreadcrumbs("/open-mics/map", "Open Mic Map")} />
      {/* Venue-name ItemList only. No event, date, host, or offer claims are
          made for these crowd-sourced mics until the freshness system lands. */}
      {mics.length > 0 ? (
        <JsonLd schema={buildMicListSchema(mics)} />
      ) : null}
      <PageHeader
        eyebrow="The open mic map"
        title={
          <>
            Open <span className="italic text-hazard">Mics</span>
          </>
        }
        body={openMicsCopy.subhead}
      />

      <FinePrint
        eyebrow={openMicsDisclaimer.eyebrow}
        body={openMicsDisclaimer.body}
        footnote={openMicsDisclaimer.footnote}
      />

      <SectionRenderer sections={openMicsTopSections} pageSlug="open-mics" />

      <section className="section-y-tight border-b border-bone/10 bg-ink">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-bone/55">
              {openMicsCopy.kicker}
            </p>
            <OpenMicSubmitDialog
              triggerLabel="Submit a mic ↗"
              triggerClassName="inline-flex h-12 shrink-0 items-center justify-center border border-bone/30 px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone hover:border-slime hover:text-slime sm:justify-start"
            />
          </div>
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
                className="mt-6 inline-flex h-12 items-center border border-bone/30 px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone hover:border-slime hover:text-slime"
              >
                Tell us about a mic ↗
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* The app shares a name with this map and is a different thing. Say so
          plainly rather than letting the two blur together. */}
      <section
        aria-labelledby="open-mics-map-app"
        className="section-y-tight border-b border-bone/10 bg-ink"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="border border-bone/15 p-6 md:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-hazard">
              Different thing, same name
            </p>
            <h2
              id="open-mics-map-app"
              className="mt-3 font-display text-2xl text-bone md:text-3xl"
            >
              There is also an app called Open Mic Explorer.
            </h2>
            <p className="mt-4 max-w-3xl font-body text-base leading-relaxed text-bone/85">
              This map is our own Pacific Northwest list. The app is a separate
              product, coming soon to the App Store and Google Play, and Seattle
              is its first city. It arrives with no listings: hosts add their
              own rooms, anywhere, and that is how it fills in.
            </p>
            <Link
              href="/open-mics"
              className="mt-6 inline-flex h-12 items-center border border-bone/30 px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone hover:border-slime hover:text-slime"
            >
              Read about the app ↗
            </Link>
          </div>
        </div>
      </section>

      <section className="section-y bg-ink">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                Spotted a missing mic?
              </p>
              <h2 className="display-2 mt-4 text-bone">
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
                  className="inline-flex h-12 items-center justify-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-slime sm:justify-start"
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
