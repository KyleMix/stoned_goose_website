import { ogContentType, ogImageResponse, ogSize } from "@/lib/og-template";

export const dynamic = "force-static";

export const alt = "Sponsor a Stoned Goose Productions show";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return ogImageResponse({ eyebrow: "For sponsors", title: "Sponsor a show" });
}
