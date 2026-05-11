import { ogContentType, ogImageResponse, ogSize } from "@/lib/og-template";

export const dynamic = "force-static";

export const alt = "Contact Stoned Goose Productions";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return ogImageResponse({ eyebrow: "Direct Line", title: "Contact" });
}
