import type { Metadata } from "next";
import { site } from "@/content/site";
import { contactCopy } from "@/content/contact-copy";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import { TextField, TextAreaField } from "@/components/form-field";
import { TrackedAnchor } from "@/components/tracked-anchor";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs } from "@/lib/schema";

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
            <span className="italic text-hazard">{contactCopy.titleEmphasis}</span>
          </>
        }
        body={contactCopy.body}
      />

      <section className="bg-ink py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <a
                href={`mailto:${site.contact.email}`}
                className="group block"
              >
                <span className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                  {contactCopy.emailLabel}
                </span>
                <p className="mt-2 break-all font-display text-2xl tracking-tight text-bone transition-colors group-hover:text-slime md:text-4xl">
                  {site.contact.email}
                </p>
              </a>
              <a
                href={`tel:${site.contact.phoneTel}`}
                className="group mt-8 block"
              >
                <span className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                  {contactCopy.phoneLabel}
                </span>
                <p className="mt-2 font-display text-2xl tracking-tight text-bone transition-colors group-hover:text-slime md:text-4xl">
                  {site.contact.phone}
                </p>
              </a>

              <ul className="mt-6 flex flex-wrap items-center gap-3 font-body text-[11px] font-medium uppercase tracking-[0.18em]">
                {site.contact.smsEnabled ? (
                  <li>
                    <a
                      href={`sms:${site.contact.phoneTel}`}
                      className="inline-flex h-10 items-center border border-bone/30 px-4 text-bone hover:border-slime hover:text-slime"
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
                      className="inline-flex h-10 items-center bg-hazard px-4 text-ink hover:bg-slime"
                    >
                      {contactCopy.whatsappCtaLabel} ↗
                    </TrackedAnchor>
                  </li>
                ) : null}
              </ul>

              <div className="mt-10">
                <span className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                  {contactCopy.findUsLabel}
                </span>
                <p className="mt-2 font-display text-xl text-bone md:text-2xl">
                  {site.contact.address}
                </p>
                <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 font-body text-xs font-medium uppercase tracking-[0.18em] text-bone/55">
                  {site.serviceAreas.map((area) => (
                    <li key={area}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="md:col-span-7">
              <ContactForm
                subject="New site contact form message"
                source="Contact page"
                submitLabel={contactCopy.form.submitLabel}
                successText={contactCopy.form.successText}
                errorText={contactCopy.form.errorText}
                formName="contact"
                schema="contact"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    id="contact-name"
                    name="name"
                    label={contactCopy.form.nameLabel}
                    required
                    autoComplete="name"
                  />
                  <TextField
                    id="contact-email"
                    name="email"
                    label={contactCopy.form.emailLabel}
                    type="email"
                    required
                    autoComplete="email"
                  />
                </div>
                <TextAreaField
                  id="contact-message"
                  name="message"
                  label={contactCopy.form.messageLabel}
                  required
                  rows={6}
                  placeholder={contactCopy.form.messagePlaceholder}
                />
              </ContactForm>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
