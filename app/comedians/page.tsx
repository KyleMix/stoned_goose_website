import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { comedians, comediansCopy } from "@/content/comedians";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Comedians",
  description:
    "Comedians on the Stoned Goose Productions roster — the funniest people in the Pacific Northwest.",
};

export default function ComediansPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Roster"
        title={
          <>
            Our <span className="italic text-hazard">Friends</span>
          </>
        }
        body={comediansCopy.subhead}
      />

      <section className="bg-ink py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <ul className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {comedians.map((c) => (
              <li key={c.name} className="group">
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={c.photo}
                    alt={c.name}
                    fill
                    sizes="(min-width: 1024px) 18vw, (min-width: 768px) 22vw, 45vw"
                    className="object-cover [filter:grayscale(1)_contrast(1.05)] transition-[filter] duration-500 group-hover:[filter:grayscale(0)_contrast(1)]"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.45)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-60 transition-opacity duration-500 group-hover:opacity-0"
                  />
                  <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-full items-center justify-center gap-4 bg-gradient-to-t from-ink/95 to-transparent px-4 py-4 transition-transform duration-300 group-hover:translate-y-0">
                    {c.instagram && (
                      <a
                        href={c.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${c.name} on Instagram`}
                        className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-bone hover:text-hazard"
                      >
                        IG ↗
                      </a>
                    )}
                    {c.facebook && (
                      <a
                        href={c.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${c.name} on Facebook`}
                        className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-bone hover:text-hazard"
                      >
                        FB ↗
                      </a>
                    )}
                  </div>
                </div>
                <h3 className="mt-4 font-display text-xl text-bone md:text-2xl">
                  {c.name}
                </h3>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-bone/10 bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                Roster Pipeline
              </p>
              <h2 className="heading-display mt-4 text-[clamp(2.4rem,7vw,5rem)] text-bone">
                Want to <span className="italic text-hazard">work</span> with us?
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="font-body text-base text-bone/85 md:text-lg">
                We keep a rolling submission pipeline for future showcases and
                feature sets. Send your latest tape and details for review.
              </p>
              <Link
                href="/submit"
                className="mt-6 inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
              >
                Submit to the roster ↗
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
