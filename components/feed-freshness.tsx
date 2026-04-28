"use client";

import type { FeedSource, FeedStatus } from "@/content/feeds/types";

type Props = {
  source: FeedSource;
  fetchedAt: string;
  status: FeedStatus;
  placement: "watch-grid" | "watch-reels" | "home-strip" | "shows-fb-plugin";
};

// Renders nothing today. Phase E wires the "Feed Stale Render" Plausible
// event in here so we can see when the cron is failing without changing
// any caller. Kept as a client component so the event can fire on mount.
export function FeedFreshness({ source, fetchedAt, status, placement }: Props) {
  void source;
  void fetchedAt;
  void status;
  void placement;
  return null;
}
