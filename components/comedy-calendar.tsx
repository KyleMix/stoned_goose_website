"use client";

// Interactive comedy calendar. Merges the Open Mic Explorer dataset with
// upcoming Stoned Goose shows into one FullCalendar grid. Open mics recur
// client-side from their day + frequency + weeks-of-month data; shows are
// dated one-offs. Everything renders from JSON already committed to the
// repo, so the page stays static-export friendly.
//
// CURRENTLY UNMOUNTED. The /calendar route was unpublished by owner
// request but this component, its FullCalendar deps, and the
// .comedy-calendar theming in globals.css are kept for future use.
// To republish: recreate app/(site)/calendar/ (page + opengraph-image,
// see git history at c4c3d13) and re-add the nav, footer, and sitemap
// entries.

import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import {
  openMicsFeed,
  type OpenMic,
  type OpenMicDay,
  type OpenMicWeek,
} from "@/content/open-mics";
import { upcomingShows } from "@/content/shows";
import { track } from "@/lib/analytics";

const DAY_INDEX: Record<OpenMicDay, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const FREQUENCY_SUFFIX: Record<OpenMic["frequency"], string> = {
  weekly: "",
  biweekly: " (every other week)",
  monthly: " (monthly)",
};

// First time-looking token wins: "8pm", "7:30pm", "Sign-up/Start: 8pm/8:30pm".
// Strings like "TBD" or a bare "1" fall through to an untimed entry.
// Exported for verification scripts.
export function parseTime(
  time: string,
): { hours: number; minutes: number } | null {
  const match = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i.exec(time);
  if (!match) return null;
  let hours = parseInt(match[1], 10) % 12;
  if (/pm/i.test(match[3])) hours += 12;
  return { hours, minutes: match[2] ? parseInt(match[2], 10) : 0 };
}

function weekOrdinals(date: Date): OpenMicWeek[] {
  const ordinals: OpenMicWeek[] = [];
  const ordinal = Math.floor((date.getDate() - 1) / 7);
  const labels: OpenMicWeek[] = ["1st", "2nd", "3rd", "4th"];
  if (ordinal < labels.length) ordinals.push(labels[ordinal]);
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();
  if (date.getDate() + 7 > daysInMonth) ordinals.push("Last");
  return ordinals;
}

function micOccursOn(mic: OpenMic, date: Date): boolean {
  if (DAY_INDEX[mic.day] !== date.getDay()) return false;
  if (mic.frequency === "weekly") return true;
  // Biweekly and monthly mics with explicit weeks-of-month get exact
  // placement. Without them there is no anchor to count from, so we show
  // every matching weekday and say so in the title.
  if (!mic.weeks || mic.weeks.length === 0) return true;
  const ordinals = weekOrdinals(date);
  return mic.weeks.some((w) => ordinals.includes(w));
}

export function micEventsForRange(
  mics: OpenMic[],
  rangeStart: Date,
  rangeEnd: Date,
): EventInput[] {
  const events: EventInput[] = [];
  const cursor = new Date(rangeStart);
  cursor.setHours(0, 0, 0, 0);
  while (cursor < rangeEnd) {
    for (const mic of mics) {
      if (!micOccursOn(mic, cursor)) continue;
      const time = parseTime(mic.time);
      const inexact =
        mic.frequency !== "weekly" && (!mic.weeks || mic.weeks.length === 0);
      const title = `${mic.name}${mic.city ? ` · ${mic.city}` : ""}${
        inexact ? FREQUENCY_SUFFIX[mic.frequency] : ""
      }`;
      if (time) {
        const start = new Date(cursor);
        start.setHours(time.hours, time.minutes, 0, 0);
        events.push({
          id: `${mic.id}-${cursor.toISOString().slice(0, 10)}`,
          title,
          start,
          url: mic.signupUrl || "/open-mics",
          classNames: ["sgp-event-mic"],
        });
      } else {
        events.push({
          id: `${mic.id}-${cursor.toISOString().slice(0, 10)}`,
          title: `${title}${mic.time && mic.time !== "TBD" ? "" : " · time TBD"}`,
          start: new Date(cursor),
          allDay: true,
          url: mic.signupUrl || "/open-mics",
          classNames: ["sgp-event-mic"],
        });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return events;
}

function showEvents(): EventInput[] {
  return upcomingShows
    .filter((s) => s.start)
    .map((s) => ({
      id: `show-${s.id}`,
      title: `${s.name}${s.venue?.city ? ` · ${s.venue.city}` : ""}`,
      start: s.start as string,
      url: s.ticketUrl || s.url || "/shows",
      classNames: ["sgp-event-show"],
    }));
}

export function ComedyCalendar() {
  const mics = openMicsFeed.mics;
  const [city, setCity] = useState<string>("All");

  const cities = useMemo(() => {
    const counts = new Map<string, number>();
    for (const mic of mics) {
      if (!mic.city || mic.city.length < 3) continue;
      counts.set(mic.city, (counts.get(mic.city) ?? 0) + 1);
    }
    return [...counts.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [mics]);

  const filteredMics = useMemo(
    () => (city === "All" ? mics : mics.filter((m) => m.city === city)),
    [mics, city],
  );

  const shows = useMemo(() => showEvents(), []);

  function handleEventClick(arg: EventClickArg) {
    arg.jsEvent.preventDefault();
    if (!arg.event.url) return;
    track("Calendar Event Click", {
      type: arg.event.classNames.includes("sgp-event-show") ? "show" : "mic",
    });
    if (arg.event.url.startsWith("/")) {
      window.location.href = arg.event.url;
    } else {
      window.open(arg.event.url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div>
      <div
        role="group"
        aria-label="Filter calendar by city"
        className="flex flex-wrap gap-2"
      >
        {["All", ...cities].map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={city === c}
            onClick={() => setCity(c)}
            className={`h-10 border px-4 font-body text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
              city === c
                ? "border-hazard bg-hazard text-ink"
                : "border-bone/25 text-bone/70 hover:border-slime hover:text-slime"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="comedy-calendar mt-8">
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,listWeek",
          }}
          buttonText={{
            today: "Today",
            month: "Month",
            list: "List",
          }}
          events={(info, success) => {
            success([
              ...micEventsForRange(filteredMics, info.start, info.end),
              ...shows,
            ]);
          }}
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

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
        <p className="flex items-center gap-2 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65">
          <span aria-hidden className="h-3 w-3 bg-hazard" />
          Stoned Goose shows
        </p>
        <p className="flex items-center gap-2 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65">
          <span aria-hidden className="h-3 w-3 border border-bone/40" />
          Open mics
        </p>
      </div>
    </div>
  );
}
