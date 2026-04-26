import type { Metadata } from "next";
import { sponsorshipStats, sponsorshipTiers } from "@/content/sponsorships";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import {
  TextField,
  TextAreaField,
} from "@/components/form-field";

export const metadata: Metadata = {
  title: "Sponsor",
  description:
    "Sponsor recurring live comedy experiences in Olympia, Lacey, Tacoma, and beyond. Bronze, Silver, and Gold tiers available.",
};

export default function SponsorPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sponsorships"
        title={
          <>
            Partner with the South Sound&apos;s fastest-growing{" "}
            <span className="italic text-hazard">comedy</span> platform.
          </>
        }
        body="Sponsor recurring live comedy experiences and get in front of engaged audiences in Olympia, Lacey, Tacoma, and beyond."
      />

      <section className="border-b border-bone/10 bg-ink py-12 md:py-16">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-baseline justify-between gap-4 px-5 md:px-10">
          <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
            Need the deck? Grab the one-sheet.
          </p>
          <a
            href="/sponsorship-one-sheet.txt"
            className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-bone underline underline-offset-4 decoration-hazard decoration-2 hover:text-hazard"
          >
            Download Sponsorship One-Sheet ↗
          </a>
        </div>
      </section>

      <section className="border-b border-bone/10 bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <h2 className="heading-display text-[clamp(2.4rem,7vw,5rem)] text-bone">
            By the <span className="italic text-hazard">numbers</span>
          </h2>
          <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-bone/15 md:grid-cols-3">
            {sponsorshipStats.map((s) => (
              <li key={s.label} className="bg-ink p-8 md:p-10">
                <p className="font-display text-5xl text-bone md:text-6xl">
                  {s.value}
                </p>
                <p className="mt-3 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                  {s.label}
                </p>
                <p className="mt-3 font-body text-sm text-bone/85">
                  {s.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-bone/10 bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <h2 className="heading-display text-[clamp(2.4rem,7vw,5rem)] text-bone">
            Tiers
          </h2>
          <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-bone/15 md:grid-cols-3">
            {sponsorshipTiers.map((t) => (
              <li key={t.name} className="flex flex-col bg-ink p-8 md:p-10">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="heading-display text-3xl text-bone md:text-4xl">
                    {t.name}
                  </h3>
                  <span className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-hazard">
                    {t.price}
                  </span>
                </div>
                <ul className="mt-6 space-y-3 border-t border-bone/15 pt-6">
                  {t.deliverables.map((d) => (
                    <li
                      key={d}
                      className="flex items-baseline gap-3 font-body text-sm text-bone/85"
                    >
                      <span aria-hidden className="text-hazard">/</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                Inquiry
              </p>
              <h2 className="heading-display mt-4 text-[clamp(2.4rem,7vw,5rem)] text-bone">
                Start a <span className="italic text-hazard">sponsorship</span>.
              </h2>
              <p className="mt-6 font-body text-base text-bone/85 md:text-lg">
                Tell us your goals and a tier you&apos;re considering. We&apos;ll
                follow up with the right package and timeline.
              </p>
            </div>
            <div className="md:col-span-7">
              <ContactForm
                subject="Sponsorship inquiry"
                source="Sponsor page"
                submitLabel="Submit Sponsorship Inquiry"
                successText="Thanks! We received your sponsorship inquiry and will follow up shortly."
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    id="sponsor-name"
                    name="name"
                    label="Name"
                    required
                    autoComplete="name"
                  />
                  <TextField
                    id="sponsor-company"
                    name="company"
                    label="Company"
                    required
                    autoComplete="organization"
                  />
                  <TextField
                    id="sponsor-email"
                    name="email"
                    label="Email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                  <TextField
                    id="sponsor-tier"
                    name="tier"
                    label="Tier of interest"
                    required
                    placeholder="Bronze, Silver, Gold, or Custom"
                  />
                </div>
                <TextAreaField
                  id="sponsor-goals"
                  name="goals"
                  label="Sponsorship goals"
                  required
                  rows={5}
                  placeholder="What are you hoping to get out of the partnership?"
                />
              </ContactForm>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
