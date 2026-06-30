"use client";

import { formatFrequency, type NormalizedOpenMic } from "@/content/open-mics";
import { SIGNUP_FALLBACK_LABEL } from "@/lib/open-mics/normalize";
import { OpenMicUpdateDialog } from "@/components/open-mic-update-dialog";

type Props = {
  mics: NormalizedOpenMic[];
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
        const freq = formatFrequency(m);
        return (
          <li
            key={m.id}
            className={`transition-colors ${active ? "bg-bone/[0.04]" : "hover:bg-bone/[0.025]"}`}
          >
            <div className="flex flex-col gap-1 py-5 md:grid md:grid-cols-12 md:items-baseline md:gap-x-6 md:gap-y-1">
              <div className="col-span-3 md:col-span-2">
                <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                  {m.dayTimeDisplay}
                </p>
                {m.timeSignup ? (
                  <p className="mt-1 font-body text-[10px] uppercase tracking-[0.18em] text-bone/45">
                    Sign-up {m.timeSignup}
                  </p>
                ) : null}
                <p className="mt-1 inline-flex items-center border border-bone/20 px-1.5 py-0.5 font-body text-[10px] uppercase tracking-[0.18em] text-bone/60">
                  {freq.label}
                  {freq.detail ? (
                    <span className="ml-1 text-bone/45">{freq.detail}</span>
                  ) : null}
                </p>
              </div>
              <div className="col-span-9 md:col-span-7">
                <p
                  className={`font-display text-xl md:text-2xl ${
                    active ? "text-hazard" : "text-bone"
                  }`}
                >
                  {m.nameDisplay}
                </p>
                <p className="mt-1 font-body text-sm text-bone/85">
                  {[m.venueDisplay, m.addressDisplay].filter(Boolean).join(". ")}.
                </p>
                {m.hostDisplay.kind === "name" ? (
                  <p className="mt-1 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                    Host. {m.hostDisplay.text}
                  </p>
                ) : m.hostDisplay.kind === "link" ? (
                  <p className="mt-1 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
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
                  <p className="mt-2 max-w-prose font-body text-sm text-bone/70">
                    {m.notesDisplay}
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
      })}
    </ul>
  );
}
