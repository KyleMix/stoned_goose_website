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
        className="min-h-[420px] animate-pulse border border-smoke bg-surface-ivory/[0.03]"
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
  "h-11 border px-4 t-eyebrow transition-colors";
const CHIP_OFF = "border-smoke text-smoke hover:border-accent-gold hover:text-accent-gold";
const CHIP_ON = "border-accent-gold bg-accent-gold text-surface-tuxedo";

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
          className="scroll-mt-24 border-b border-smoke bg-surface-tuxedo py-16 md:py-20"
        >
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <SectionHeader
              eyebrow="Start here"
              title={
                <>
                  Book a free <span className="text-accent-gold">intro</span>{""}
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
        className="scroll-mt-24 border-b border-smoke bg-surface-tuxedo py-16 md:py-20"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <SectionHeader
            eyebrow={plannerCopy.eyebrow}
            title={
              <>
                Build your <span className="text-accent-gold">show</span>.
              </>
            }
            subtitle={plannerCopy.subtitle}
          />

          <div className="mt-10 grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="space-y-8 md:col-span-7">
              {plannerQuestions.map((q) => (
                <fieldset key={q.id}>
                  <legend className="t-eyebrow text-smoke">
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
                <legend className="t-eyebrow text-smoke">
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
                  className="flex h-full flex-col border border-smoke p-8 md:p-10"
                >
                  <p className="t-eyebrow">
                    {plannerCopy.resultEyebrow}
                  </p>
                  <h3 className="t-headline mt-3 text-3xl md:text-4xl">
                    {tier.name}
                  </h3>
                  <p className="mt-2 text-sm t-eyebrow">
                    {tier.price}
                  </p>
                  <p className="mt-2 t-eyebrow text-smoke">
                    {tier.bestFor}
                  </p>
                  <ul className="mt-6 space-y-3 border-t border-smoke pt-6">
                    {tier.items.map((it) => (
                      <li
                        key={it}
                        className="flex items-baseline gap-3 text-sm text-surface-ivory"
                      >
                        <span aria-hidden className="text-accent-gold">/</span>
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
                          className="inline-flex h-12 items-center justify-center bg-accent-gold px-6 t-eyebrow text-surface-tuxedo hover:bg-surface-ivory"
                        >
                          {plannerCopy.applyLabel}
                        </button>
                        <p className="t-body text-xs text-smoke">
                          {plannerCopy.applyHint}
                        </p>
                      </>
                    ) : (
                      <a
                        href="#quote"
                        className="inline-flex h-12 items-center justify-center bg-accent-gold px-6 t-eyebrow text-surface-tuxedo hover:bg-surface-ivory"
                      >
                        {plannerCopy.fallbackLabel}
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center border border-dashed border-smoke p-8 md:p-10">
                  <p className="t-body text-sm text-smoke">
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
