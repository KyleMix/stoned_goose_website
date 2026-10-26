import { ogContentType, ogImageResponse, ogSize } from "@/lib/og-template";

export const dynamic = "force-static";

// /open-mics is a coming soon page since the Log Cabin mic was cancelled.
export const alt =
  "Stoned Goose open mic: coming soon. Got a public space that needs an open mic? Message us.";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return ogImageResponse({
    eyebrow: "Coming soon / Got a room? Message us",
    title: "Open Mic",
  });
}
