import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Shows" };

export default function ShowsPage() {
  return (
    <Placeholder
      index="02"
      title="Shows"
      brief="Live lineups, presales, and ticket drops. Eventbrite feed plus a featured block for Xavier Rake's full special."
    />
  );
}
