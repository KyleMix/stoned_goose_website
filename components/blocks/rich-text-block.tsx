import type { RichTextBlock as RichTextBlockData } from "@/lib/blocks";

// Plain-text rich block. Splits on blank lines into paragraphs and on
// single newlines into <br/>s. No Markdoc rendering yet; that's a v2 upgrade.
// Keeps the dependency footprint flat for v1.
export function RichTextBlock({ block }: { block: RichTextBlockData }) {
  const paragraphs = block.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <section className="border-b border-surface-ivory/10 bg-surface-tuxedo py-20 md:py-28">
      <div className="mx-auto max-w-[820px] px-5 md:px-10">
        {block.eyebrow ? (
          <p className="font-body text-[10px] font-normal uppercase tracking-[0.18em] text-accent-gold">
            {block.eyebrow}
          </p>
        ) : null}
        {block.heading ? (
          <h2 className="heading-display mt-4 text-[clamp(2.2rem,6vw,4.5rem)] text-surface-ivory">
            {block.heading}
          </h2>
        ) : null}
        <div className={block.heading || block.eyebrow ? "mt-8 space-y-6" : "space-y-6"}>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="font-body text-base leading-relaxed text-surface-ivory/85 md:text-lg"
            >
              {p.split(/\n/).map((line, j, arr) => (
                <span key={j}>
                  {line}
                  {j < arr.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
