import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { SectionRenderer } from "@/components/section-renderer";
import { Surface } from "@/components/brand/surface";
import { MonocleRing } from "@/components/brand/monocle-ring";
import { ShowInfoBlock } from "@/components/brand/show-info-block";
import { buildBreadcrumbs } from "@/lib/schema";
import {
  logCabinMic,
  logCabinMicAddressLine,
  logCabinMicBottomSections,
  logCabinMicHowItWorks,
  logCabinMicPoster,
  logCabinMicTopSections,
  logCabinMicVenue,
} from "@/content/log-cabin-mic";

// The Log Cabin Comedy Open Mic, our own Monday room in Olympia.
//
// This URL has held three different things. It was the Pacific Northwest open
// mic map, then the Open Mic Explorer app announcement. The map is retired and
// the app is dead, so /open-mics is now one room and nothing else. No map, no
// Leaflet bundle, no third-party listings, no store links.
//
// Per CLAUDE.md this page is an information utility, not a sales surface: it
// carries no page-level mark, because the site header lockup is the only brand
// furniture it needs. The poster is the show's own artwork, not a mark placed
// on the page.
//
// No Event / ComedyEvent markup. lib/schema.ts deliberately refuses to mark
// recurring mics as events until a "last confirmed" freshness signal exists,
// and a weekly room with no dated instance is exactly that case. Breadcrumbs
// only.

export const metadata: Metadata = {
  title: "Log Cabin Comedy Open Mic",
  description:
    "Stoned Goose runs a comedy open mic every Monday at the Log Cabin Bar & Grill in Olympia. Sign ups at 6:00 PM, show 7:00 PM to 9:00 PM. Show up, go up.",
  alternates: {
    canonical: "/open-mics",
  },
};

export default function OpenMicsPage() {
  // The venue shape ShowInfoBlock reads. `start` stays null on purpose: this
  // room recurs, so the date and time slots are filled by `recurring` rather
  // than by a date that would be invented here and stale a week later.
  const show = {
    id: "log-cabin-comedy-open-mic",
    name: "Log Cabin Comedy Open Mic",
    start: null,
    end: null,
    url: null,
    summary: logCabinMic.subhead,
    venue: {
      name: logCabinMicVenue.name,
      address: logCabinMicAddressLine,
      city: logCabinMicVenue.city,
      region: logCabinMicVenue.region,
    },
    // Empty in the CMS renders no price row. The poster states no cover, and
    // an unstated price is left unstated rather than guessed at.
    ticketPrice: logCabinMic.price,
  };

  // "Sign ups 6:00 PM / Show 7:00 PM to 9:00 PM", dropping whatever is unset.
  const signup = logCabinMic.signupTime ? `Sign ups ${logCabinMic.signupTime}` : "";
  const showWindow = logCabinMic.showTime
    ? `Show ${logCabinMic.showTime}${logCabinMic.endTime ? ` to ${logCabinMic.endTime}` : ""}`
    : "";
  const times = [signup, showWindow].filter(Boolean).join(" / ");

  return (
    <>
      <JsonLd
        schema={buildBreadcrumbs("/open-mics", "Log Cabin Comedy Open Mic")}
      />

      <PageHeader
        eyebrow={logCabinMic.eyebrow}
        title={
          <>
            {logCabinMic.titleLead}{" "}
            <span className="text-accent-gold">
              {logCabinMic.titleEmphasis}
            </span>{" "}
            {logCabinMic.titleTrail}
          </>
        }
        body={logCabinMic.subhead}
      />

      <SectionRenderer sections={logCabinMicTopSections} pageSlug="open-mics" />

      {/* Everything a comic needs to turn up, in the one permitted order:
          date, venue, doors and show time, price, ticket link. */}
      <section
        data-surface="tuxedo"
        aria-labelledby="log-cabin-details"
        className="relative overflow-hidden border-b border-smoke bg-surface-tuxedo section-y"
      >
        <MonocleRing corner="top-right" size={320} />
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-center md:gap-12">
            {logCabinMicPoster.src ? (
              <div className="md:col-span-5">
                <Image
                  src={logCabinMicPoster.src}
                  alt={logCabinMicPoster.alt}
                  width={1080}
                  height={1080}
                  priority
                  sizes="(min-width: 768px) 520px, 100vw"
                  className="h-auto w-full border border-smoke"
                />
              </div>
            ) : null}

            <div className="md:col-span-7">
              <h2 id="log-cabin-details" className="display-2 text-surface-ivory">
                {logCabinMic.recurrence}.
              </h2>

              <ShowInfoBlock
                show={show}
                className="mt-8"
                recurring={{ date: logCabinMic.recurrence, times }}
                ticketAction={
                  logCabinMicVenue.mapUrl ? (
                    <Link
                      href={logCabinMicVenue.mapUrl}
                      className="mt-8 inline-flex h-12 items-center justify-center bg-accent-gold px-6 t-eyebrow text-surface-tuxedo hover:bg-surface-ivory"
                    >
                      Get directions ↗
                    </Link>
                  ) : null
                }
              />

              {logCabinMic.motto ? (
                <p className="t-subhead mt-10 text-2xl md:text-3xl">
                  {logCabinMic.motto}
                </p>
              ) : null}

              {logCabinMic.host ? (
                <p className="t-fine mt-4">Hosted by {logCabinMic.host}.</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {logCabinMicHowItWorks.length > 0 ? (
        <Surface
          tone="ivory"
          aria-labelledby="log-cabin-how"
          className="border-b border-smoke section-y"
        >
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <h2 id="log-cabin-how" className="display-2">
              How it works.
            </h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-12">
              {logCabinMicHowItWorks.map((step, i) => (
                <li key={step.heading || i}>
                  <p className="t-eyebrow">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="t-subhead mt-4 text-xl md:text-2xl">
                    {step.heading}
                  </h3>
                  <p className="t-body mt-3 text-base leading-relaxed">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Surface>
      ) : null}

      <section
        data-surface="tuxedo"
        aria-labelledby="log-cabin-more"
        className="bg-surface-tuxedo section-y-tight"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="t-eyebrow">Not a Monday?</p>
              <h2 id="log-cabin-more" className="display-2 mt-4 text-surface-ivory">
                We put on other rooms too.
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="t-body text-base md:text-lg">
                Booked shows, showcases, and whatever else we are running. If you
                want to talk about the mic, or about getting on a real lineup,
                write to us.
              </p>
              <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/shows"
                  className="inline-flex h-12 items-center justify-center bg-accent-gold px-6 t-eyebrow text-surface-tuxedo hover:bg-surface-ivory sm:justify-start"
                >
                  See the shows ↗
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center border border-smoke px-6 t-eyebrow text-surface-ivory hover:border-accent-gold hover:text-accent-gold sm:justify-start"
                >
                  Get in touch ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionRenderer
        sections={logCabinMicBottomSections}
        pageSlug="open-mics"
      />
    </>
  );
}
