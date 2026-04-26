import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <Placeholder
      index="05"
      title="Services"
      brief="Full services hub: Live Show Production, Comedian Booking, Corporate Events, Media & Podcasts, Headshots & Promo. Pricing tiers (Starter/Pro/Premium), venue partner program, quote form."
    />
  );
}
