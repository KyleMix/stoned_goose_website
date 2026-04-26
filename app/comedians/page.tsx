import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Comedians" };

export default function ComediansPage() {
  return (
    <Placeholder
      index="03"
      title="Comedians"
      brief="The full 22-comic friends roster with halftone headshots, IG/FB links, and a submit-to-roster CTA."
    />
  );
}
