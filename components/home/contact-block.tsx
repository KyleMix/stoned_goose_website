import Link from "next/link";
import { site } from "@/content/site";
import { contactCopy } from "@/content/home";
import { BookingEnquiry } from "@/components/booking-enquiry";

// The page's destination.
//
// Until now the home page had no form on it at all: the only way to start a
// conversation was a text link reading "or just email us" at the foot of the
// services list. Every CTA above this point lands here.
export function ContactBlock() {
  return (
    <section
      id="contact"
      aria-labelledby="home-contact"
      className="section-y-lg scroll-mt-24 border-b border-smoke bg-surface-tuxedo"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <p className="t-eyebrow">{contactCopy.eyebrow}</p>
            <h2 id="home-contact" className="t-headline mt-4 display-1 text-balance">
              {contactCopy.heading}
            </h2>
            <p className="t-body mt-6 max-w-md text-base md:text-lg">
              {contactCopy.body}
            </p>

            <div className="mt-10 space-y-1">
              <a
                href={`mailto:${site.contact.email}`}
                className="t-body inline-flex min-h-[44px] items-center text-base underline decoration-smoke underline-offset-4 transition-colors hover:text-accent-gold hover:decoration-accent-gold md:text-lg"
              >
                {site.contact.email}
              </a>
              <br />
              <a
                href={`tel:${site.contact.phoneTel}`}
                className="t-body inline-flex min-h-[44px] items-center text-base underline decoration-smoke underline-offset-4 transition-colors hover:text-accent-gold hover:decoration-accent-gold md:text-lg"
              >
                {site.contact.phone}
              </a>
            </div>

            {site.booking.calLink ? (
              <p className="t-body mt-6 text-sm text-smoke">
                Prefer to talk?{" "}
                <Link
                  href="/book"
                  className="text-surface-ivory underline underline-offset-4 transition-colors hover:text-accent-gold"
                >
                  Book a free 15 minute intro call
                </Link>
                .
              </p>
            ) : null}
          </div>

          <div className="md:col-span-7">
            <BookingEnquiry
              subject="New enquiry from the home page"
              source="Home page contact section"
              formName="enquiry-home"
              idPrefix="home"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
