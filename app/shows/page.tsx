import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Event, Offer } from "schema-dts";
import { featuredSpecial, presale, showsCopy, upcomingShows } from "@/content/shows";
import { site } from "@/content/site";
import { PageHeader } from "@/components/page-header";
import { MailingListCapture } from "@/components/mailing-list-capture";
import { TrackedAnchor } from "@/components/tracked-anchor";
import { AddToCalendar } from "@/components/add-to-calendar";
import { jsonLdString } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Shows",
  description:
    "Live lineups, presales, and ticket drops across Olympia and the South Sound. Plus Xavier Rake's full comedy special.",
  alternates: {
    canonical: "/shows",
    types: {
      "application/rss+xml": "/shows/feed.xml",
      "text/calendar": "/shows/feed.ics",
    },
  },
};

function formatDate(value: string | null) {
  if (!value) return "Date TBD";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string | null) {
  if (!value) return "Time TBD";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ShowsPage() {
  const hasShows = upcomingShows.length > 0;

  const eventsJsonLd: Event[] = upcomingShows.map((show) => {
    const ticketLink = show.ticketUrl ?? show.url ?? site.social.eventbrite;
    const offer: Offer | undefined = show.ticketUrl
      ? {
          "@type": "Offer",
          url: show.ticketUrl,
          availability: "https://schema.org/InStock",
          priceCurrency: "USD",
          ...(show.ticketPrice ? { price: show.ticketPrice } : {}),
        }
      : undefined;

    return {
      "@type": "Event",
      name: show.name,
      description: show.summary,
      startDate: show.start ?? undefined,
      endDate: show.end ?? undefined,
      url: ticketLink,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      isAccessibleForFree: show.status === "free",
      ...(show.imageUrl ? { image: show.imageUrl } : {}),
      location: {
        "@type": "Place",
        name: show.venue?.name ?? "TBD",
        address: {
          "@type": "PostalAddress",
          streetAddress: show.venue?.address,
          addressLocality: show.venue?.city,
          addressRegion: show.venue?.region,
          addressCountry: show.venue?.country ?? "US",
        },
      },
      organizer: {
        "@type": "Organization",
        name: site.name,
        url: site.url,
      },
      ...(offer ? { offers: offer } : {}),
    };
  });

  return (
    <>
      {eventsJsonLd.map((evt, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(evt) }}
        />
      ))}
      <PageHeader
        eyebrow="Tour Diary"
        title={
          <>
            Upcoming <span className="italic text-hazard">Shows</span>
          </>
        }
        body={showsCopy.subhead}
      />

      {presale ? (
        <aside
          aria-label="Active presale"
          className="border-y-2 border-hazard bg-ink"
        >
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-10">
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone">
              Presale code{" "}
              <span className="text-hazard">{presale.code}</span> for{" "}
              {presale.venueName}
            </p>
            <p className="font-body text-[10px] font-medium uppercase tracking-[0.22em] text-bone/65">
              Expires {formatDate(presale.expiresAt)}
            </p>
          </div>
        </aside>
      ) : null}

      {/* Featured: Xavier Rake's full special */}
      <section className="border-b border-bone/10 bg-ink py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
              Featured Production
            </p>
            <Link
              href="/watch"
              className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
            >
              Watch the special ↗
            </Link>
          </div>

          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <div className="relative aspect-video w-full overflow-hidden bg-haze-500">
                <Image
                  src={featuredSpecial.poster}
                  alt={`${featuredSpecial.title} - ${featuredSpecial.subtitle}`}
                  fill
                  sizes="(min-width: 768px) 58vw, 100vw"
                  className="object-cover [filter:grayscale(1)_contrast(1.1)]"
                  priority
                />
                <span
                  aria-hidden
                  className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.4)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-50"
                />
              </div>
            </div>
            <div className="md:col-span-5">
              <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/55">
                {featuredSpecial.subtitle}
              </p>
              <h2 className="heading-display mt-3 text-[clamp(3rem,8vw,6rem)] text-bone">
                {featuredSpecial.title}
                <span className="text-hazard">.</span>
              </h2>
              <p className="mt-6 font-body text-base text-bone/85 md:text-lg">
                {featuredSpecial.blurb}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {featuredSpecial.videoUrl ? (
                  <Link
                    href="/watch"
                    className="inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
                  >
                    Watch now ↗
                  </Link>
                ) : (
                  <span
                    className="inline-flex h-12 items-center border border-bone/30 px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone/65"
                    aria-label="Special not yet available"
                  >
                    Coming soon
                  </span>
                )}
                <TrackedAnchor
                  destination="instagram"
                  href={featuredSpecial.comedianHandle}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center border border-bone/30 px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone hover:border-hazard hover:text-hazard"
                >
                  @jokedeal3r ↗
                </TrackedAnchor>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming list */}
      <section className="border-b border-bone/10 bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="heading-display text-[clamp(2rem,5vw,3.5rem)] text-bone">
              Upcoming dates
            </h2>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              {hasShows ? (
                <a
                  href="/shows/feed.ics"
                  className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
                >
                  Subscribe (.ics) ↗
                </a>
              ) : null}
              <a
                href="/shows/feed.xml"
                className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
              >
                RSS ↗
              </a>
              <TrackedAnchor
                destination="eventbrite"
                href={site.social.eventbrite}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
              >
                View all on Eventbrite ↗
              </TrackedAnchor>
            </div>
          </div>

          {hasShows ? (
            <ul className="divide-y divide-bone/15 border-y border-bone/15">
              {upcomingShows.map((show) => {
                const status = show.status ?? "tba";
                const venueLine = [show.venue?.name, show.venue?.city, show.venue?.region]
                  .filter(Boolean)
                  .join(" / ");
                return (
                  <li
                    key={show.id}
                    className="grid grid-cols-12 items-baseline gap-x-6 gap-y-2 py-7"
                  >
                    <div className="col-span-12 md:col-span-3">
                      <p className="font-display text-2xl text-bone md:text-3xl">
                        {formatDate(show.start)}
                      </p>
                      <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                        {show.doorTime ?? formatTime(show.start)}
                      </p>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <h3 className="font-display text-2xl text-bone md:text-3xl">
                        {show.name}
                      </h3>
                      {venueLine && (
                        <p className="mt-1 font-body text-sm text-bone/85">
                          {venueLine}
                        </p>
                      )}
                      {show.ticketPrice && (
                        <p className="mt-1 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                          {show.ticketPrice}
                        </p>
                      )}
                      {show.summary && (
                        <p className="mt-3 max-w-prose font-body text-sm text-bone/70">
                          {show.summary}
                        </p>
                      )}
                    </div>
                    <div className="col-span-12 flex flex-wrap items-center gap-3 md:col-span-3 md:justify-end">
                      {show.ticketUrl ? (
                        <TrackedAnchor
                          destination="ticketing"
                          href={show.ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-11 items-center bg-hazard px-5 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
                        >
                          Get tickets ↗
                        </TrackedAnchor>
                      ) : (
                        <span className="inline-flex h-11 items-center border border-bone/30 px-5 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone/65">
                          {status === "free"
                            ? "Free / at the door"
                            : "Details soon"}
                        </span>
                      )}
                      {show.start ? (
                        <AddToCalendar
                          showId={show.id}
                          title={show.name}
                          description={show.summary}
                          start={show.start}
                          end={show.end}
                          location={venueLine}
                        />
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="border-y border-bone/15 px-1 py-12 md:py-16">
              <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/45">
                Currently. Empty calendar.
              </p>
              <p className="mt-4 max-w-3xl font-display text-3xl leading-[1.05] text-bone md:text-5xl">
                {showsCopy.emptyState}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <TrackedAnchor
                  destination="eventbrite"
                  href={site.social.eventbrite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center border border-bone/30 px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone hover:border-hazard hover:text-hazard"
                >
                  See all dates on Eventbrite ↗
                </TrackedAnchor>
              </div>
            </div>
          )}
        </div>
      </section>

      <MailingListCapture page="shows" />
    </>
  );
}
