import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { MailingListCapture } from "@/components/mailing-list-capture";
import { OneSheetGallery } from "@/components/one-sheet-gallery";
import { buildBreadcrumbs } from "@/lib/schema";
import { site } from "@/content/site";
import {
  openMicAppContact,
  openMicAppFeatures,
  openMicAppFree,
  openMicAppHero,
  openMicAppMapLink,
  openMicAppOneSheet,
  openMicAppStatus,
} from "@/content/open-mic-app";

// The Open Mic Explorer app announcement.
//
// This URL used to be the Pacific Northwest map. It is not redirected, because
// the app page is what belongs here now, but a large share of arrivals are
// still people looking for a mic tonight. The route to /open-mics/map sits
// directly under the masthead for exactly that reason.
//
// No store badges. Apple's and Google's badge guidelines cover released apps,
// and a badge on an unreleased one implies a link that does not exist. The
// coming-soon line is plain text and stays that way until there are real store
// pages to point at.
//
// The one-sheet is summarized in HTML first and shown as page renders second.
// The sheet is two columns of small body text on US Letter; at 390px those
// renders need pinch zoom, and most people reading this page are on a phone.

export const metadata: Metadata = {
  title: "Open Mic Explorer, the app",
  description:
    "Open Mic Explorer is a phone app for open mics: music, comedy, and poetry on one map, with the signup list built in. Coming soon to the App Store and Google Play.",
  alternates: {
    canonical: "/open-mics",
  },
};

export default function OpenMicsPage() {
  return (
    <>
      <JsonLd schema={buildBreadcrumbs("/open-mics", "Open Mic Explorer")} />

      <PageHeader
        eyebrow={openMicAppHero.eyebrow}
        title={
          <>
            The <span className="italic text-accent-gold">app</span>
          </>
        }
        body={openMicAppHero.subhead}
      />

      {/* High and unmissable: people arriving here for the map must not hit a
          dead end, and the two products need telling apart honestly. */}
      <section
        aria-labelledby="open-mics-map-route"
        className="border-b border-surface-ivory/10 bg-surface-tuxedo py-10 md:py-12"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="border border-accent-gold/40 p-6 md:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent-gold">
              {openMicAppMapLink.eyebrow}
            </p>
            <h2
              id="open-mics-map-route"
              className="mt-3 font-display text-2xl text-surface-ivory md:text-3xl"
            >
              {openMicAppMapLink.heading}
            </h2>
            <p className="mt-4 max-w-3xl font-body text-base leading-relaxed text-surface-ivory/85">
              {openMicAppMapLink.body}
            </p>
            <Link
              href={openMicAppMapLink.ctaHref}
              className="mt-6 inline-flex h-12 items-center justify-center bg-accent-gold px-6 font-body text-xs font-bold uppercase tracking-[0.18em] text-surface-tuxedo hover:bg-surface-ivory"
            >
              {openMicAppMapLink.ctaLabel} ↗
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="open-mics-status"
        className="section-y-tight border-b border-surface-ivory/10 bg-surface-tuxedo"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-accent-gold">
                {openMicAppStatus.eyebrow}
              </p>
              <h2 id="open-mics-status" className="display-2 mt-4 text-surface-ivory">
                {openMicAppStatus.heading}
              </h2>
            </div>
            <div className="space-y-5 md:col-span-7">
              {openMicAppStatus.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className="font-body text-base leading-relaxed text-surface-ivory/85 md:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="open-mics-what-it-does"
        className="section-y border-b border-surface-ivory/10 bg-surface-tuxedo"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <h2 id="open-mics-what-it-does" className="display-2 text-surface-ivory">
            What it does.
          </h2>

          <div className="mt-12 space-y-16 md:mt-16 md:space-y-24">
            {openMicAppFeatures.map((feature, i) => (
              <div
                key={feature.id}
                className="grid gap-8 md:grid-cols-12 md:items-center md:gap-12"
              >
                <div
                  className={
                    i % 2 === 0
                      ? "md:col-span-4"
                      : "md:col-span-4 md:order-last"
                  }
                >
                  <Image
                    src={feature.image.src}
                    alt={feature.image.alt}
                    width={feature.image.width}
                    height={feature.image.height}
                    loading="lazy"
                    sizes="(min-width: 768px) 320px, 60vw"
                    className="h-auto w-[60%] max-w-[260px] border border-surface-ivory/15 md:w-full"
                  />
                </div>
                <div className="md:col-span-8">
                  <h3 className="font-display text-2xl text-surface-ivory md:text-4xl">
                    {feature.heading}
                  </h3>
                  <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-surface-ivory/85 md:text-lg">
                    {feature.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 border-t border-surface-ivory/15 pt-10 md:mt-24">
            <h3 className="font-display text-2xl text-surface-ivory md:text-3xl">
              {openMicAppFree.heading}
            </h3>
            <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-surface-ivory/85 md:text-lg">
              {openMicAppFree.body}
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="open-mics-one-sheet"
        className="section-y border-b border-surface-ivory/10 bg-surface-tuxedo"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <p className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-accent-gold">
            {openMicAppOneSheet.eyebrow}
          </p>
          <h2 id="open-mics-one-sheet" className="display-2 mt-4 text-surface-ivory">
            {openMicAppOneSheet.heading}
          </h2>
          <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-surface-ivory/85 md:text-lg">
            {openMicAppOneSheet.body}
          </p>

          <div className="mt-10">
            <OneSheetGallery pages={openMicAppOneSheet.pages} />
          </div>

          <a
            href={openMicAppOneSheet.pdf.href}
            className="mt-10 inline-flex min-h-12 items-center border border-surface-ivory/30 px-6 py-3 font-body text-xs font-bold uppercase tracking-[0.18em] text-surface-ivory hover:border-accent-gold hover:text-accent-gold"
          >
            {openMicAppOneSheet.pdf.label} ↓
          </a>
        </div>
      </section>

      <MailingListCapture
        page="open-mics-app"
        id="notify"
        eyebrow="Tell me when it is out"
        headline="One email when Open Mic Explorer hits the App Store and Google Play."
        submitLabel="Notify me"
        successBody="Got it. You get one email when it lands, and nothing else."
      />

      <section
        aria-labelledby="open-mics-app-contact"
        className="section-y-tight bg-surface-tuxedo"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <h2
            id="open-mics-app-contact"
            className="font-display text-2xl text-surface-ivory md:text-3xl"
          >
            {openMicAppContact.heading}
          </h2>
          <p className="mt-4 max-w-2xl font-body text-base text-surface-ivory/85">
            {openMicAppContact.body}
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {openMicAppContact.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-xs font-normal uppercase tracking-[0.18em] text-surface-ivory/85 underline-offset-4 hover:text-accent-gold hover:underline"
                >
                  {link.label} ↗
                </Link>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${site.contact.email}`}
                className="font-body text-xs font-normal uppercase tracking-[0.18em] text-surface-ivory/85 underline-offset-4 hover:text-accent-gold hover:underline"
              >
                {site.contact.email} ↗
              </a>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
