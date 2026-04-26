import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] items-center bg-ink">
      <div className="mx-auto max-w-[1400px] px-5 pt-32 md:px-10">
        <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-hazard">
          [ Static / 404 / Misfire ]
        </p>
        <h1 className="heading-display mt-6 text-[clamp(4rem,18vw,16rem)] text-bone">
          Lost.
        </h1>
        <p className="mt-6 max-w-xl font-body text-base text-bone/85 md:text-lg">
          That page either never existed or got cut from the special. Pick a
          direction below.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
          >
            Back to home ↗
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center border border-bone/30 px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone hover:border-hazard hover:text-hazard"
          >
            Talk to us ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
