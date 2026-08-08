import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs } from "@/lib/schema";

// Placeholder. The map that used to live here now lives at /open-mics/map, and
// this URL becomes the Open Mic Explorer app announcement in the next commit.
// It is deliberately not a redirect: /open-mics is the app page from here on.

export const metadata: Metadata = {
  title: "Open Mic Explorer",
  description:
    "Open Mic Explorer, a mobile app for finding open mics and running them. Coming soon to the App Store and Google Play.",
  alternates: {
    canonical: "/open-mics",
  },
};

export default function OpenMicsPage() {
  return (
    <>
      <JsonLd schema={buildBreadcrumbs("/open-mics", "Open Mic Explorer")} />
      <PageHeader
        eyebrow="Open Mic Explorer"
        title={
          <>
            The <span className="italic text-hazard">app</span>
          </>
        }
        body="Open Mic Explorer is a mobile app for finding open mics and running them. Coming soon to the App Store and Google Play."
      />

      <section className="section-y bg-ink">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <h2 className="display-2 text-bone">Looking for the map?</h2>
          <p className="mt-6 max-w-xl font-body text-base text-bone/85 md:text-lg">
            Our Pacific Northwest open mic map moved. Same list, same submit
            form, one level down.
          </p>
          <Link
            href="/open-mics/map"
            className="mt-8 inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-slime"
          >
            Open the map ↗
          </Link>
        </div>
      </section>
    </>
  );
}
