import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
};

// Standard page-top masthead. Used by every internal page so the editorial
// rhythm stays consistent.
export function PageHeader({ eyebrow, title, body }: Props) {
  return (
    <section className="relative border-b border-surface-ivory/10 bg-surface-tuxedo pb-16 pt-32 md:pb-20 md:pt-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        {eyebrow && (
          <p className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-accent-gold">
            {eyebrow}
          </p>
        )}
        <h1 className="heading-display mt-4 text-[clamp(3rem,11vw,9rem)] text-surface-ivory">
          {title}
        </h1>
        {body && (
          <p className="mt-8 max-w-2xl font-body text-base leading-relaxed text-surface-ivory/85 md:text-lg">
            {body}
          </p>
        )}
      </div>
    </section>
  );
}
