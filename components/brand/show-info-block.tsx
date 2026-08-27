import type { ReactNode } from "react";
import type { Show } from "@/content/shows";
import { cn } from "@/lib/utils";
import { formatShowDate, formatShowTime } from "@/lib/dates";

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
 * times: a show with no price shows no price row.
 */

/**
 * "Doors 7:00 PM / Show 8:00 PM" when both are known, and whichever one is
 * known otherwise. doorTime is free text in the CMS, so it is passed through
 * as written rather than parsed.
 */
function doorsAndShow(show: Pick<Show, "doorTime" | "start">) {
  const doors = show.doorTime?.trim() || null;
  const showTime = formatShowTime(show.start);
  if (doors && showTime) return `Doors ${doors} / Show ${showTime}`;
  if (doors) return `Doors ${doors}`;
  if (showTime) return `Show ${showTime}`;
  return null;
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
   * Neither changes the order.
   */
  layout?: "stack" | "inline";
  /** Rendered last, after the price. Pass the ticket CTA. */
  ticketAction?: ReactNode;
  className?: string;
};

export function ShowInfoBlock({
  show,
  layout = "stack",
  ticketAction,
  className,
}: Props) {
  // Built as an ordered list so the sequence is data, not markup that a future
  // edit can quietly shuffle.
  const rows: { key: string; value: string }[] = [];
  const date = formatShowDate(show.start);
  if (date) rows.push({ key: "date", value: date });
  const venue = venueLine(show);
  if (venue) rows.push({ key: "venue", value: venue });
  const times = doorsAndShow(show);
  if (times) rows.push({ key: "times", value: times });
  const price = show.ticketPrice?.trim();
  if (price) rows.push({ key: "price", value: price });

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
