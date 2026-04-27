"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { track } from "@/lib/analytics";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** "Outbound Click" prop value. e.g. "eventbrite", "youtube". */
  destination: string;
  children: ReactNode;
};

// Thin client wrapper that fires Plausible "Outbound Click" before navigation.
// Use anywhere a server-rendered page anchors out to a partner domain.
export function TrackedAnchor({
  destination,
  onClick,
  children,
  ...rest
}: Props) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    track("Outbound Click", { destination });
    onClick?.(event);
  }
  return (
    <a {...rest} onClick={handleClick}>
      {children}
    </a>
  );
}
