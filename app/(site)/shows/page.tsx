import type { Metadata } from "next";
import Link from "next/link";
import {
  presale,
  showsCopy,
  upcomingShows,
  showsTopSections,
  showsBottomSections,
} from "@/content/shows";
import { site } from "@/content/site";
import { PageHeader } from "@/components/page-header";
import { MailingListCapture } from "@/components/mailing-list-capture";
import { SectionRenderer } from "@/components/section-renderer";
import { TrackedAnchor } from "@/components/tracked-anchor";
import { AddToCalendar } from "@/components/add-to-calendar";
import { ShareButton } from "@/components/share-button";
import { FacebookPagePlugin } from "@/components/facebook-page-plugin";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs, buildShowsItemList } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Shows",
  description:
    "Live lineups, presales, and ticket drops across Olympia and the South Sound.",
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

  // Emit one ItemList of ComedyEvents only when shows exist. No empty ItemList:
  // when the calendar is bare, the page renders only the root Organization.
  const showsItemList = hasShows ? buildShowsItemList(upcomingShows) : null;

  return (
    <>
      <JsonLd schema={buildBreadcrumbs("/shows")} />
      {showsItemList ? <JsonLd schema={showsItemList} /> : null}
      <PageHeader
        eyebrow="Tour Diary"
        title={
          <>
            Upcoming <span className="text-accent-gold">Shows</span>
          </>
        }
        body={showsCopy.subhead}
      />

      <SectionRenderer sections={showsTopSections} pageSlug="shows" />

      {presale ? (
        <aside
          aria-label="Active presale"
          className="border-y-2 border-accent-gold bg-surface-tuxedo"
        >
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-10">
            <p className="t-eyebrow text-surface-ivory">
              Presale code{" "}
              <span className="text-accent-gold">{presale.code}</span> for{""}
              {presale.venueName}
            </p>
            <p className="t-eyebrow text-smoke">
              Expires {formatDate(presale.expiresAt)}
            </p>
          </div>
        </aside>
      ) : null}

      {/* Upcoming list */}
      <section className="section-y border-b border-smoke bg-surface-tuxedo">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="display-2 text-surface-ivory">
              Upcoming dates
            </h2>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              {hasShows ? (
                <a
                  href="/shows/feed.ics"
                  className="t-eyebrow text-smoke hover:text-accent-gold"
                >
                  Subscribe (.ics) ↗
                </a>
              ) : null}
              <a
                href="/shows/feed.xml"
                className="t-eyebrow text-smoke hover:text-accent-gold"
              >
                RSS ↗
              </a>
              <TrackedAnchor
                destination="eventbrite"
                href={site.social.eventbrite}
                target="_blank"
                rel="noopener noreferrer"
                className="t-eyebrow text-smoke hover:text-accent-gold"
              >
                View all on Eventbrite ↗
              </TrackedAnchor>
            </div>
          </div>

          {hasShows ? (
            <ul className="divide-y divide-smoke border-y border-smoke">
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
                      <p className="t-subhead text-2xl md:text-3xl">
                        {formatDate(show.start)}
                      </p>
                      <p className="t-eyebrow text-smoke">
                        {show.doorTime ?? formatTime(show.start)}
                      </p>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <h3 className="t-subhead text-2xl md:text-3xl">
                        {show.name}
                      </h3>
                      {venueLine && (
                        <p className="t-body mt-1 text-sm">
                          {venueLine}
                        </p>
                      )}
                      {show.ticketPrice && (
                        <p className="mt-1 t-eyebrow">
                          {show.ticketPrice}
                        </p>
                      )}
                      {show.summary && (
                        <p className="t-body mt-3 max-w-prose text-sm text-smoke">
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
                          className="inline-flex h-11 items-center bg-accent-gold px-5 t-eyebrow text-surface-tuxedo hover:bg-surface-ivory"
                        >
                          Get tickets ↗
                        </TrackedAnchor>
                      ) : (
                        <span className="inline-flex h-11 items-center border border-smoke px-5 t-eyebrow text-smoke">
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
                      <ShareButton
                        title={show.name}
                        text={show.summary}
                        url={`${site.url}/shows#${show.id}`}
                        surface="show"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="border-y border-smoke px-1 py-12 md:py-16">
              <p className="t-eyebrow text-smoke">
                Currently. Empty calendar.
              </p>
              <p className="mt-4 max-w-3xl t-subhead text-3xl leading-[1.05] md:text-5xl">
                {showsCopy.emptyState}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <TrackedAnchor
                  destination="eventbrite"
                  href={site.social.eventbrite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center bg-accent-gold px-6 t-eyebrow text-surface-tuxedo hover:bg-surface-ivory"
                >
                  See all dates on Eventbrite ↗
                </TrackedAnchor>
                <a
                  href="#mailing-list"
                  className="t-eyebrow text-smoke underline underline-offset-4 hover:text-accent-gold"
                >
                  Get the announcement first
                </a>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-smoke pt-6">
                <p className="t-eyebrow text-smoke">
                  While you wait
                </p>
                <Link
                  href="/watch"
                  className="t-eyebrow text-smoke underline-offset-4 hover:text-accent-gold hover:underline"
                >
                  Watch the last one ↗
                </Link>
                <Link
                  href="/roster"
                  className="t-eyebrow text-smoke underline-offset-4 hover:text-accent-gold hover:underline"
                >
                  Meet the roster ↗
                </Link>
                <Link
                  href="/open-mics/map"
                  className="t-eyebrow text-smoke underline-offset-4 hover:text-accent-gold hover:underline"
                >
                  Hit an open mic ↗
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {hasShows ? (
        <section
          aria-label="Subscribe to shows calendar"
          className="section-y-tight border-b border-smoke bg-surface-tuxedo"
        >
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <div className="grid gap-8 md:grid-cols-12 md:items-end">
              <div className="md:col-span-7">
                <p className="t-eyebrow">
                  Subscribe
                </p>
                <h2 className="display-2 mt-3 text-surface-ivory">
                  Drop the dates straight into your <span className="text-accent-gold">calendar</span>.
                </h2>
                <p className="t-body mt-4 max-w-xl text-base md:text-lg">
                  Subscribe once and new shows arrive in Apple Calendar, Google Calendar, or anything that reads .ics. No emails, no reminders we did not write.
                </p>
              </div>
              <ul className="md:col-span-5 flex flex-wrap items-center gap-3 md:justify-end">
                <li>
                  <a
                    href="/shows/feed.ics"
                    className="inline-flex h-12 items-center bg-accent-gold px-6 t-eyebrow text-surface-tuxedo hover:bg-surface-ivory"
                  >
                    Add .ics feed ↗
                  </a>
                </li>
                <li>
                  <a
                    href="/shows/feed.xml"
                    className="inline-flex h-12 items-center border border-smoke px-6 t-eyebrow text-surface-ivory hover:border-accent-gold hover:text-accent-gold"
                  >
                    RSS ↗
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <FacebookPagePlugin />

      <SectionRenderer sections={showsBottomSections} pageSlug="shows" />

      <MailingListCapture page="shows" id="mailing-list" />
    </>
  );
}
