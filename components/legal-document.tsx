import type { ReactNode } from "react";
import type { LegalNode } from "@/lib/legal-doc";

type Props = {
  /** The document's own h1, rendered as the page h1. */
  title: string;
  /** Site-side framing above the document. Never part of the document text. */
  intro: ReactNode;
  /** Everything after the h1, in source order. */
  body: LegalNode[];
};

// Renders a legal document mirrored from the Open Mic Explorer app repo.
//
// Styling only. The node list arrives in source order and is rendered in source
// order: nothing is reordered, merged, summarized, or dropped. The text is
// reviewed as it stands, so this component's only job is to make it readable
// here. It is a server component, so the words are in the HTML and need no
// JavaScript to read, which is the thing Apple and Google actually check.
//
// The masthead is smaller than PageHeader's on purpose. These titles run long
// ("Open Mic Explorer End User License Agreement") and the display clamp used
// on the rest of the site turns that into a wall at phone widths.

export function LegalDocument({ title, intro, body }: Props) {
  return (
    <article>
      <header className="border-b border-bone/10 bg-ink pb-12 pt-32 md:pb-14 md:pt-36">
        <div className="mx-auto max-w-[820px] px-5 md:px-10">
          <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
            Open Mic Explorer
          </p>
          <h1 className="heading-display mt-4 text-[clamp(2rem,7vw,3.5rem)] text-bone">
            {title}
            <span className="text-hazard">.</span>
          </h1>
          <p className="mt-6 font-body text-sm leading-relaxed text-bone/70">
            {intro}
          </p>
        </div>
      </header>

      <div className="section-y bg-ink">
        <div className="mx-auto max-w-[820px] px-5 md:px-10">
          {body.map((node, i) => {
            switch (node.kind) {
              case "h1":
              case "h2":
                return (
                  <h2
                    key={i}
                    className="mt-12 font-display text-2xl text-bone first:mt-0 md:text-3xl"
                  >
                    {node.text}
                  </h2>
                );
              case "p":
                return (
                  <p
                    key={i}
                    className="mt-5 font-body text-base leading-relaxed text-bone/85"
                  >
                    {node.text}
                  </p>
                );
              case "ul":
                return (
                  <ul
                    key={i}
                    className="mt-5 space-y-3 border-l border-bone/15 pl-5"
                  >
                    {node.items.map((item, j) => (
                      <li
                        key={j}
                        className="font-body text-base leading-relaxed text-bone/85"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                );
            }
          })}
        </div>
      </div>
    </article>
  );
}
