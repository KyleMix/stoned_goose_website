import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Watch" };

export default function WatchPage() {
  return (
    <Placeholder
      index="04"
      title="Watch"
      brief="Featured: Xavier Rake's full special. Plus YouTube clips, Instagram reels (Halloween Costume Contest, Matt Loes - Krusty), and the latest from the channel."
    />
  );
}
