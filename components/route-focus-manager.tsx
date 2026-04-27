"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Moves focus to the first H1 inside <main> on each client-side route change
// so keyboard and screen-reader users land on the page heading instead of
// being stranded at the previous focus position.
export function RouteFocusManager() {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (previousPathRef.current === null) {
      previousPathRef.current = pathname;
      return;
    }
    if (previousPathRef.current === pathname) return;
    previousPathRef.current = pathname;

    const main = document.getElementById("main");
    if (!main) return;
    const heading = main.querySelector<HTMLElement>("h1");
    const target = heading ?? main;
    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
    }
    target.focus({ preventScroll: false });
  }, [pathname]);

  return null;
}
