import { ogContentType, ogImageResponse, ogSize } from "@/lib/og-template";

export const dynamic = "force-static";

export const alt = "About Stoned Goose Productions";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return ogImageResponse({ eyebrow: "About us", title: "About" });
}
