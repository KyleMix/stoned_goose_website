import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Person } from "schema-dts";
import { epkComedians, getComedian } from "@/content/comedians";
import { site } from "@/content/site";
import { jsonLdString } from "@/lib/jsonld";
import { getPlaceholder } from "@/lib/placeholders";
import { extractYouTubeId } from "@/lib/youtube";

type Params = { slug: string };

export const dynamicParams = false;

// EPK pages only exist for comedians with real content (a bio or a reel),
// filled in from /admin. With none yet, export a noindex sentinel so the
// static export always has at least one path for this route.
export function generateStaticParams(): Params[] {
  const params = epkComedians.map((c) => ({ slug: c.slug }));
  return params.length > 0 ? params : [{ slug: "__no-epk" }];
}

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const comedian = getComedian(slug);
  if (!comedian)
    return { title: "Not found", robots: { index: false, follow: false } };
  return {
    title: comedian.name,
    description:
      comedian.bio?.slice(0, 160) ||
      `${comedian.name}, stand-up comedian in the Stoned Goose Productions rotation.`,
    alternates: { canonical: `/roster/${comedian.slug}` },
  };
}

export default async function ComedianPage(props: {
  params: Promise<Params>;
}) {
  const { slug } = await props.params;
  const comedian = getComedian(slug);
  if (!comedian) notFound();

  const reelId = comedian.reelUrl ? extractYouTubeId(comedian.reelUrl) : null;
  const bioParagraphs = (comedian.bio ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const personJsonLd: Person = {
    "@type": "Person",
    name: comedian.name,
    description: comedian.bio,
    image: `${site.url}${comedian.photo}`,
    url: `${site.url}/roster/${comedian.slug}`,
    sameAs: [comedian.instagram, comedian.facebook].filter(
      (x): x is string => Boolean(x),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(personJsonLd) }}
      />

      <section className="border-b border-bone/10 bg-ink pb-16 pt-32 md:pb-20 md:pt-40">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <Link
            href="/roster"
            className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55 hover:text-slime"
          >
            ← The Roster
          </Link>

          <div className="mt-10 grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={comedian.photo}
                  alt={comedian.photoAlt || comedian.name}
                  fill
                  priority
                  sizes="(min-width: 768px) 30vw, 90vw"
                  {...(getPlaceholder(comedian.photo)
                    ? {
                        placeholder: "blur" as const,
                        blurDataURL: getPlaceholder(comedian.photo)!,
                      }
                    : {})}
                  className="object-cover [filter:grayscale(1)_contrast(1.05)]"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.45)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-60"
                />
              </div>
            </div>

            <div className="md:col-span-8">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                The Roster
              </p>
              <h1 className="heading-display mt-4 text-[clamp(2.4rem,7vw,5rem)] text-bone">
                {comedian.name}
                <span className="text-hazard">.</span>
              </h1>

              {(comedian.instagram || comedian.facebook) && (
                <div className="mt-6 flex gap-6">
                  {comedian.instagram && (
                    <a
                      href={comedian.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/70 hover:text-slime"
                    >
                      Instagram ↗
                    </a>
                  )}
                  {comedian.facebook && (
                    <a
                      href={comedian.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/70 hover:text-slime"
                    >
                      Facebook ↗
                    </a>
                  )}
                </div>
              )}

              {bioParagraphs.length > 0 && (
                <div className="mt-8 max-w-col space-y-5">
                  {bioParagraphs.map((p, i) => (
                    <p
                      key={i}
                      className="font-body text-base leading-relaxed text-bone/85 md:text-lg"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              )}

              {comedian.credits && comedian.credits.length > 0 && (
                <div className="mt-10">
                  <h2 className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                    Credits
                  </h2>
                  <ul className="mt-4 space-y-2">
                    {comedian.credits.map((credit) => (
                      <li
                        key={credit}
                        className="flex items-baseline gap-3 font-body text-sm text-bone/85"
                      >
                        <span aria-hidden className="text-hazard">/</span>
                        <span>{credit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {reelId && (
        <section className="border-b border-bone/10 bg-ink py-16 md:py-20">
          <div className="mx-auto max-w-[1100px] px-5 md:px-10">
            <h2 className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
              The reel
            </h2>
            <div className="relative mt-6 aspect-video w-full overflow-hidden bg-haze-500">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${reelId}`}
                title={`${comedian.name} reel`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </section>
      )}

      <section className="bg-ink py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-6 border border-bone/15 p-8 md:p-10">
            <p className="max-w-xl font-body text-base text-bone/85 md:text-lg">
              Want {comedian.name} on your lineup? Book the intro call and
              tell us about the room.
            </p>
            <Link
              href="/book"
              className="inline-flex h-12 shrink-0 items-center bg-hazard px-6 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-ink hover:bg-slime"
            >
              Book a show ↗
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
