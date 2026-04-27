"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

type Props = {
  /** Label rendered on the rail. e.g. service name or page title. */
  label: string;
  /** Element id of the quote form section to scroll to and dismiss against. */
  targetId: string;
};

// Slim sticky rail that nudges visitors to the quote form on /services and
// /services/[slug]. Hidden until the user scrolls past the page header (300px),
// hidden again once the target form is in view. Honors prefers-reduced-motion
// by skipping the slide-in transition.
export function StickyQuoteRail({ label, targetId }: Props) {
  const [shown, setShown] = useState(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const target = document.getElementById(targetId);
    let formInView = false;

    const observer = target
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              formInView = entry.isIntersecting;
            }
            update();
          },
          { rootMargin: "0px 0px -25% 0px", threshold: 0 },
        )
      : null;

    if (target && observer) observer.observe(target);

    function update() {
      const scrolled = window.scrollY > 300;
      setShown(scrolled && !formInView);
    }

    window.addEventListener("scroll", update, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", update);
      if (observer) observer.disconnect();
    };
  }, [targetId]);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    track("CTA Click", { cta: "sticky-quote-rail" });
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({
        behavior: reducedMotionRef.current ? "auto" : "smooth",
        block: "start",
      });
    } else {
      window.location.hash = `#${targetId}`;
    }
  }

  const baseClass =
    "fixed inset-x-0 bottom-0 z-40 border-t border-bone/15 bg-ink/95 backdrop-blur-md md:border-t md:px-6";
  const transitionClass = reducedMotionRef.current
    ? ""
    : "transition-transform duration-300";
  const visibilityClass = shown
    ? "translate-y-0"
    : "pointer-events-none translate-y-full";

  return (
    <div
      aria-hidden={!shown}
      className={`${baseClass} ${transitionClass} ${visibilityClass}`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3 md:px-10">
        <p className="truncate font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/85">
          <span className="text-bone/55">Quote / </span>
          {label}
        </p>
        <a
          href={`#${targetId}`}
          onClick={handleClick}
          className="inline-flex h-10 shrink-0 items-center bg-hazard px-5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
        >
          Get a quote ↗
        </a>
      </div>
    </div>
  );
}
