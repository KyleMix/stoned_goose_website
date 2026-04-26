import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <Placeholder
      index="07"
      title="Contact"
      brief="Standalone contact + booking form, email/phone callouts, service-area list. Submits to kyle@stonedgooseproductions.com."
    />
  );
}
