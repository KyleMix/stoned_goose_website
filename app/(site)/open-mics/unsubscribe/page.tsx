import type { Metadata } from "next";
import Link from "next/link";
import { LinkAction } from "@/components/open-mic/link-action";

// Where the removal link in the confirmation email lands.
//
// Coming off the comedian list is NOT the same as giving up a spot, and the
// copy says so in as many words. Somebody who wants to stop getting booking
// emails should not lose the Monday they already signed up for, and somebody
// who cannot make Monday should not be quietly removed from the roster.

export const metadata: Metadata = {
  title: "Come off the comedian list",
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <section
      data-surface="tuxedo"
      aria-labelledby="unsubscribe"
      className="min-h-screen bg-surface-tuxedo pb-24 pt-32 md:pt-36"
    >
      <div className="mx-auto max-w-[900px] px-5 md:px-10">
        <p className="t-eyebrow">Stoned Goose</p>
        <h1 id="unsubscribe" className="t-headline mt-4 display-1">
          Come off the list
        </h1>

        <div className="mt-12">
          <LinkAction
            copy={{
              endpoint: "/api/open-mic/unsubscribe",
              loadingText: "Looking you up...",
              describe:
                "We keep your name, email and Instagram handle so we can get in touch about bookings and shows. Taking yourself off deletes the name and handle and stops us contacting you. It does not cancel any spot you have already taken: that link is in the same email.",
              confirmLabel: "Take me off the list",
              doneTitle: "Done. You are off the comedian list.",
              doneBody:
                "We will not contact you about bookings again. Any spot you have already signed up for is untouched, so turn up on the night. You can still sign up for the mic whenever you like.",
              alreadyTitle: "You are already off the list.",
              alreadyBody:
                "We are not contacting you about bookings. Signing up for a spot does not put you back on.",
              goneTitle: "You are not on the list.",
              goneBody:
                "This link has already been used, or the record it pointed at is gone. Nothing is stored against it.",
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
