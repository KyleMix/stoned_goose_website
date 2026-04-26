import Link from "next/link";
import { testimonials } from "@/content/home";
import { SectionHeader } from "@/components/section-header";

export function Testimonials() {
  return (
    <section
      aria-label="Testimonials"
      className="relative border-b border-bone/10 bg-bone text-ink"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <SectionHeader
          index="04"
          eyebrow="What people are saying"
          title={
            <>
              Venues. Brands. <span className="italic">Comedians.</span>
            </>
          }
          subtitle={
            <>
              Don&apos;t take our word for it — here&apos;s what the people
              who&apos;ve worked with us have to say.
            </>
          }
          className="text-ink [&_h2]:text-ink [&_p]:text-ink/70 [&_span]:text-ink/55"
        />

        <ul className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <li
              key={t.name}
              className="grid grid-cols-12 gap-x-6 border-t border-ink/15 pt-8"
            >
              <span className="col-span-2 font-mono text-xs uppercase tracking-eyebrow text-ink/45">
                /0{i + 1}
              </span>
              <figure className="col-span-10">
                <blockquote className="font-display text-xl leading-snug tracking-[-0.01em] text-ink md:text-2xl">
                  <span aria-hidden className="font-display text-4xl italic text-ink/40">
                    &ldquo;
                  </span>
                  {t.quote}
                </blockquote>
                <figcaption className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
                  <span className="text-ink">{t.name}</span> {" / "} {t.role}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <div className="mt-16 flex flex-wrap items-baseline justify-between gap-4 border-t border-ink/15 pt-8">
          <p className="font-display text-2xl italic text-ink md:text-3xl">
            Ready to join them? Let&apos;s talk about your event.
          </p>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center bg-ink px-6 font-mono text-xs uppercase tracking-[0.22em] text-bone transition-colors hover:bg-hazard hover:text-ink"
          >
            Start a Conversation ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
