import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComedyEvent, WithContext } from "schema-dts";
import { headlinerShows } from "@/content/shows";
import { JsonLd } from "@/components/json-ld";
import { HeadlinerHero, HeadlinerStrip } from "@/components/shows/headliner-hero";
import { buildBreadcrumbs, buildComedyEvent } from "@/lib/schema";
import { formatShowDateLong, formatShowMonthDay } from "@/lib/dates";
import { truncateAtWord } from "@/lib/utils";

// One page per upcoming headliner, so a shared link previews with that
// comic's card. A link like /shows#matt-ross cannot: the fragment never
// reaches a crawler, so every anchor previews as /shows.
//
// The card at /shows/og/<slug>.png is the page's share image. Past shows drop
// out of headlinerShows, so their pages are not built on the next deploy.

type Params = { slug: string };

export const dynamicParams = false;

// The static export needs at least one path. With no headliner booked it
// exports a noindex sentinel, same as the /about/[slug] EPK pages.
const SENTINEL = "__no-headliner";

export function generateStaticParams(): Params[] {
  const params = headlinerShows.map((s) => ({ slug: s.slug! }));
  return params.length > 0 ? params : [{ slug: SENTINEL }];
}

function find(slug: string) {
  return headlinerShows.find((s) => s.slug === slug) ?? null;
}

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await props.params;
  const show = find(slug);
  if (!show?.performer) return { title: "Not found", robots: { index: false, follow: false } };

  const name = show.performer.name;
  const city = show.venue?.city;
  const day = formatShowMonthDay(show.start);
  const title = [name, city ? `Live in ${city}` : null, day].filter(Boolean).join(", ");
  const when = formatShowDateLong(show.start);
  const description = truncateAtWord(
    show.performer.bio ||
      `${name} headlines Stoned Goose Productions${when ? ` on ${when}` : ""}${show.venue?.name ? ` at ${show.venue.name}` : ""}.`,
    155,
  );
  const image = {
    url: `/shows/og/${slug}.png`,
    width: 1200,
    height: 630,
    alt: `${name}, headlining Stoned Goose Productions${when ? ` on ${when}` : ""}`,
  };

  return {
    title,
    description,
    alternates: { canonical: `/shows/${slug}` },
    openGraph: { title, description, url: `/shows/${slug}`, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

export default async function ShowPage(props: { params: Promise<Params> }) {
  const { slug } = await props.params;
  const show = find(slug);
  if (!show?.performer) notFound();

  const event: WithContext<ComedyEvent> = {
    "@context": "https://schema.org",
    ...buildComedyEvent(show),
  };
  const others = headlinerShows.filter((s) => s !== show);

  return (
    <>
      <JsonLd schema={buildBreadcrumbs(`/shows/${slug}`, show.performer.name)} />
      <JsonLd schema={event} />

      <HeadlinerHero
        show={show}
        eyebrow="Stoned Goose Productions presents"
        headingLevel="h1"
      />

      <HeadlinerStrip shows={others} linkTo="page" label="More headliners" />

      <nav aria-label="All shows" className="border-b border-smoke bg-surface-tuxedo">
        <div className="mx-auto max-w-[1400px] px-5 py-8 md:px-10">
          <Link
            href="/shows"
            className="inline-flex min-h-[44px] items-center t-ui underline underline-offset-4 hover:text-accent-gold"
          >
            All upcoming shows
          </Link>
        </div>
      </nav>
    </>
  );
}
