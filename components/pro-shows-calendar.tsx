"use client";

// Pro comedy calendar. Big-name touring shows at PNW comedy clubs, synced
// from each club's site by scripts/sync-pro-shows.ts plus manual CMS
// entries. Clicking an event opens the club's ticket page. The club filter
// row renders each club's logo when one is uploaded in /admin, falling back
// to the club name until then.

import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import Image from "next/image";
import { proClubs, proShows, getClub } from "@/content/pro-shows";
import { track } from "@/lib/analytics";

export function ProShowsCalendar() {
  const [clubFilter, setClubFilter] = useState<string>("all");

  const events = useMemo<EventInput[]>(
    () =>
      proShows
        .filter((s) => clubFilter === "all" || s.clubSlug === clubFilter)
        .map((s) => {
          const club = getClub(s.clubSlug);
          return {
            id: s.id,
            title: club ? `${s.title} · ${club.name}` : s.title,
            start: s.start,
            url: s.url || club?.eventsUrl || "",
            classNames: ["sgp-event-show"],
          };
        }),
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
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            omitZeroMinute: true,
            meridiem: "short",
          }}
          dayMaxEventRows={4}
          height="auto"
          firstDay={1}
        />
      </div>

      {proShows.length === 0 ? (
        <p className="mt-6 font-body text-sm text-bone/65">
          No synced shows yet. The calendar fills in automatically once the
          club feeds run.
        </p>
      ) : null}
    </div>
  );
}
