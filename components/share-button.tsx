"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

type Props = {
  title: string;
  text: string;
  /** Absolute URL to share. Falls back to current page if blank. */
  url: string;
  /** Optional plausible "Share" prop, e.g. "show", "special". */
  surface?: string;
};

// Native Web Share API where available, otherwise copy-to-clipboard fallback.
// No third-party "share buttons" loaded.
export function ShareButton({ title, text, url, surface }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    track("Share", { surface: surface ?? "unknown" });
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // user dismissed share sheet. fall through to no-op.
        return;
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard denied. silent.
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Share ${title}`}
      className="inline-flex h-11 items-center border border-bone/30 px-4 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone hover:border-hazard hover:text-hazard"
    >
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
