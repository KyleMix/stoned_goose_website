import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Person } from "schema-dts";
import {
  aboutCopy,
  members,
  pillars,
  rosterTopSections,
  rosterBottomSections,
} from "@/content/members";
import { comedians, comediansCopy } from "@/content/comedians";
import { site } from "@/content/site";
import { PageHeader } from "@/components/page-header";
import { SectionRenderer } from "@/components/section-renderer";
import { SectionHeader } from "@/components/section-header";
import { jsonLdString } from "@/lib/jsonld";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs } from "@/lib/schema";
import { getPlaceholder } from "@/lib/placeholders";

export const metadata: Metadata = {
  title: "Roster",
  description:
    "The Stoned Goose Productions roster. The crew running the operation and the comics in our regular rotation across the Pacific Northwest.",
  alternates: {
    canonical: "/roster",
  },
};

export default function RosterPage() {
  const personJsonLd: Person[] = members
    .filter((m) => Boolean(m.bio))
    .map((m) => ({
      "@type": "Person",
      name: m.name,
      jobTitle: m.role,
      description: m.bio,
      image: `${site.url}${m.photo}`,
      worksFor: {
        "@type": "Organization",
        name: site.name,
        url: site.url,
      },
      url: `${site.url}/roster`,
    }));

  return (
    <>
      <JsonLd schema={buildBreadcrumbs("/roster")} />
      {personJsonLd.map((p, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(p) }}
        />
      ))}

      <PageHeader
        eyebrow="The Roster"
        title={
          <>
            Roster<span className="text-hazard">.</span>
          </>
        }
        body={aboutCopy.subhead}
      />

      <SectionRenderer sections={rosterTopSections} pageSlug="roster" />

      <section className="relative border-b border-bone/10 bg-ink py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <SectionHeader
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
            eyebrow={aboutCopy.crewSubhead}
            title={
              <>
                The <span className="italic">Crew</span>
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
                      alt={m.photoAlt || m.name}
                      fill
                      sizes="(min-width: 768px) 220px, 60vw"
                      {...(getPlaceholder(m.photo)
                        ? { placeholder: "blur" as const, blurDataURL: getPlaceholder(m.photo)! }
                        : {})}
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

      <section className="bg-ink py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <SectionHeader
            eyebrow="Our Friends"
            title={
              <>
                Comics in the <span className="italic text-hazard">rotation</span>
              </>
            }
            subtitle={comediansCopy.subhead}
          />
          <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.28em] text-bone/55">
            {comediansCopy.kicker}
          </p>
          <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {comedians.map((c) => (
              <li key={c.name} className="group">
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={c.photo}
                    alt={c.photoAlt || c.name}
                    fill
                    sizes="(min-width: 1024px) 18vw, (min-width: 768px) 22vw, 45vw"
                    {...(getPlaceholder(c.photo)
                      ? { placeholder: "blur" as const, blurDataURL: getPlaceholder(c.photo)! }
                      : {})}
                    className="object-cover [filter:grayscale(1)_contrast(1.05)] transition-[filter] duration-500 group-hover:[filter:grayscale(0)_contrast(1)]"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.45)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-60 transition-opacity duration-500 group-hover:opacity-0"
                  />
                  <div className="absolute inset-x-0 bottom-0 z-10 hidden translate-y-full items-center justify-center gap-4 bg-gradient-to-t from-ink/95 to-transparent px-4 py-4 transition-transform duration-300 group-hover:translate-y-0 group-focus-within:translate-y-0 md:flex">
                    {c.hasEpk && (
                      <Link
                        href={`/roster/${c.slug}`}
                        className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-bone hover:text-slime"
                      >
                        EPK ↗
                      </Link>
                    )}
                    {c.instagram && (
                      <a
                        href={c.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${c.name} on Instagram`}
                        className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-bone hover:text-slime"
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
                        className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-bone hover:text-slime"
                      >
                        FB ↗
                      </a>
                    )}
                  </div>
                </div>
                <h3 className="mt-4 font-display text-xl text-bone md:text-2xl">
                  {c.hasEpk ? (
                    <Link
                      href={`/roster/${c.slug}`}
                      className="transition-colors hover:text-slime"
                    >
                      {c.name}
                    </Link>
                  ) : (
                    c.name
                  )}
                </h3>
                {(c.hasEpk || c.instagram || c.facebook) && (
                  <div className="mt-2 flex gap-4 md:hidden">
                    {c.hasEpk && (
                      <Link
                        href={`/roster/${c.slug}`}
                        className="inline-flex min-h-[44px] items-center font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/70 active:text-hazard"
                      >
                        EPK ↗
                      </Link>
                    )}
                    {c.instagram && (
                      <a
                        href={c.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${c.name} on Instagram`}
                        className="inline-flex min-h-[44px] items-center font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/70 active:text-hazard"
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
                        className="inline-flex min-h-[44px] items-center font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/70 active:text-hazard"
                      >
                        FB ↗
                      </a>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SectionRenderer sections={rosterBottomSections} pageSlug="roster" />
    </>
  );
}
