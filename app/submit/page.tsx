import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Comic Submissions" };

export default function SubmitPage() {
  return (
    <Placeholder
      index="09"
      title="Submit"
      brief="Comic Submissions / Roster Pipeline. Tape requirements, response time, and the full submission form (8 fields)."
    />
  );
}
