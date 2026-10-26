import { upcomingShows } from "@/content/shows";
import { formatShowDateLong, showTimeZone } from "@/lib/dates";
import { ogContentType, ogImageResponse, ogSize } from "@/lib/og-template";
import { performerOgResponse } from "@/lib/og-performer";

export const dynamic = "force-static";

// /shows shares as the next headliner's card, the same one at
// /shows/og/<slug>.png. A fragment like /shows#matt-ross never reaches a link
// preview crawler, so the page itself can only carry one image; the next show
// is the one worth selling. With no headliner booked it falls back to the
// standard route card.
const next = upcomingShows.find((s) => s.performer?.images.arch) ?? null;

export const alt = next
  ? `${next.performer!.name}, headlining Stoned Goose Productions on ${formatShowDateLong(next.start, showTimeZone(next))}`
  : "Stoned Goose Productions upcoming shows";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return next ? performerOgResponse(next) : ogImageResponse({ eyebrow: "Tour Diary", title: "Shows" });
}
