import type { Metadata } from "next";
import Link from "next/link";
import { LinkAction } from "@/components/open-mic/link-action";

// Where the "can't make it" link in the confirmation email lands.
//
// The page reads, the button acts. Nothing is released until somebody presses
// it: see the note in components/open-mic/link-action.tsx about mail clients
// fetching links nobody clicked.

export const metadata: Metadata = {
  title: "Release your spot",
  robots: { index: false, follow: false },
};

export default function CancelSpotPage() {
  return (
    <section
      data-surface="tuxedo"
      aria-labelledby="cancel-spot"
      className="min-h-screen bg-surface-tuxedo pb-24 pt-32 md:pt-36"
    >
      <div className="mx-auto max-w-[900px] px-5 md:px-10">
        <p className="t-eyebrow">Log Cabin open mic</p>
        <h1 id="cancel-spot" className="t-headline mt-4 display-1">
          Release your spot
        </h1>

        <div className="mt-12">
          <LinkAction
            copy={{
              endpoint: "/api/open-mic/cancel",
              loadingText: "Checking your spot...",
              describe:
                "You have spot {slot} on {dateLabel}. Releasing it puts it straight back on the board for somebody else. You can sign up again for another Monday any time.",
              confirmLabel: "Release my spot",
              doneTitle: "Done. Your spot is back on the list.",
              doneBody:
                "Somebody else can take it now. No hard feelings. Sign up for another Monday whenever you want.",
              alreadyTitle: "That spot is already gone.",
              alreadyBody: "There is nothing left to do here.",
              goneTitle: "Nothing to release.",
              goneBody:
                "This link has already been used, or that Monday has been and gone. Either way you are not on a list.",
              noTokenTitle: "This link is incomplete.",
              noTokenBody:
                "Open the link from your confirmation email rather than typing the address in.",
            }}
          />
        </div>

        <p className="t-fine mt-12">
          <Link href="/open-mics" className="underline underline-offset-4">
            Back to the open mic
          </Link>
        </p>
      </div>
    </section>
  );
}
