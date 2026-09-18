import type { Metadata } from "next";
import { site } from "@/content/site";
import { contactCopy } from "@/content/contact-copy";
import { PageHeader } from "@/components/page-header";
import { BookingEnquiry } from "@/components/booking-enquiry";
import { TrackedAnchor } from "@/components/tracked-anchor";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs } from "@/lib/schema";
import { Surface } from "@/components/brand/surface";
import { Badge } from "@/components/brand/badge";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Booking, partnerships, or just want to start a conversation? Get in touch with Stoned Goose Productions.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd schema={buildBreadcrumbs("/contact")} />
      <PageHeader
        eyebrow={contactCopy.eyebrow}
        title={
          <>
            {contactCopy.titleLead}{" "}
            <span className="text-accent-gold">{contactCopy.titleEmphasis}</span>
          </>
        }
        body={contactCopy.body}
      />

      <Surface tone="ivory" as="section" className="py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          {/* Client-facing surface, so it carries the badge. The lockup is in
              the footer and the two never share a section. Tuxedo colorway
              because this band is ivory; the badge is never recolored in CSS. */}
          <Badge
            colorway="tuxedo"
            width={140}
            alt=""
            className="mb-12 hidden md:block"
          />
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <a
                href={`mailto:${site.contact.email}`}
                className="group block"
              >
                <span className="t-eyebrow">
                  {contactCopy.emailLabel}
                </span>
                <p className="mt-2 break-all t-subhead text-2xl transition-colors group-hover:text-accent-gold md:text-4xl">
                  {site.contact.email}
                </p>
              </a>
              <a
                href={`tel:${site.contact.phoneTel}`}
                className="group mt-8 block"
              >
                <span className="t-eyebrow">
                  {contactCopy.phoneLabel}
                </span>
                <p className="mt-2 t-subhead text-2xl transition-colors group-hover:text-accent-gold md:text-4xl">
                  {site.contact.phone}
                </p>
              </a>

              <ul className="mt-6 flex flex-wrap items-center gap-3">
                {site.contact.smsEnabled ? (
                  <li>
                    <a
                      href={`sms:${site.contact.phoneTel}`}
                      className="inline-flex h-11 items-center border border-smoke px-4 t-ui transition-colors hover:border-accent-gold hover:text-accent-gold"
                    >
                      {contactCopy.textCtaLabel}
                    </a>
                  </li>
                ) : null}
                {site.contact.whatsapp ? (
                  <li>
                    <TrackedAnchor
                      destination="whatsapp"
                      href={`https://wa.me/${site.contact.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center bg-accent-gold px-4 t-ui text-surface-tuxedo transition-colors hover:bg-surface-ivory"
                    >
                      {contactCopy.whatsappCtaLabel} ↗
                    </TrackedAnchor>
                  </li>
                ) : null}
              </ul>

              <div className="mt-10">
                <span className="t-eyebrow">
                  {contactCopy.findUsLabel}
                </span>
                <p className="mt-2 t-subhead text-xl md:text-2xl">
                  {site.contact.address}
                </p>
                <ul className="t-body mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-smoke">
                  {site.serviceAreas.map((area) => (
                    <li key={area}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="md:col-span-7">
              <BookingEnquiry
                subject="New message from the contact page"
                source="/contact"
                formName="enquiry-contact"
                idPrefix="contact"
                submitLabel={contactCopy.form.submitLabel}
              />
            </div>
          </div>
        </div>
      </Surface>
    </>
  );
}
