// Event flyers shim. A flyer for a show that has no headliner (an open mic,
// a showcase), attached to its Eventbrite event by ID. One entry per flyer
// under content/event-flyers/<slug>/, consolidated at prebuild into
// content/.generated/event-flyers-index.json. Headliners keep their flyer on
// their own entry (content/performers).

import eventFlyersIndex from "./.generated/event-flyers-index.json";

export type EventFlyer = {
  eventbriteId: string;
  src: string;
  alt: string;
};

type Raw = Record<string, unknown>;

const text = (v: unknown): string | null =>
  typeof v === "string" && v.trim().length > 0 ? v.trim() : null;

export const eventFlyers: EventFlyer[] = (eventFlyersIndex as Raw[])
  .filter((f) => f.draft !== true)
  .flatMap((f) => {
    const eventbriteId = text(f.eventbriteId);
    const raw = text(f.flyer);
    if (!eventbriteId || !raw) return [];
    const src = raw.startsWith("/") ? raw : `/shows/uploads/${raw}`;
    const title = text(f.title) ?? "Show";
    return [{ eventbriteId, src, alt: text(f.flyerAlt) ?? `Show flyer for ${title}` }];
  });
