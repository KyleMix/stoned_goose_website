import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { aboutCopy, members, pillars } from "@/content/members";
import { SectionHeader } from "@/components/section-header";

export const metadata: Metadata = {
  title: "Members",
  description:
    "Meet the crew behind Stoned Goose Productions. Producers, performers, and media pros building comedy experiences across the Pacific Northwest.",
};

export default function MembersPage() {
  return (
    <>
      <section className="relative border-b border-bone/10 bg-ink pb-16 pt-32 md:pb-24 md:pt-40">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-hazard">
            [ The Crew / Issue 001 ]
          </p>
          <h1 className="heading-display mt-4 text-[clamp(3rem,11vw,9rem)] text-bone">
            Members<span className="text-hazard">.</span>
          </h1>
          <p className="mt-8 max-w-2xl font-body text-base leading-relaxed text-bone/85 md:text-lg">
            {aboutCopy.subhead}
          </p>
        </div>
      </section>

      <section className="relative border-b border-bone/10 bg-ink py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <SectionHeader
            index="01"
            eyebrow="The Operation"
            title={
              <>
                Four <span className="italic text-hazard">pillars</span>
              </>
            }
            subtitle="The four functions the crew is organized around."
          />
          <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-bone/15 md:grid-cols-2">
            {pillars.map((p, i) => (
              <li
                key={p.title}
                className="relative bg-ink p-8 transition-colors hover:bg-bone/[0.025] md:p-10"
              >
                <span className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/40">
                  /0{i + 1}
                </span>
                <h3 className="heading-display mt-3 text-3xl text-bone md:text-4xl">
                  {p.title}
                </h3>
                <p className="mt-4 max-w-md font-body text-sm text-bone/85 md:text-base">
                  {p.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative border-b border-bone/10 bg-bone py-20 text-ink md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <SectionHeader
            index="02"
            eyebrow={aboutCopy.crewSubhead}
            title={
              <>
                Meet the <span className="italic">Crew</span>
              </>
            }
            className="[&_h2]:text-ink [&_p]:text-ink/70 [&_span]:text-ink/55"
          />

          <ul className="mt-16 divide-y divide-ink/15">
            {members.map((m, i) => (
              <li
                key={m.slug}
                className="group grid grid-cols-12 items-center gap-6 py-8 md:gap-10 md:py-12"
              >
                <span className="col-span-2 font-body text-xs font-medium uppercase tracking-[0.18em] text-ink/45 md:col-span-1">
                  {m.index}
                </span>
                <div className="col-span-10 md:col-span-3">
                  <div className="relative aspect-[3/4] w-full max-w-[220px] overflow-hidden">
                    <Image
                      src={m.photo}
                      alt={m.name}
                      fill
                      sizes="(min-width: 768px) 220px, 60vw"
                      className="object-cover [filter:grayscale(1)_contrast(1.05)] transition-[filter] duration-500 group-hover:[filter:grayscale(0)_contrast(1)]"
                      priority={i < 2}
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.45)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-60 transition-opacity duration-500 group-hover:opacity-0"
                    />
                  </div>
                </div>
                <div className="col-span-12 md:col-span-8">
                  <h3 className="heading-display text-[clamp(2.4rem,8vw,5.5rem)] text-ink">
                    {m.name}
                  </h3>
                  <p className="mt-2 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-ink/55">
                    {m.role}
                  </p>
                  {m.bio ? (
                    <>
                      <span
                        aria-hidden
                        className="mt-5 block h-px max-w-[80px] bg-ink/30"
                      />
                      <p className="mt-5 max-w-prose font-body text-base leading-relaxed text-ink/80 md:text-lg">
                        {m.bio}
                      </p>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

        </div>
      </section>

      <section className="relative bg-ink py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-hazard">
                Open Stage Door
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
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/submit"
                  className="inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
                >
                  Submit to the roster ↗
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center border border-bone/30 px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone hover:border-hazard hover:text-hazard"
                >
                  Talk to a producer ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
