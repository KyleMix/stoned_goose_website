"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { track } from "@/lib/analytics";

type Props = {
  /** Plausible "CTA Click" prop value. e.g. "hero-book", "about-crew". */
  cta: string;
  href: string;
  className?: string;
  children: ReactNode;
};

// Thin client wrapper that fires Plausible "CTA Click" before navigation.
// TrackedAnchor is the outbound-link equivalent; this one is for internal
// targets and in-page jumps, which are not outbound clicks and should not be
// counted as them.
export function CtaAnchor({ cta, href, className, children }: Props) {
  const onClick = () => track("CTA Click", { cta });

  // A same-page jump is a plain anchor: next/link would try to route it.
  if (href.startsWith("#")) {
    return (
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
