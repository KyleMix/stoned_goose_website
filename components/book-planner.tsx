"use client";

// The /book planner island: the Cal.com intro call section plus the
// build-your-show estimator. They live in one client component so the
// estimator can prefill the booking's notes field and remount the embed.

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/section-header";

// The Cal.com embed pulls in @calcom/embed-react plus Cal's remote loader.
// Load it on demand so /book's route bundle stays lean; the placeholder
// height keeps the section from jumping when the scheduler mounts.
const BookCallEmbed = dynamic(
  () =>
    import("@/components/book-call-embed").then((mod) => mod.BookCallEmbed),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="min-h-[420px] animate-pulse border border-bone/10 bg-bone/[0.03]"
      />
    ),
  },
);
import {
  plannerAddOns,
  plannerCopy,
  plannerQuestions,
  recommendTier,
} from "@/content/book-planner";
import { track } from "@/lib/analytics";

const CHIP_BASE =
  "h-11 border px-4 font-body text-[11px] font-medium uppercase tracking-[0.18em] transition-colors";
const CHIP_OFF = "border-bone/25 text-bone/70 hover:border-slime hover:text-slime";
const CHIP_ON = "border-hazard bg-hazard text-ink";

export function BookPlanner({ calLink }: { calLink: string | null }) {
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [addOns, setAddOns] = useState<number[]>([]);
  const [notes, setNotes] = useState("");

  const answered = plannerQuestions.every((q) => choices[q.id] !== undefined);

  const { tier, summary } = useMemo(() => {
    if (!answered) return { tier: null, summary: "" };
    let score = 0;
    const parts: string[] = [];
    for (const q of plannerQuestions) {
      const opt = q.options[choices[q.id]];
      score += opt.score;
      parts.push(opt.summary);
    }
    const picked = addOns.map((i) => plannerAddOns[i]);
    score += picked.reduce((n, o) => n + o.score, 0);
    const t = recommendTier(score);
    const addOnText =
      picked.length > 0
        ? ` Add-ons: ${picked.map((o) => o.summary).join(", ")}.`
        : "";
    const text = `Planning ${parts[0]}, ${parts[1]}.${addOnText}${
      t ? ` Site estimator suggested the ${t.name} package (${t.price}).` : ""
    }`;
    return { tier: t, summary: text };
  }, [answered, choices, addOns]);

  function applyToCall() {
    setNotes(summary);
    track("Estimator Applied", { tier: tier?.name ?? "none" });
    document
      .getElementById("call")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {calLink ? (
        <section
          id="call"
          className="scroll-mt-24 border-b border-bone/10 bg-ink py-16 md:py-20"
        >
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <SectionHeader
              eyebrow="Start here"
              title={
                <>
                  Book a free <span className="italic text-hazard">intro</span>{" "}
                  call.
                </>
              }
              subtitle="Fifteen minutes, no prep needed. Tell us what you're planning and we'll show up with ideas."
            />
            <div className="mt-12">
              <BookCallEmbed calLink={calLink} notes={notes} />
            </div>
          </div>
        </section>
      ) : null}

      <section
        id="plan"
        className="scroll-mt-24 border-b border-bone/10 bg-ink py-16 md:py-20"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <SectionHeader
            eyebrow={plannerCopy.eyebrow}
            title={
              <>
                Build your <span className="italic text-hazard">show</span>.
              </>
            }
            subtitle={plannerCopy.subtitle}
          />

          <div className="mt-10 grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="space-y-8 md:col-span-7">
              {plannerQuestions.map((q) => (
                <fieldset key={q.id}>
                  <legend className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                    {q.label}
                  </legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {q.options.map((opt, i) => (
                      <button
                        key={opt.label}
                        type="button"
                        aria-pressed={choices[q.id] === i}
                        onClick={() =>
                          setChoices((c) => ({ ...c, [q.id]: i }))
                        }
                        className={`${CHIP_BASE} ${
                          choices[q.id] === i ? CHIP_ON : CHIP_OFF
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}

              <fieldset>
                <legend className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                  Add-ons (optional)
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {plannerAddOns.map((opt, i) => (
                    <button
                      key={opt.label}
                      type="button"
                      aria-pressed={addOns.includes(i)}
                      onClick={() =>
                        setAddOns((a) =>
                          a.includes(i)
                            ? a.filter((x) => x !== i)
                            : [...a, i],
                        )
                      }
                      className={`${CHIP_BASE} ${
                        addOns.includes(i) ? CHIP_ON : CHIP_OFF
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="md:col-span-5">
              {tier ? (
                <div
                  aria-live="polite"
                  className="flex h-full flex-col border border-bone/15 p-8 md:p-10"
                >
                  <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                    {plannerCopy.resultEyebrow}
                  </p>
                  <h3 className="heading-display mt-3 text-3xl text-bone md:text-4xl">
                    {tier.name}
                  </h3>
                  <p className="mt-2 font-body text-sm font-semibold uppercase tracking-[0.18em] text-hazard">
                    {tier.price}
                  </p>
                  <p className="mt-2 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                    {tier.bestFor}
                  </p>
                  <ul className="mt-6 space-y-3 border-t border-bone/15 pt-6">
                    {tier.items.map((it) => (
                      <li
                        key={it}
                        className="flex items-baseline gap-3 font-body text-sm text-bone/85"
                      >
                        <span aria-hidden className="text-hazard">/</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-col gap-3">
                    {calLink ? (
                      <>
                        <button
                          type="button"
                          onClick={applyToCall}
                          className="inline-flex h-12 items-center justify-center bg-hazard px-6 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-ink hover:bg-slime"
                        >
                          {plannerCopy.applyLabel}
                        </button>
                        <p className="font-body text-xs text-bone/55">
                          {plannerCopy.applyHint}
                        </p>
                      </>
                    ) : (
                      <a
                        href="#quote"
                        className="inline-flex h-12 items-center justify-center bg-hazard px-6 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-ink hover:bg-slime"
                      >
                        {plannerCopy.fallbackLabel}
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center border border-dashed border-bone/15 p-8 md:p-10">
                  <p className="font-body text-sm text-bone/55">
                    Answer the first two and a package lands here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
