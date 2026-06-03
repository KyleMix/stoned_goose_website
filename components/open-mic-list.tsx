"use client";

import type { OpenMic } from "@/content/open-mics";
import { OpenMicUpdateDialog } from "@/components/open-mic-update-dialog";

type Props = {
  mics: OpenMic[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function OpenMicList({ mics, selectedId, onSelect }: Props) {
  if (mics.length === 0) {
    return (
      <p className="border border-bone/15 p-6 font-body text-sm text-bone/70">
        No mics match these filters. Try clearing them, or tell us about a mic
        we missed.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-bone/15 border-y border-bone/15">
      {mics.map((m) => {
        const active = selectedId === m.id;
        return (
          <li
            key={m.id}
            className={`transition-colors ${active ? "bg-bone/[0.04]" : "hover:bg-bone/[0.025]"}`}
          >
            <div className="flex flex-col gap-1 py-5 md:grid md:grid-cols-12 md:items-baseline md:gap-x-6 md:gap-y-1">
              <p className="col-span-3 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard md:col-span-2">
                {m.day.slice(0, 3)} / {m.time}
              </p>
              <div className="col-span-9 md:col-span-7">
                <p
                  className={`font-display text-xl md:text-2xl ${
                    active ? "text-hazard" : "text-bone"
                  }`}
                >
                  {m.name}
                </p>
                <p className="mt-1 font-body text-sm text-bone/85">
                  {m.venue}. {m.address}, {m.city}, {m.region}.
                </p>
                {m.host ? (
                  <p className="mt-1 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                    Host. {m.host}
                  </p>
                ) : null}
                {m.notes ? (
                  <p className="mt-2 max-w-prose font-body text-sm text-bone/70">
                    {m.notes}
                  </p>
                ) : null}
              </div>
              <div className="col-span-12 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 md:col-span-3 md:mt-0 md:flex-col md:items-end">
                <button
                  type="button"
                  onClick={() => onSelect(m.id)}
                  aria-pressed={active}
                  className={`inline-flex h-10 items-center border px-4 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                    active
                      ? "border-hazard text-hazard"
                      : "border-bone/30 text-bone hover:border-hazard hover:text-hazard"
                  }`}
                >
                  Show on map ↗
                </button>
                {m.signupUrl ? (
                  <a
                    href={m.signupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center border border-bone/30 px-4 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-bone hover:border-hazard hover:text-hazard"
                  >
                    Signup ↗
                  </a>
                ) : null}
                <OpenMicUpdateDialog mic={m} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
