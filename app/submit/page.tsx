import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import { TextField, TextAreaField } from "@/components/form-field";

export const metadata: Metadata = {
  title: "Comic Submissions",
  description:
    "Submit your tape for consideration in future Stoned Goose Productions showcases, feature slots, and production projects.",
};

const requirements = [
  "5-10 minute unlisted video link with clear audio.",
  "Include current city, years performing, and social handles.",
  "Material should represent your current set and stage tone.",
  "One submission per comic every 90 days unless requested otherwise.",
];

export default function SubmitPage() {
  return (
    <>
      <PageHeader
        eyebrow="Roster Pipeline"
        title={
          <>
            Comic <span className="italic text-hazard">submissions</span>
          </>
        }
        body="Want to be considered for future Stoned Goose showcases, feature slots, and production projects? Send us a clean submission using the requirements below so we can review your material quickly."
      />

      <section className="border-b border-bone/10 bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-px overflow-hidden border border-bone/15 md:grid-cols-2">
            <div className="bg-ink p-8 md:p-10">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                What to send
              </p>
              <ul className="mt-6 space-y-4">
                {requirements.map((r, i) => (
                  <li key={i} className="flex items-baseline gap-4">
                    <span className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone/55">
                      /0{i + 1}
                    </span>
                    <span className="font-body text-base text-bone/85">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-ink p-8 md:p-10">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                Response time
              </p>
              <p className="mt-6 font-body text-base text-bone/85 md:text-lg">
                We review submissions on a rolling basis and typically respond
                within 2-3 weeks. High-volume periods can take up to 30 days. If
                it&apos;s a fit for current programming, we&apos;ll contact you
                directly for next steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                Submit your tape
              </p>
              <h2 className="heading-display mt-4 text-[clamp(2.4rem,7vw,5rem)] text-bone">
                Send the <span className="italic text-hazard">tape</span>.
              </h2>
              <p className="mt-6 font-body text-base text-bone/85 md:text-lg">
                One submission per comic every 90 days. We&apos;ll reach out
                directly if there&apos;s a fit.
              </p>
            </div>
            <div className="md:col-span-7">
              <ContactForm
                subject="Comic submission"
                source="Submit page"
                submitLabel="Submit for review"
                successText="Submission received. We review every tape and will reach out if there's a roster fit."
                formName="comic-submission"
                schema="submit"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    id="submit-name"
                    name="name"
                    label="Name"
                    required
                    autoComplete="name"
                  />
                  <TextField
                    id="submit-email"
                    name="email"
                    label="Email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                  <TextField
                    id="submit-phone"
                    name="phone"
                    label="Phone"
                    type="tel"
                    required
                    autoComplete="tel"
                  />
                  <TextField
                    id="submit-city"
                    name="city"
                    label="City / Region"
                    required
                  />
                  <TextField
                    id="submit-years"
                    name="years"
                    label="Years performing"
                    required
                  />
                  <TextField
                    id="submit-socials"
                    name="socials"
                    label="Social / Website Links"
                    required
                    placeholder="Instagram, website, etc."
                  />
                </div>
                <TextField
                  id="submit-tape"
                  name="tape"
                  label="Set Tape URL"
                  type="url"
                  required
                  placeholder="https://"
                />
                <TextAreaField
                  id="submit-notes"
                  name="notes"
                  label="Additional notes"
                  required
                  rows={5}
                  placeholder="Anything else we should know about your set, availability, or experience."
                />
              </ContactForm>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
