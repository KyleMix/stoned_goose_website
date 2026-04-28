"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { track } from "@/lib/analytics";

type FeedPlatform = "instagram" | "youtube" | "facebook";
type FeedPlacement =
  | "watch-grid"
  | "watch-reels"
  | "home-strip"
  | "shows-fb-plugin";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  platform: FeedPlatform;
  placement: FeedPlacement;
  children: ReactNode;
};

// Anchor that fires Plausible "Feed Click" with platform + placement props
// before navigation. Use at every outbound link on a feed-rendered surface.
export function FeedLink({
  platform,
  placement,
  onClick,
  children,
  ...rest
}: Props) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    track("Feed Click", { platform, placement });
    onClick?.(event);
  }
  return (
    <a {...rest} onClick={handleClick}>
      {children}
    </a>
  );
}
