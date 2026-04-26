import Link from "next/link";

type Props = {
  index: string;
  title: string;
  brief: string;
};

export function Placeholder({ index, title, brief }: Props) {
  return (
    <section className="relative flex min-h-[88svh] items-end bg-ink pb-24 pt-40 md:pb-32">
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-hazard">
          [ {index} / Pending Build ]
        </p>
        <h1 className="heading-display mt-6 text-[clamp(3.5rem,14vw,12rem)] text-bone">
          {title}
          <span className="text-hazard">.</span>
        </h1>
        <p className="mt-6 max-w-xl font-body text-base text-bone/70 md:text-lg">
          {brief}
        </p>
        <p className="mt-10 max-w-xl font-mono text-[11px] uppercase tracking-[0.22em] text-bone/45">
          This page is part of the full build. The home and members pages are
          here at full fidelity to lock the direction first.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-12 items-center bg-hazard px-6 font-mono text-xs uppercase tracking-[0.22em] text-ink hover:bg-bone"
          >
            Back to home ↗
          </Link>
          <Link
            href="/members"
            className="inline-flex h-12 items-center border border-bone/30 px-6 font-mono text-xs uppercase tracking-[0.22em] text-bone hover:border-hazard hover:text-hazard"
          >
            See finished page ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
