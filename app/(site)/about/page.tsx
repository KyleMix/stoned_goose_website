import type { Metadata } from "next";
import Link from "next/link";
import type { Person } from "schema-dts";
import {
  aboutCopy,
  members,
  rosterTopSections,
  rosterBottomSections,
} from "@/content/members";
import { comedians, comediansCopy } from "@/content/comedians";
import { site } from "@/content/site";
import { PageHeader } from "@/components/page-header";
import { SectionRenderer } from "@/components/section-renderer";
import { SectionHeader } from "@/components/section-header";
import { CrewGrid } from "@/components/crew-grid";
import { ComicsGrid } from "@/components/comics-grid";
import { Surface } from "@/components/brand/surface";
import { jsonLdString } from "@/lib/jsonld";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs } from "@/lib/schema";

export const metadata: Metadata = {
  title: "About",
  description:
    "Stoned Goose Productions is a five-person comedy production company in Olympia, Washington. Meet the crew and the comics we book across the South Sound.",
  alternates: {
    canonical: "/about",
  },
};

// Was /roster. The page has always been an about page: it carried the company
// description, the crew and the comics. "Roster" is comedy-industry language,
// and the people this site needs to reach are not in the comedy industry. The
// old URL 308s here.
//
// The "Four Pillars" section is gone. Production & Ops, Media Team, Community
// & Partners and Creative Lab described four departments that a five-person
// company does not have. One honest sentence replaced them.
export default function AboutPage() {
  const personJsonLd: Person[] = members.map((m) => ({
    "@type": "Person",
    name: m.name,
    jobTitle: m.role,
    ...(m.bio ? { description: m.bio } : {}),
    image: `${site.url}${m.photo}`,
    worksFor: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    url: `${site.url}/about`,
  }));

  const story = aboutCopy.story.split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <JsonLd schema={buildBreadcrumbs("/about")} />
      {personJsonLd.map((p, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(p) }}
        />
      ))}

      <PageHeader
        eyebrow="About us"
        title={
          <>
            About<span className="text-accent-gold">.</span>
          </>
        }
        body={aboutCopy.subhead}
      />

      <SectionRenderer sections={rosterTopSections} pageSlug="about" />

      {story.length > 0 ? (
        <section
          aria-label="Company"
          className="section-y border-b border-smoke bg-surface-tuxedo"
        >
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <div className="max-w-col space-y-5">
              {story.map((p, i) => (
                <p
                  key={i}
                  className="t-body text-base leading-relaxed md:text-lg"
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Surface
        tone="ivory"
        as="section"
        aria-labelledby="about-crew"
        className="section-y border-b border-smoke"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <SectionHeader
            eyebrow={aboutCopy.crewSubhead}
            title={aboutCopy.crewHeading}
            subtitle={aboutCopy.oneLine}
            tone="light"
          />
          <div className="mt-12">
            <CrewGrid members={members} priorityCount={5} />
          </div>
        </div>
      </Surface>

      <section
        aria-labelledby="about-comics"
        className="section-y border-b border-smoke bg-surface-tuxedo"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <SectionHeader
            eyebrow="Our friends"
            title={
              <>
                Comics we have{" "}
                <span className="text-accent-gold">booked</span>
              </>
            }
            subtitle={comediansCopy.subhead}
          />
          <div className="mt-12">
            <ComicsGrid comedians={comedians} />
          </div>
          {comediansCopy.kicker ? (
            <p className="mt-10 t-fine">{comediansCopy.kicker}</p>
          ) : null}
        </div>
      </section>

      {/* The page ends on the ask, same as every other page. */}
      <Surface tone="ivory" as="section" className="section-y">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-6 border border-smoke p-8 md:p-10">
            <p className="t-subhead text-2xl md:text-3xl">
              Want these people at your event?
            </p>
            <Link
              href="/#contact"
              className="inline-flex h-12 shrink-0 items-center bg-accent-gold px-6 t-ui text-surface-tuxedo transition-colors hover:bg-surface-ivory"
            >
              Book us <span aria-hidden className="ml-2">&#8599;</span>
            </Link>
          </div>
        </div>
      </Surface>

      <SectionRenderer sections={rosterBottomSections} pageSlug="about" />
    </>
  );
}
