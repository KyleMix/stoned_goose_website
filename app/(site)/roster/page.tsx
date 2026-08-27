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
            Roster<span className="text-accent-gold">.</span>
          </>
        }
        body={aboutCopy.subhead}
      />

      <SectionRenderer sections={rosterTopSections} pageSlug="roster" />

      <section className="relative border-b border-smoke bg-surface-tuxedo py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <SectionHeader
            eyebrow="The Operation"
            title={
              <>
                Four <span className="text-accent-gold">pillars</span>
              </>
            }
            subtitle="The four functions the crew is organized around."
          />
          <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-smoke md:grid-cols-2">
            {pillars.map((p, i) => (
              <li
                key={p.title}
                className="relative bg-surface-tuxedo p-8 transition-colors hover:bg-surface-ivory/[0.025] md:p-10"
              >
                <span className="t-eyebrow text-smoke">
                  /0{i + 1}
                </span>
                <h3 className="t-headline mt-3 text-3xl md:text-4xl">
                  {p.title}
                </h3>
                <p className="t-body mt-4 max-w-md text-sm md:text-base">
                  {p.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        data-surface="ivory"
        className="relative border-b border-smoke bg-surface-ivory py-20 text-surface-tuxedo md:py-28"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <SectionHeader
            eyebrow={aboutCopy.crewSubhead}
            title={
              <>
                The <span className="">Crew</span>
              </>
            }
            tone="light"
          />

          <ul className="mt-16 divide-y divide-smoke">
            {members.map((m, i) => (
              <li
                key={m.slug}
                className="group grid grid-cols-12 items-center gap-6 py-8 md:gap-10 md:py-12"
              >
                <span className="col-span-2 t-eyebrow text-smoke md:col-span-1">
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
                  </div>
                </div>
                <div className="col-span-12 md:col-span-8">
                  <h3 className="t-headline display-1 text-surface-tuxedo">
                    {m.name}
                  </h3>
                  <p className="mt-2 t-eyebrow text-smoke">
                    {m.role}
                  </p>
                  {m.bio ? (
                    <>
                      <span
                        aria-hidden
                        className="mt-5 block h-px max-w-[80px] bg-smoke"
                      />
                      <p className="t-body mt-5 max-w-prose text-base leading-relaxed text-surface-tuxedo md:text-lg">
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

      <section className="bg-surface-tuxedo py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <SectionHeader
            eyebrow="Our Friends"
            title={
              <>
                Comics in the <span className="text-accent-gold">rotation</span>
              </>
            }
            subtitle={comediansCopy.subhead}
          />
          <p className="mt-10 t-eyebrow text-smoke">
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
                  <div className="absolute inset-x-0 bottom-0 z-10 hidden translate-y-full items-center justify-center gap-4 bg-surface-tuxedo px-4 py-4 transition-transform duration-300 group-hover:translate-y-0 group-focus-within:translate-y-0 md:flex">
                    {c.hasEpk && (
                      <Link
                        href={`/roster/${c.slug}`}
                        className="t-eyebrow text-surface-ivory hover:text-accent-gold"
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
                        className="t-eyebrow text-surface-ivory hover:text-accent-gold"
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
                        className="t-eyebrow text-surface-ivory hover:text-accent-gold"
                      >
                        FB ↗
                      </a>
                    )}
                  </div>
                </div>
                <h3 className="mt-4 t-subhead text-xl md:text-2xl">
                  {c.hasEpk ? (
                    <Link
                      href={`/roster/${c.slug}`}
                      className="transition-colors hover:text-accent-gold"
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
                        className="inline-flex min-h-[44px] items-center t-eyebrow text-smoke active:text-accent-gold"
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
                        className="inline-flex min-h-[44px] items-center t-eyebrow text-smoke active:text-accent-gold"
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
                        className="inline-flex min-h-[44px] items-center t-eyebrow text-smoke active:text-accent-gold"
                      >
                        FB ↗
                      </a>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-smoke pt-8">
            <p className="t-eyebrow text-smoke">
              Catch them live
            </p>
            <Link
              href="/shows"
              className="inline-flex h-11 items-center bg-accent-gold px-5 t-eyebrow text-surface-tuxedo hover:bg-surface-ivory"
            >
              See upcoming shows ↗
            </Link>
            <Link
              href="/watch"
              className="t-eyebrow text-smoke underline-offset-4 hover:text-accent-gold hover:underline"
            >
              Or watch the tape ↗
            </Link>
          </div>
        </div>
      </section>

      <SectionRenderer sections={rosterBottomSections} pageSlug="roster" />
    </>
  );
}
