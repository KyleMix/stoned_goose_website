import Link from "next/link";
import { sponsorBlock } from "@/content/home";
import { SectionHeader } from "@/components/section-header";

export function SponsorsBlock() {
  return (
    <section
      aria-label="Sponsors and partners"
      className="relative border-b border-bone/10 bg-ink py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7">
            <SectionHeader
              index="05"
              eyebrow={sponsorBlock.eyebrow}
              title={
                <>
                  Build the <span className="italic text-hazard">Laughs</span>{" "}
                  Together
                </>
              }
              subtitle={sponsorBlock.subhead}
            />
            <Link
              href="/sponsor"
              className="mt-10 inline-flex h-12 items-center gap-3 border border-bone/30 px-6 font-mono text-xs uppercase tracking-[0.22em] text-bone transition-colors hover:border-hazard hover:bg-hazard hover:text-ink"
            >
              Start a Sponsorship <span aria-hidden>→</span>
            </Link>
          </div>

          <ul className="md:col-span-5">
            {sponsorBlock.benefits.map((b, i) => (
              <li
                key={b}
                className="flex items-baseline gap-4 border-t border-bone/15 py-5 last:border-b"
              >
                <span className="font-mono text-xs uppercase tracking-eyebrow text-hazard">
                  /0{i + 1}
                </span>
                <span className="font-display text-2xl text-bone md:text-3xl">
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
