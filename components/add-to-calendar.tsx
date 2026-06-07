"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

type Props = {
  /** Stable id used to build the .ics path. Matches the show id. */
  showId: string;
  /** Show title. Used in Google / Outlook templated URLs. */
  title: string;
  /** Show description / summary. */
  description: string;
  /** ISO start. Required for templated URLs. */
  start: string | null;
  /** ISO end. Optional. Falls back to start + 2h. */
  end: string | null;
  /** Display location. e.g. "Capitol Theater, Olympia, WA". */
  location: string;
};

function toGoogleDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function buildGoogleUrl({ title, description, start, end, location }: Omit<Props, "showId" | "start" | "end"> & { start: string; end: string }) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toGoogleDate(start)}/${toGoogleDate(end)}`,
    details: description,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildOutlookUrl({ title, description, start, end, location }: Omit<Props, "showId" | "start" | "end"> & { start: string; end: string }) {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: title,
    body: description,
    startdt: new Date(start).toISOString(),
    enddt: new Date(end).toISOString(),
    location,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

// Minimal, accessible add-to-calendar dropdown. Plain <details> + <summary>.
// No new dependency. Three formats: Google, Outlook, .ics download.
export function AddToCalendar(props: Props) {
  const { showId, title, description, start, end, location } = props;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(event: globalThis.MouseEvent) {
      if (!rootRef.current) return;
      if (event.target instanceof Node && rootRef.current.contains(event.target)) return;
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!start) return null;

  const startIso = start;
  const endIso =
    end ?? new Date(new Date(start).getTime() + 2 * 60 * 60 * 1000).toISOString();

  const googleUrl = buildGoogleUrl({ title, description, start: startIso, end: endIso, location });
  const outlookUrl = buildOutlookUrl({ title, description, start: startIso, end: endIso, location });
  const icsUrl = `/shows/${showId}.ics`;

  function handleClick(destination: string) {
    return (_e: MouseEvent<HTMLAnchorElement>) => {
      track("Add To Calendar", { destination, showId });
      setOpen(false);
    };
  }

  return (
    <details
      ref={rootRef}
      className="relative inline-block"
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="inline-flex h-11 cursor-pointer list-none items-center border border-bone/30 px-5 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone hover:border-slime hover:text-slime [&::-webkit-details-marker]:hidden">
        Add to calendar +
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-56 border border-bone/30 bg-ink shadow-xl">
        <ul className="divide-y divide-bone/15">
          <li>
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick("google")}
              className="block px-4 py-3 font-body text-xs uppercase tracking-[0.18em] text-bone hover:bg-bone/[0.05] hover:text-slime"
            >
              Google Calendar ↗
            </a>
          </li>
          <li>
            <a
              href={outlookUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick("outlook")}
              className="block px-4 py-3 font-body text-xs uppercase tracking-[0.18em] text-bone hover:bg-bone/[0.05] hover:text-slime"
            >
              Outlook ↗
            </a>
          </li>
          <li>
            <a
              href={icsUrl}
              download
              onClick={handleClick("ics")}
              className="block px-4 py-3 font-body text-xs uppercase tracking-[0.18em] text-bone hover:bg-bone/[0.05] hover:text-slime"
            >
              Apple / iCal (.ics)
            </a>
          </li>
        </ul>
      </div>
    </details>
  );
}
