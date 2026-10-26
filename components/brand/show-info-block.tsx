import type { ReactNode } from "react";
import type { Show } from "@/content/shows";
import { cn } from "@/lib/utils";
import { formatShowDate, formatShowDateBand, formatShowTime, showTimeZone } from "@/lib/dates";

/**
 * Show information, in the one order it is ever allowed to appear:
 *
 *   1. date
 *   2. venue
 *   3. doors and show time
 *   4. price
 *   5. ticket link
 *
 * Same order on every poster, card and event page. That is the whole point of
 * the component: the order is not a prop, and there is no way to reorder from
 * a call site. `layout` changes how the rows sit, never their sequence.
 *
 * Formatting comes from lib/dates.ts, pinned to the venue timezone, so a date
 * reads the same on /shows as it does in a card and does not shift with the
 * build machine's clock.
 *
 * Missing fields are skipped rather than filled in. No invented prices or
 * times: a show with no price shows no price row. A price with a `priceNote`
 * ("+ Eventbrite fees") always prints the note with it, in every layout.
 */

/**
 * "Doors 7:00 PM / Show 8:00 PM" when both are known, and whichever one is
 * known otherwise. doorTime is free text in the CMS, so it is passed through
 * as written rather than parsed.
 */
function doorsAndShow(show: Pick<Show, "doorTime" | "start" | "timeZone" | "venue">) {
  const doors = show.doorTime?.trim() || null;
  const showTime = formatShowTime(show.start, showTimeZone(show));
  if (doors && showTime) return `Doors ${doors} / Show ${showTime}`;
  if (doors) return `Doors ${doors}`;
  if (showTime) return `Show ${showTime}`;
  return null;
}

function withNote(price: string, note: string | undefined) {
  const n = note?.trim();
  return n ? `${price} ${n}` : price;
}

function venueLine(show: Pick<Show, "venue">) {
  const parts = [show.venue?.name, show.venue?.city, show.venue?.region].filter(
    Boolean,
  );
  return parts.length ? parts.join(" / ") : null;
}

type Props = {
  show: Show;
  /**
   * "stack" gives one row per field, for posters and event pages.
   * "inline" runs the first four as a single wrapped line, for dense cards.
   * "marquee" is the /shows card, set like the flyers: a gold ruled date band,
   * the venue, then doors, show and tickets as three columns.
   * None of them changes the order.
   */
  layout?: "stack" | "inline" | "marquee";
  /**
   * A weekly room has no single date and no doors time: the Log Cabin mic runs
   * every Monday, show at 7. Formatting a date out of
   * `show.start` there would mean inventing one, and a "next Monday" computed
   * at build time freezes into the HTML and goes stale by the following week.
   *
   * So a recurring room passes the two labels that fill the date and time slots
   * instead. It fills those slots, it does not add or reorder them: the
   * sequence below is still date, venue, doors and show time, price, ticket
   * link. Everything else, venue and price included, still comes off `show`.
   */
  recurring?: { date: string; times: string };
  /** Rendered last, after the price. Pass the ticket CTA. */
  ticketAction?: ReactNode;
  className?: string;
};

export function ShowInfoBlock({
  show,
  layout = "stack",
  recurring,
  ticketAction,
  className,
}: Props) {
  // Built as an ordered list so the sequence is data, not markup that a future
  // edit can quietly shuffle.
  const rows: { key: string; value: string }[] = [];
  const date = recurring ? recurring.date.trim() : formatShowDate(show.start, showTimeZone(show));
  if (date) rows.push({ key: "date", value: date });
  const venue = venueLine(show);
  if (venue) rows.push({ key: "venue", value: venue });
  const times = recurring ? recurring.times.trim() : doorsAndShow(show);
  if (times) rows.push({ key: "times", value: times });
  const price = show.ticketPrice?.trim();
  if (price) rows.push({ key: "price", value: withNote(price, show.priceNote) });

  if (layout === "marquee") {
    return (
      <MarqueeInfo
        show={show}
        recurring={recurring}
        ticketAction={ticketAction}
        className={className}
      />
    );
  }

  const inline = layout === "inline";

  return (
    <div className={cn(inline ? "flex flex-col gap-3" : "space-y-2", className)}>
      <dl className={cn(inline && "flex flex-wrap items-baseline gap-x-3 gap-y-1")}>
        {rows.map((row, i) => (
          <div key={row.key} className={cn(inline && "flex items-baseline gap-3")}>
            <dt className="sr-only">{row.key}</dt>
            <dd className={cn("t-eyebrow", row.key === "date" && "text-accent-gold")}>
              {row.value}
            </dd>
            {inline && i < rows.length - 1 && (
              <span aria-hidden className="t-eyebrow text-smoke">
                /
              </span>
            )}
          </div>
        ))}
      </dl>
      {ticketAction}
    </div>
  );
}

/**
 * The flyer layout. Same sequence as every other layout: date, venue, doors
 * and show time, price, ticket link. Only the setting changes.
 *
 * The date band is gold rules with gold headline type, not a gold fill: the
 * flyers print it on a gold bar, but on this site gold is never a background.
 */
function MarqueeInfo({
  show,
  recurring,
  ticketAction,
  className,
}: Pick<Props, "show" | "recurring" | "ticketAction" | "className">) {
  const tz = showTimeZone(show);
  const date = recurring ? recurring.date.trim() : formatShowDateBand(show.start, tz);
  const venue = [show.venue?.name, show.venue?.city, show.venue?.region]
    .filter(Boolean)
    .join(", ");
  const doors = recurring ? null : show.doorTime?.trim() || null;
  const showTime = recurring ? recurring.times.trim() : formatShowTime(show.start, tz);
  const price = show.ticketPrice?.trim() || null;
  const note = show.priceNote?.trim() || null;

  const columns = [
    doors ? { key: "doors", label: "Doors", value: doors } : null,
    showTime ? { key: "show", label: "Show", value: showTime } : null,
    price ? { key: "price", label: "Tickets", value: price, note } : null,
  ].filter((c): c is { key: string; label: string; value: string; note?: string | null } =>
    Boolean(c),
  );

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <dl className="flex flex-col gap-4">
        {date ? (
          <div className="border-y border-accent-gold py-2.5">
            <dt className="sr-only">Date</dt>
            <dd className="t-headline text-xl md:text-2xl">{date}</dd>
          </div>
        ) : null}
        {venue ? (
          <div>
            <dt className="sr-only">Venue</dt>
            <dd className="t-body text-sm">{venue}</dd>
          </div>
        ) : null}
        {columns.length > 0 ? (
          <div
            className={cn(
              "grid divide-x divide-smoke",
              columns.length === 3 ? "grid-cols-3" : columns.length === 2 ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            {columns.map((c) => (
              <div key={c.key} className="px-3 first:pl-0 last:pr-0">
                <dt className="t-eyebrow">{c.label}</dt>
                <dd className="t-subhead mt-1 text-base md:text-lg">{c.value}</dd>
                {c.note ? <dd className="t-fine mt-0.5">{c.note}</dd> : null}
              </div>
            ))}
          </div>
        ) : null}
      </dl>
      {ticketAction}
    </div>
  );
}
