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
    <section className="border-b border-smoke bg-surface-tuxedo py-10 md:py-12">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="border border-smoke p-6 md:p-8">
          {eyebrow ? (
            <p className="t-eyebrow">
              {eyebrow}
            </p>
          ) : null}
          <p className="t-body mt-3 max-w-3xl text-sm">
            {body}
          </p>
          {footnote ? (
            <p className="t-fine mt-3">
              {footnote}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
