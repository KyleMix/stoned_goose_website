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
    <section
      data-surface="tuxedo"
      className="relative border-b border-smoke bg-surface-tuxedo pb-16 pt-32 md:pb-20 md:pt-36"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        {eyebrow && (
          <p className="t-eyebrow">
            {eyebrow}
          </p>
        )}
        <h1 className="t-headline mt-4 display-hero">
          {title}
        </h1>
        {body && (
          <p className="t-body mt-8 max-w-2xl text-base md:text-lg">
            {body}
          </p>
        )}
      </div>
    </section>
  );
}
