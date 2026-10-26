// Copy for /open-mics.
//
// The Log Cabin Monday mic was cancelled for good in October 2026. Until the
// next room exists, /open-mics is a coming soon page that asks venues to get
// in touch. Every word is in content/open-mic/index.json and editable at
// /admin. Before the Log Cabin room this URL held the Pacific Northwest open
// mic map and then the Open Mic Explorer app; both are retired too.

import copyData from "./open-mic/index.json";
import { normaliseBlocks, type Block } from "@/lib/blocks";

type OpenMicShape = {
  eyebrow?: string | null;
  titleLead?: string | null;
  titleEmphasis?: string | null;
  titleTrail?: string | null;
  subhead?: string | null;
  host?: Record<string, string | null | undefined> | null;
  topSections?: unknown;
  bottomSections?: unknown;
};

const copy = copyData as unknown as OpenMicShape;

/** A cleared CMS field arrives as null or "". Both mean "render nothing". */
function text(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

export const openMicTopSections: Block[] = normaliseBlocks(copy.topSections);
export const openMicBottomSections: Block[] = normaliseBlocks(
  copy.bottomSections,
);

export const openMic = {
  eyebrow: text(copy.eyebrow),
  titleLead: text(copy.titleLead),
  titleEmphasis: text(copy.titleEmphasis),
  titleTrail: text(copy.titleTrail),
  subhead: text(copy.subhead),
};

/** The words around the "host a mic" buttons. */
export const openMicHost = {
  eyebrow: text(copy.host?.eyebrow),
  heading: text(copy.host?.heading) || "Host the next one.",
  body: text(copy.host?.body),
  instagramLabel: text(copy.host?.instagramLabel) || "DM us on Instagram",
  emailLabel: text(copy.host?.emailLabel) || "Email us",
  emailSubject: text(copy.host?.emailSubject) || "Hosting an open mic",
  emailBody: copy.host?.emailBody ?? "",
  comicsNote: text(copy.host?.comicsNote),
};
