import { ogContentType, ogImageResponse, ogSize } from "@/lib/og-template";

export const dynamic = "force-static";

// /open-mics is the Log Cabin Monday mic now. The card it used to carry was
// drawn for the Open Mic Explorer app, which is dead.
export const alt =
  "Log Cabin Comedy Open Mic. Every Monday in Olympia. Show starts at 7 PM. 12 spots, 8 minutes each, signed up in advance.";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return ogImageResponse({
    eyebrow: "Every Monday / Log Cabin Bar & Grill",
    title: "Open Mic",
  });
}
