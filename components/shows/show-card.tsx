import { Fragment } from "react";
import type { Show } from "@/content/shows";
import Link from "next/link";
import { showAnchor, showPath } from "@/content/shows";
import { site } from "@/content/site";
import { ShowInfoBlock } from "@/components/brand/show-info-block";
import { TrackedAnchor } from "@/components/tracked-anchor";
import { AddToCalendar } from "@/components/add-to-calendar";
import { ShareButton } from "@/components/share-button";
import { formatShowDateLong, formatShowTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { ShowPicture } from "./show-picture";
import { FlyerLightbox } from "./flyer-lightbox";
import { BioToggle } from "./bio-toggle";

// ---------------------------------------------------------------- copy

/** The name on the card: the headliner, or the event title for anything else. */
export function cardTitle(show: Show) {
  return show.performer?.name ?? show.name;
}

/**
 * The credits as eyebrow type. Each credit is kept whole and the separator
 * rides on the credit before it, so a wrap never strands a "·" or splits
 * "Abbott Elementary" across lines.
 */
export function Credits({ show, className }: { show: Show; className?: string }) {
  const p = show.performer;
  if (!p || p.credits.length === 0) return null;
  return (
    <p className={cn("t-eyebrow text-balance", className)}>
      {p.creditsLabel ? <>{p.creditsLabel}: </> : null}
      {p.credits.map((c, i) => (
        <Fragment key={c}>
          <span className="whitespace-nowrap">
            {c}
            {i < p.credits.length - 1 ? " ·" : ""}
          </span>
          {/* The space between credits is the only place a line may break. */}
          {i < p.credits.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </p>
  );
}

export function headshotAlt(show: Show) {
  const date = formatShowDateLong(show.start);
  const name = cardTitle(show);
  return date
    ? `${name}, headlining Stoned Goose Productions on ${date}`
    : `${name}, headlining Stoned Goose Productions`;
}

function venueText(show: Show) {
  return [show.venue?.name, show.venue?.city, show.venue?.region].filter(Boolean).join(", ");
}

export function flyerAlt(show: Show) {
  const time = formatShowTime(show.start);
  const times = [
    show.doorTime ? `doors ${show.doorTime}` : null,
    time ? `show ${time}` : null,
  ]
    .filter(Boolean)
    .join(", ");
  return [
    `Show flyer for ${cardTitle(show)}`,
    formatShowDateLong(show.start),
    venueText(show),
    times,
  ]
    .filter(Boolean)
    .join(", ");
}

// ---------------------------------------------------------------- actions

/**
 * Get tickets, Add to calendar, Share. A headliner without an Eventbrite event
 * yet gets a disabled "Tickets coming soon" in the ticket slot.
 */
export function ShowActions({ show, align }: { show: Show; align: "center" | "start" }) {
  const anchor = showAnchor(show);
  const title = cardTitle(show);
  const status = show.status ?? "tba";

  const ticket = show.ticketUrl ? (
    <TrackedAnchor
      destination="ticketing"
      href={show.ticketUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-12 items-center justify-center bg-accent-gold px-6 t-ui text-surface-tuxedo hover:bg-surface-ivory"
    >
      Get tickets ↗
    </TrackedAnchor>
  ) : (
    <button
      type="button"
      disabled
      className="inline-flex h-12 cursor-not-allowed items-center justify-center border border-smoke px-6 t-ui text-smoke"
    >
      {show.performer
        ? "Tickets coming soon"
        : status === "free"
          ? "Free / at the door"
          : "Details soon"}
    </button>
  );

  return (
    <div className={cn("flex flex-col gap-3", align === "start" && "sm:flex-row sm:flex-wrap")}>
      {ticket}
      <div className={cn("flex flex-wrap gap-3", align === "center" && "justify-center")}>
        {show.start ? (
          <AddToCalendar
            showId={show.id}
            title={show.name}
            description={show.summary}
            start={show.start}
            end={show.end}
            location={venueText(show)}
            menuAlign="start"
          />
        ) : null}
        <ShareButton
          title={title}
          text={show.summary}
          url={`${site.url}${showPath(show)}`}
          surface="show"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- card

/**
 * One show on /shows, set like the flyers. Top to bottom: arch headshot, name,
 * credits, then <ShowInfoBlock layout="marquee" /> (date, venue, doors and
 * show, price, ticket link, in that fixed order), the flyer, and the bio.
 *
 * A show with no headliner attached keeps the same frame with no photo: the
 * event title, the info block, and its Eventbrite description.
 */
export function ShowCard({ show }: { show: Show }) {
  const p = show.performer;
  const anchor = showAnchor(show);

  return (
    <article
      id={anchor}
      aria-labelledby={`${anchor}-name`}
      className="flex h-full flex-col border border-smoke px-4 py-7 text-center md:px-7"
    >
      {p?.images.arch ? (
        <ShowPicture
          src={p.images.arch}
          alt={headshotAlt(show)}
          sizes="300px"
          className="mx-auto w-full max-w-[300px]"
        />
      ) : null}

      <h3
        id={`${anchor}-name`}
        className={cn(
          "t-subhead text-balance",
          p ? "text-2xl md:text-3xl" : "text-xl md:text-2xl",
          p?.images.arch && "mt-6",
        )}
      >
        {p ? (
          <Link href={showPath(show)} className="hover:text-accent-gold">
            {cardTitle(show)}
          </Link>
        ) : (
          cardTitle(show)
        )}
      </h3>
      <Credits show={show} className="mt-3" />

      <ShowInfoBlock
        show={show}
        layout="marquee"
        className="mt-6"
        ticketAction={<ShowActions show={show} align="center" />}
      />

      {p?.images.flyer ? (
        <div className="mt-3">
          <FlyerLightbox name={p.name} href={p.images.flyer}>
            <ShowPicture src={p.images.flyer} alt={flyerAlt(show)} sizes="(min-width: 860px) 816px, 100vw" />
          </FlyerLightbox>
        </div>
      ) : null}

      {p?.bio ? (
        <BioToggle bio={p.bio} className="mt-4 border-t border-smoke pt-5 text-left" />
      ) : show.summary ? (
        <p className="t-body mt-6 border-t border-smoke pt-5 text-left text-sm">{show.summary}</p>
      ) : null}
    </article>
  );
}
