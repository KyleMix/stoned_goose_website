"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import type { FeedSource, FeedStatus } from "@/content/feeds/types";

const STALE_AFTER_HOURS = 24;

type Props = {
  source: FeedSource;
  fetchedAt: string;
  status: FeedStatus;
  placement: "watch-grid" | "watch-reels" | "home-strip" | "shows-fb-plugin";
};

// Renders nothing visually. Fires "Feed Stale Render" once per mount when
// the page is shown to the visitor with a stale or errored feed. Lets the
// owner see in Plausible when the cron is failing without changing any
// caller's render path.
export function FeedFreshness({ source, fetchedAt, status, placement }: Props) {
  useEffect(() => {
    const ageMs = Date.now() - new Date(fetchedAt).getTime();
    const stale =
      status !== "ok" ||
      Number.isNaN(ageMs) ||
      ageMs > STALE_AFTER_HOURS * 60 * 60 * 1000;
    if (!stale) return;
    track("Feed Stale Render", { platform: source, placement, status });
  }, [source, fetchedAt, status, placement]);

  return null;
}
