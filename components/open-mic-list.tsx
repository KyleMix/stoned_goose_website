"use client";

import { useMemo } from "react";
import { formatFrequency, type NormalizedOpenMic } from "@/content/open-mics";
import { SIGNUP_FALLBACK_LABEL } from "@/lib/open-mics/normalize";
import { OpenMicUpdateDialog } from "@/components/open-mic-update-dialog";

type Props = {
  mics: NormalizedOpenMic[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

// Groups mics by city so a long list stays scannable. Cities are sorted
// alphabetically; mics inside a city are ordered by day then start time.
const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function groupByCity(mics: NormalizedOpenMic[]) {
  const groups = new Map<string, NormalizedOpenMic[]>();
  for (const mic of mics) {
    const key = mic.city || "Other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(mic);
  }
  return Array.from(groups.entries())
    .map(([city, list]) => ({
      city,
      mics: [...list].sort((a, b) => {
        const day = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
        if (day !== 0) return day;
        return (a.timeStart ?? "").localeCompare(b.timeStart ?? "");
      }),
    }))
    .sort((a, b) => a.city.localeCompare(b.city));
}

export function OpenMicList({ mics, selectedId, onSelect }: Props) {
  const groups = useMemo(() => groupByCity(mics), [mics]);

  if (mics.length === 0) {
    return (
      <p className="border border-bone/15 p-6 font-body text-sm text-bone/70">
        No mics match these filters. Try clearing them, or tell us about a mic
        we missed.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map(({ city, mics: cityMics }) => (
        <details
          key={city}
          open
          className="group border border-bone/15 open:border-bone/25"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-bone/[0.025]">
            <span className="flex items-baseline gap-3">
              <span className="font-display text-lg text-bone">{city}</span>
              <span className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/45">
                {cityMics.length} {cityMics.length === 1 ? "mic" : "mics"}
              </span>
            </span>
            <span
              aria-hidden
              className="font-mono text-xs text-bone/55 transition-transform group-open:rotate-180"
            >
              ▾
            </span>
          </summary>
          <ul className="divide-y divide-bone/10 border-t border-bone/15">
            {cityMics.map((m) => (
              <MicRow
                key={m.id}
                mic={m}
                active={selectedId === m.id}
                onSelect={onSelect}
              />
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}

function MicRow({
  mic: m,
  active,
  onSelect,
}: {
  mic: NormalizedOpenMic;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const freq = formatFrequency(m);

  return (
    <li
      className={`transition-colors ${active ? "bg-bone/[0.04]" : "hover:bg-bone/[0.025]"}`}
    >
      <div className="px-4 py-5 md:grid md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-9">
          {/* Primary: venue / mic name. */}
          <h3
            className={`font-display text-xl leading-tight md:text-2xl ${
              active ? "text-hazard" : "text-bone"
            }`}
          >
            {m.nameDisplay}
          </h3>
          {/* Secondary: day + time, cadence, venue. */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-hazard">
              {m.dayTimeDisplay}
            </span>
            <span className="inline-flex items-center border border-bone/20 px-1.5 py-0.5 font-body text-[10px] uppercase tracking-[0.18em] text-bone/60">
              {freq.label}
              {freq.detail ? (
                <span className="ml-1 text-bone/45">{freq.detail}</span>
              ) : null}
            </span>
            {m.timeSignup ? (
              <span className="font-body text-[10px] uppercase tracking-[0.18em] text-bone/45">
                Sign-up {m.timeSignup}
              </span>
            ) : null}
          </div>
          {/* Tertiary: venue + address, host, notes. */}
          <p className="mt-2 font-body text-sm text-bone/75">
            {[m.venueDisplay, m.addressDisplay].filter(Boolean).join(". ")}.
          </p>
          {m.hostDisplay.kind === "name" ? (
            <p className="mt-1 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/50">
              Host. {m.hostDisplay.text}
            </p>
          ) : m.hostDisplay.kind === "link" ? (
            <p className="mt-1 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/50">
              Host.{" "}
              <a
                href={m.hostDisplay.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 decoration-bone/30 hover:text-slime hover:decoration-slime"
              >
                {m.hostDisplay.label}
              </a>
            </p>
          ) : null}
          {m.signupDisplay.kind === "note" ? (
            <p className="mt-1 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/45">
              Sign-up. {m.signupDisplay.text}
            </p>
          ) : null}
          {m.notesDisplay ? (
            <p className="mt-2 max-w-prose font-body text-sm text-bone/60">
              {m.notesDisplay}
            </p>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 md:col-span-3 md:mt-0 md:flex-col md:items-end">
          <button
            type="button"
            onClick={() => onSelect(m.id)}
            aria-pressed={active}
            className={`inline-flex h-10 items-center border px-4 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
              active
                ? "border-hazard text-hazard"
                : "border-bone/30 text-bone hover:border-slime hover:text-slime"
            }`}
          >
            Show on map ↗
          </button>
          {m.signupDisplay.kind === "url" ? (
            <a
              href={m.signupDisplay.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center border border-bone/30 px-4 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-bone hover:border-slime hover:text-slime"
            >
              Signup ↗
            </a>
          ) : m.signupDisplay.kind === "fallback" ? (
            <span className="inline-flex h-10 items-center font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/45">
              {SIGNUP_FALLBACK_LABEL}
            </span>
          ) : null}
          <OpenMicUpdateDialog mic={m} />
        </div>
      </div>
    </li>
  );
}
