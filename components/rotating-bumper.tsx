"use client";

import { Fragment, useEffect, useState } from "react";
import { Bumper } from "@/components/bumper";
import { bumpers, type BumperVariant } from "@/content/home";

type Slot = keyof typeof bumpers;

type Props = {
  slot: Slot;
};

// Picks one variant per session and remembers the choice in sessionStorage.
// SSR + first paint render the canonical (index 0) variant. After hydration
// we may swap to a different variant; on subsequent navigations within the
// same session the choice is stable, so no flicker between page views.
//
// When the post-hydration index differs from the SSR'd one, fade through
// 0 -> 0 to mask the content swap. 200ms is fast enough that the user reads
// it as a typesetting moment rather than a transition.
const FADE_MS = 200;

export function RotatingBumper({ slot }: Props) {
  const pool = bumpers[slot];
  const [index, setIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (typeof window === "undefined" || pool.length <= 1) return;
    const key = `sg.bumper.${slot}`;
    let stored = window.sessionStorage.getItem(key);
    if (stored === null) {
      stored = String(Math.floor(Math.random() * pool.length));
      window.sessionStorage.setItem(key, stored);
    }
    const parsed = Number.parseInt(stored, 10);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed >= pool.length) return;
    if (parsed === index) return;

    setOpacity(0);
    const timer = window.setTimeout(() => {
      setIndex(parsed);
      setOpacity(1);
    }, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [slot, pool.length, index]);

  const variant: BumperVariant = pool[index];
  const lines = variant.body.split("\n");

  return (
    <div
      style={{ opacity, transition: `opacity ${FADE_MS}ms ease-out` }}
      className="motion-reduce:!transition-none motion-reduce:!opacity-100"
    >
      <Bumper eyebrow={variant.eyebrow} footnote={variant.footnote}>
        {lines.map((line, i) => (
          <Fragment key={i}>
            {line}
            {i < lines.length - 1 ? <br /> : null}
          </Fragment>
        ))}
      </Bumper>
    </div>
  );
}
