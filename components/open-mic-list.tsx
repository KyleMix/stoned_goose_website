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
      <p className="t-body border border-smoke p-6 text-sm text-smoke">
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
          className="group border border-smoke open:border-smoke"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-surface-ivory/[0.025]">
            <span className="flex items-baseline gap-3">
              <span className="t-subhead text-lg">{city}</span>
              <span className="t-eyebrow text-smoke">
                {cityMics.length} {cityMics.length === 1 ? "mic" : "mics"}
              </span>
            </span>
            <span
              aria-hidden
              className="text-xs text-smoke transition-transform group-open:rotate-180"
            >
              ▾
            </span>
          </summary>
          <ul className="divide-y divide-smoke border-t border-smoke">
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
      className={`transition-colors ${active ?"bg-surface-ivory/[0.04]" :"hover:bg-surface-ivory/[0.025]"}`}
    >
      <div className="px-4 py-5 md:grid md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-9">
          {/* Primary: venue / mic name. */}
          <h3
            className={`t-subhead text-xl leading-tight md:text-2xl ${
              active ? "text-accent-gold" : "text-surface-ivory"
            }`}
          >
            {m.nameDisplay}
          </h3>
          {/* Secondary: day + time, cadence, venue. */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="t-eyebrow">
              {m.dayTimeDisplay}
            </span>
            <span className="inline-flex items-center border border-smoke px-1.5 py-0.5 t-eyebrow text-smoke">
              {freq.label}
              {freq.detail ? (
                <span className="ml-1 text-smoke">{freq.detail}</span>
              ) : null}
            </span>
            {m.timeSignup ? (
              <span className="t-eyebrow text-smoke">
                Sign-up {m.timeSignup}
              </span>
            ) : null}
          </div>
          {/* Tertiary: venue + address, host, notes. */}
          <p className="t-body mt-2 text-sm">
            {[m.venueDisplay, m.addressDisplay].filter(Boolean).join(". ")}.
          </p>
          {m.hostDisplay.kind === "name" ? (
            <p className="mt-1 t-eyebrow text-smoke">
              Host. {m.hostDisplay.text}
            </p>
          ) : m.hostDisplay.kind === "link" ? (
            <p className="mt-1 t-eyebrow text-smoke">
              Host.{" "}
              <a
                href={m.hostDisplay.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 decoration-surface-ivory/30 hover:text-accent-gold hover:decoration-accent-gold"
              >
                {m.hostDisplay.label}
              </a>
            </p>
          ) : null}
          {m.signupDisplay.kind === "note" ? (
            <p className="mt-1 t-eyebrow text-smoke">
              Sign-up. {m.signupDisplay.text}
            </p>
          ) : null}
          {m.notesDisplay ? (
            <p className="t-body mt-2 max-w-prose text-sm text-smoke">
              {m.notesDisplay}
            </p>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 md:col-span-3 md:mt-0 md:flex-col md:items-end">
          <button
            type="button"
            onClick={() => onSelect(m.id)}
            aria-pressed={active}
            className={`inline-flex h-10 items-center border px-4 t-eyebrow transition-colors ${
              active
                ? "border-accent-gold text-accent-gold"
                : "border-smoke text-surface-ivory hover:border-accent-gold hover:text-accent-gold"
            }`}
          >
            Show on map ↗
          </button>
          {m.signupDisplay.kind === "url" ? (
            <a
              href={m.signupDisplay.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center border border-smoke px-4 t-eyebrow text-surface-ivory hover:border-accent-gold hover:text-accent-gold"
            >
              Signup ↗
            </a>
          ) : m.signupDisplay.kind === "fallback" ? (
            <span className="inline-flex h-10 items-center t-eyebrow text-smoke">
              {SIGNUP_FALLBACK_LABEL}
            </span>
          ) : null}
          <OpenMicUpdateDialog mic={m} />
        </div>
      </div>
    </li>
  );
}
