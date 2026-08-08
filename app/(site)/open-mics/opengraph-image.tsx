import { ogContentType, ogImageResponse, ogSize } from "@/lib/og-template";

export const dynamic = "force-static";

// The map kept the card it was drawn for (app/(site)/open-mics/map). This one
// is the app announcement, so a shared /open-mics link previews the app and not
// the Pacific Northwest map.
export const alt = "Open Mic Explorer, the app. Coming soon.";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return ogImageResponse({
    eyebrow: "Open Mic Explorer / Coming soon",
    title: "The App",
  });
}
