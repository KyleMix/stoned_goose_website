import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Sponsor" };

export default function SponsorPage() {
  return (
    <Placeholder
      index="08"
      title="Sponsor"
      brief="Sponsorship tiers (Bronze/Silver/Gold), audience stats, one-sheet download, inquiry form."
    />
  );
}
