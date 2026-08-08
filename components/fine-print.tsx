// Bordered disclaimer box used at the top of aggregator pages (/calendar,
// /open-mics/map). Renders nothing when the body is empty so the CMS can hide
// it.

type Props = {
  eyebrow?: string;
  body: string;
  footnote?: string;
};

export function FinePrint({ eyebrow, body, footnote }: Props) {
  if (!body) return null;
  return (
    <section className="border-b border-bone/10 bg-ink py-10 md:py-12">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="border border-bone/15 p-6 md:p-8">
          {eyebrow ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-hazard">
              {eyebrow}
            </p>
          ) : null}
          <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-bone/85">
            {body}
          </p>
          {footnote ? (
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.28em] text-bone/55">
              {footnote}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
