import { site } from "@/content/site";
import { SectionHeader } from "@/components/section-header";

export function ContactBlock() {
  return (
    <section
      aria-label="Contact"
      className="relative bg-ink py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7">
            <SectionHeader
              index="06"
              eyebrow="Direct Line"
              title={
                <>
                  We want to{" "}
                  <span className="italic text-hazard">work with you</span>
                </>
              }
              subtitle="Booking, partnerships, or just want to start a conversation?"
            />
            <a
              href={`mailto:${site.contact.email}`}
              className="group mt-10 block"
            >
              <span className="font-mono text-[11px] uppercase tracking-eyebrow text-bone/45">
                Email
              </span>
              <p className="mt-2 break-all font-display text-3xl tracking-tight text-bone transition-colors group-hover:text-hazard md:text-5xl">
                {site.contact.email}
              </p>
            </a>
            <a
              href={`tel:${site.contact.phoneTel}`}
              className="group mt-8 block"
            >
              <span className="font-mono text-[11px] uppercase tracking-eyebrow text-bone/45">
                Phone
              </span>
              <p className="mt-2 font-display text-3xl tracking-tight text-bone transition-colors group-hover:text-hazard md:text-5xl">
                {site.contact.phone}
              </p>
            </a>
          </div>

          <div className="md:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-eyebrow text-bone/45">
              Find us
            </p>
            <p className="mt-2 font-display text-2xl text-bone md:text-3xl">
              {site.contact.address}
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-xs uppercase tracking-eyebrow text-bone/55">
              {site.serviceAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
            <a
              href="/contact"
              className="mt-10 inline-flex h-12 items-center bg-hazard px-6 font-mono text-xs uppercase tracking-[0.22em] text-ink transition-colors hover:bg-bone"
            >
              Send a message ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
