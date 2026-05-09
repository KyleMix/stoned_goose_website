"use client";

import { useEffect } from "react";

// Lenis smooth scroll wrapper. Mounted once at the layout level. Honors
// `prefers-reduced-motion`: if the user opts out, Lenis never instantiates
// and the browser's native scroll behavior takes over. The lerp is tuned
// soft, not sci-fi-glide; the brand register is Adult Swim, not Apple.
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    let cancelled = false;
    let raf = 0;
    let lenisInstance: { raf: (t: number) => void; destroy: () => void } | null = null;

    (async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;
      lenisInstance = new Lenis({
        lerp: 0.12,
        wheelMultiplier: 1,
        smoothWheel: true,
      });

      function tick(time: number) {
        lenisInstance?.raf(time);
        raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenisInstance?.destroy();
    };
  }, []);

  return null;
}
