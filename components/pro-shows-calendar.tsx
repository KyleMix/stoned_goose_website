"use client";

// Pro comedy calendar. Big-name touring shows at PNW comedy clubs, synced
// from each club's site by scripts/sync-pro-shows.ts plus manual CMS
// entries. Clicking an event opens the club's ticket page. The club filter
// row renders each club's logo when one is uploaded in /admin, falling back
// to the club name until then.
//
// Display rules: a comedian's multiple showtimes on the same night collapse
// into one entry (earliest time, "x2" badge) so the grid reads as one show
// per name. Month cells show just the comedian; the list view adds the club.

import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import type {
  EventClickArg,
  EventContentArg,
  EventInput,
} from "@fullcalendar/core";
import Image from "next/image";
import { proClubs, proShows, getClub } from "@/content/pro-shows";
import { track } from "@/lib/analytics";

type GroupedShow = {
  id: string;
  title: string;
  clubName: string;
  start: string;
  url: string;
  featured: boolean;
  showCount: number;
};

// Exported for verification scripts.
export function groupShows(clubFilter: string): GroupedShow[] {
  const groups = new Map<string, GroupedShow>();
  for (const s of proShows) {
    if (clubFilter !== "all" && s.clubSlug !== clubFilter) continue;
    const club = getClub(s.clubSlug);
    const day = s.start.slice(0, 10);
    const key = `${s.clubSlug}|${day}|${s.title.toLowerCase()}`;
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, {
        id: s.id,
        title: s.title,
        clubName: club?.name ?? "",
        start: s.start,
        url: s.url || club?.eventsUrl || "",
        featured: s.featured === true,
        showCount: 1,
      });
    } else {
      existing.showCount += 1;
      if (s.start < existing.start) {
        existing.start = s.start;
        existing.url = s.url || existing.url;
      }
      existing.featured = existing.featured || s.featured === true;
    }
  }
  return [...groups.values()];
}

function renderEvent(arg: EventContentArg) {
  const isList = arg.view.type.startsWith("list");
  const club = String(arg.event.extendedProps.clubName ?? "");
  const count = Number(arg.event.extendedProps.showCount ?? 1);
  return (
    <div className="sgp-event-inner">
      {!isList && arg.timeText ? (
        <span className="sgp-event-time">{arg.timeText}</span>
      ) : null}
      <span className="sgp-event-title">
        {arg.event.title}
        {count > 1 ? <span className="sgp-event-count"> x{count}</span> : null}
      </span>
      {isList && club ? <span className="sgp-event-club">{club}</span> : null}
    </div>
  );
}

export function ProShowsCalendar() {
  const [clubFilter, setClubFilter] = useState<string>("all");
  const calendarRef = useRef<FullCalendar>(null);

  // Month grids are cramped on phones; flip those to the list view once
  // mounted (initialView is fixed at mount, so this goes through the API).
  useEffect(() => {
    if (window.innerWidth < 768) {
      calendarRef.current?.getApi().changeView("listMonth");
    }
  }, []);

  const events = useMemo<EventInput[]>(
    () =>
      groupShows(clubFilter).map((g) => ({
        id: g.id,
        title: g.title,
        start: g.start,
        url: g.url,
        classNames: [g.featured ? "sgp-event-show" : "sgp-event-mic"],
        extendedProps: { clubName: g.clubName, showCount: g.showCount },
      })),
    [clubFilter],
  );

  function handleEventClick(arg: EventClickArg) {
    arg.jsEvent.preventDefault();
    if (!arg.event.url) return;
    track("Pro Show Ticket Click", { show: arg.event.title });
    window.open(arg.event.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <div
        role="group"
        aria-label="Filter by comedy club"
        className="flex flex-wrap items-stretch gap-3"
      >
        <button
          type="button"
          aria-pressed={clubFilter === "all"}
          onClick={() => setClubFilter("all")}
          className={`flex h-16 items-center border px-5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
            clubFilter === "all"
              ? "border-hazard bg-hazard text-ink"
              : "border-bone/25 text-bone/70 hover:border-slime hover:text-slime"
          }`}
        >
          All clubs
        </button>
        {proClubs.map((club) => {
          const selected = clubFilter === club.slug;
          return (
            <button
              key={club.slug}
              type="button"
              aria-pressed={selected}
              aria-label={`Show only ${club.name}`}
              onClick={() => setClubFilter(selected ? "all" : club.slug)}
              className={`flex h-16 items-center border px-5 transition-colors ${
                selected
                  ? "border-hazard bg-bone/[0.06]"
                  : "border-bone/25 hover:border-slime"
              }`}
            >
              {club.logo ? (
                <Image
                  src={club.logo}
                  alt={club.name}
                  width={140}
                  height={40}
                  className="max-h-10 w-auto object-contain"
                />
              ) : (
                <span
                  className={`font-body text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    selected ? "text-hazard" : "text-bone/70"
                  }`}
                >
                  {club.name}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="comedy-calendar mt-8">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,listMonth",
          }}
          buttonText={{ today: "Today", month: "Month", list: "List" }}
          events={events}
          eventClick={handleEventClick}
          eventContent={renderEvent}
          eventDisplay="block"
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            omitZeroMinute: true,
            meridiem: "short",
          }}
          dayMaxEventRows={4}
          fixedWeekCount={false}
          height="auto"
          firstDay={1}
        />
      </div>

      {proShows.some((s) => s.featured) ? (
        <p className="mt-6 flex items-center gap-2 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65">
          <span aria-hidden className="h-3 w-3 bg-hazard" />
          Spotlight shows
        </p>
      ) : null}

      {proShows.length === 0 ? (
        <p className="mt-6 font-body text-sm text-bone/65">
          No synced shows yet. The calendar fills in automatically once the
          club feeds run.
        </p>
      ) : null}
    </div>
  );
}
