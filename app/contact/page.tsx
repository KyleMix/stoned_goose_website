import type { Metadata } from "next";
import { site } from "@/content/site";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import { TextField, TextAreaField } from "@/components/form-field";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Booking, partnerships, or just want to start a conversation? Get in touch with Stoned Goose Productions.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Direct Line"
        title={
          <>
            We want to{" "}
            <span className="italic text-hazard">work with you</span>
          </>
        }
        body="Booking, partnerships, or just want to start a conversation?"
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
                  Email
                </span>
                <p className="mt-2 break-all font-display text-2xl tracking-tight text-bone transition-colors group-hover:text-hazard md:text-4xl">
                  {site.contact.email}
                </p>
              </a>
              <a
                href={`tel:${site.contact.phoneTel}`}
                className="group mt-8 block"
              >
                <span className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                  Phone
                </span>
                <p className="mt-2 font-display text-2xl tracking-tight text-bone transition-colors group-hover:text-hazard md:text-4xl">
                  {site.contact.phone}
                </p>
              </a>

              <div className="mt-10">
                <span className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                  Find us
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
                submitLabel="Let's Talk"
                successText="Message sent! We'll get back to you soon."
                errorText="Something went wrong. Please try again shortly."
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    id="contact-name"
                    name="name"
                    label="Name"
                    required
                    autoComplete="name"
                  />
                  <TextField
                    id="contact-email"
                    name="email"
                    label="Email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                </div>
                <TextAreaField
                  id="contact-message"
                  name="message"
                  label="Message"
                  required
                  rows={6}
                  placeholder="Tell us what you're putting together."
                />
              </ContactForm>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
