"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  FREQUENCY_FILTERS,
  type NormalizedOpenMic,
  type OpenMicDay,
  type OpenMicFrequency,
} from "@/content/open-mics";
import { OpenMicList } from "@/components/open-mic-list";

// Map is dynamically imported with SSR disabled because Leaflet touches
// `window`. This wrapper keeps the page server-rendered while the map
// hydrates client-side.
const OpenMicMap = dynamic(
  () => import("@/components/open-mic-map").then((m) => m.OpenMicMap),
  { ssr: false, loading: () => <MapSkeleton /> },
);

const ALL_DAYS: OpenMicDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type Props = {
  mics: NormalizedOpenMic[];
};

export function OpenMicExplorer({ mics }: Props) {
  const [day, setDay] = useState<OpenMicDay | "all">("all");
  const [city, setCity] = useState<string>("all");
  const [freq, setFreq] = useState<OpenMicFrequency | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Cities grouped by state for the dropdown: Washington first, then Oregon,
  // each alphabetical.
  const cityGroups = useMemo(() => {
    const byRegion = new Map<string, Set<string>>();
    for (const m of mics) {
      if (!m.city) continue;
      const region = m.region || "WA";
      if (!byRegion.has(region)) byRegion.set(region, new Set());
      byRegion.get(region)!.add(m.city);
    }
    const order = ["WA", "OR"];
    const label: Record<string, string> = { WA: "Washington", OR: "Oregon" };
    return Array.from(byRegion.entries())
      .sort((a, b) => {
        const ai = order.indexOf(a[0]);
        const bi = order.indexOf(b[0]);
        return (
          (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a[0].localeCompare(b[0])
        );
      })
      .map(([region, set]) => ({
        region,
        label: label[region] ?? region,
        cities: Array.from(set).sort((x, y) => x.localeCompare(y)),
      }));
  }, [mics]);

  const hasCities = cityGroups.some((g) => g.cities.length > 0);

  const filtered = useMemo(() => {
    return mics.filter((m) => {
      if (day !== "all" && m.day !== day) return false;
      if (city !== "all" && m.city !== city) return false;
      if (freq !== "all" && m.frequency !== freq) return false;
      return true;
    });
  }, [mics, day, city, freq]);

  const freqLabel = FREQUENCY_FILTERS.find((f) => f.value === freq)?.label;
  const activeFilters = [
    day !== "all" ? { key: "day", label: day, clear: () => setDay("all") } : null,
    city !== "all" ? { key: "city", label: city, clear: () => setCity("all") } : null,
    freq !== "all" && freqLabel
      ? { key: "freq", label: freqLabel, clear: () => setFreq("all") }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string; clear: () => void }>;

  const clearAll = () => {
    setDay("all");
    setCity("all");
    setFreq("all");
  };

  return (
    <div className="grid gap-10 md:grid-cols-12">
      <aside className="md:col-span-4 md:sticky md:top-24 md:self-start">
        <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
          Filter
        </p>
        <fieldset className="mt-4">
          <legend className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/55">
            Day
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip active={day === "all"} onClick={() => setDay("all")}>
              All
            </Chip>
            {ALL_DAYS.map((d) => (
              <Chip
                key={d}
                active={day === d}
                onClick={() => setDay(d)}
              >
                {d.slice(0, 3)}
              </Chip>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-6">
          <legend className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/55">
            Frequency
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {FREQUENCY_FILTERS.map((f) => (
              <Chip
                key={f.value}
                active={freq === f.value}
                onClick={() => setFreq(f.value)}
              >
                {f.label}
              </Chip>
            ))}
          </div>
        </fieldset>
        {hasCities ? (
          <fieldset className="mt-6">
            <legend className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/55">
              City
            </legend>
            <div className="relative mt-3">
              <select
                aria-label="Filter by city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full appearance-none border border-bone/30 bg-ink py-2.5 pl-3 pr-9 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/85 transition-colors hover:border-slime focus:border-hazard focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hazard"
              >
                <option value="all">All cities</option>
                {cityGroups.map((g) => (
                  <optgroup key={g.region} label={g.label}>
                    {g.cities.map((c) => (
                      <option key={`${g.region}-${c}`} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span
                aria-hidden
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-bone/55"
              >
                ▾
              </span>
            </div>
          </fieldset>
        ) : null}
        <div className="mt-6 flex items-center justify-between border-t border-bone/10 pt-4">
          <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
            {filtered.length} of {mics.length}{" "}
            {mics.length === 1 ? "mic" : "mics"}
          </p>
          {activeFilters.length > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55 underline underline-offset-4 transition-colors hover:text-slime"
            >
              Clear all
            </button>
          ) : null}
        </div>
      </aside>
      <div className="md:col-span-8">
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2">
          <p
            role="status"
            aria-live="polite"
            className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55"
          >
            Showing{" "}
            <span className="text-bone">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "mic" : "mics"}
            {activeFilters.length === 0 ? " across the region" : null}
          </p>
          {activeFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={f.clear}
              className="inline-flex items-center gap-1.5 border border-hazard/60 px-2 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-hazard transition-colors hover:border-slime hover:text-slime"
              aria-label={`Remove ${f.label} filter`}
            >
              {f.label}
              <span aria-hidden>×</span>
            </button>
          ))}
        </div>
        {/* The map is pointer-driven; the list below is the keyboard and
            screen reader equivalent. Say so for AT users. */}
        <p className="sr-only">
          The map is a visual aid. Every mic shown on the map is also in the
          list below, which works with a keyboard and screen reader.
        </p>
        <OpenMicMap
          mics={filtered}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <div className="mt-8">
          {/* Keeps the h1 -> h3 hierarchy intact: mic rows render as h3. */}
          <h2 className="sr-only">Open mic listings</h2>
          <OpenMicList
            mics={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center border px-3 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
        active
          ? "border-hazard bg-hazard text-ink"
          : "border-bone/30 text-bone/85 hover:border-slime hover:text-slime"
      }`}
    >
      {children}
    </button>
  );
}

function MapSkeleton() {
  return (
    <div className="aspect-[4/3] w-full animate-pulse border border-bone/15 bg-haze-500 md:aspect-[16/10]" />
  );
}
