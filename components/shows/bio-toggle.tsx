"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A headliner bio, clamped to three lines with a More / Less toggle.
 *
 * The toggle renders by default and hides itself after mount if the bio fits
 * in three lines anyway, so a reader without JavaScript never loses text: the
 * clamp is CSS, and the full bio is in the HTML either way.
 */
export function BioToggle({ bio, className }: { bio: string; className?: string }) {
  const id = useId();
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (el) setClamped(el.scrollHeight > el.clientHeight + 1);
  }, []);

  return (
    <div className={className}>
      <p id={id} ref={ref} className={cn("t-body text-sm md:text-base", !open && "line-clamp-3")}>
        {bio}
      </p>
      {clamped || open ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="mt-1 inline-flex min-h-[44px] items-center t-ui underline underline-offset-4 hover:text-accent-gold"
        >
          {open ? "Less" : "More"}
        </button>
      ) : null}
    </div>
  );
}
