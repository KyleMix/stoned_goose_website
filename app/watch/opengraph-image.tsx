import { ogContentType, ogImageResponse, ogSize } from "@/lib/og-template";

export const dynamic = "force-static";

export const alt = "Stoned Goose Productions media and clips";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return ogImageResponse({ eyebrow: "Now Streaming", title: "Watch" });
}
