"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { Fragment, type ReactNode } from "react";

// One-shot per-letter rise on mount. Used on the hero lockup. Reduced
// motion renders the static string. The animation runs once per page
// load (not on scroll) because the hero is above the fold.
// LazyMotion + m keeps the initial bundle to the ~5 kB shell; the
// domAnimation feature set loads with this chunk instead of the full
// framer-motion runtime.

type Props = {
  text: string;
  /** Optional ReactNode to render after the animated text. Useful for
   *  the gold period accent. */
  trailing?: ReactNode;
  /** Stagger between letters in seconds. */
  stagger?: number;
  /** Initial delay before the first letter animates. */
  delay?: number;
  className?: string;
  as?: "span" | "h1" | "h2";
};

export function TextEffect({
  text,
  trailing,
  stagger = 0.025,
  delay = 0.1,
  className,
  as = "span",
}: Props) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    const Tag = as;
    return (
      <Tag className={className}>
        {text}
        {trailing}
      </Tag>
    );
  }

  const Wrapper = m[as];

  // Words are atomic, letters are not. Every letter is its own inline-block,
  // and the gap between two inline-blocks is a line-break opportunity, so
  // without a nowrap wrapper per word the browser will happily split GOOSE
  // into "GOOS" and "E" on a narrow screen. It used to be worse: the space
  // between words was a non-breaking space, which suppressed the one break
  // the line actually wanted and guaranteed a mid-word break instead.
  const words = text.split(" ").filter(Boolean);

  return (
    <LazyMotion features={domAnimation} strict>
      <Wrapper
        className={className}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: stagger, delayChildren: delay },
          },
        }}
      >
        {/* aria-label is prohibited on a bare span (role=generic), so the
          accessible copy is a real, visually hidden text node instead. The
          per-letter spans below stay aria-hidden. */}
        <span className="sr-only">{text}</span>
        {words.map((word, wi) => (
          <Fragment key={wi}>
            {/* A real, breakable space between words. */}
            {wi > 0 ? " " : null}
            <span className="inline-block whitespace-nowrap">
              {Array.from(word).map((char, ci) => (
                <m.span
                  key={ci}
                  aria-hidden
                  className="inline-block"
                  variants={{
                    hidden: { y: "0.4em", opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
                    },
                  }}
                >
                  {char}
                </m.span>
              ))}
              {/* Inside the last word so the accent period cannot orphan. */}
              {wi === words.length - 1 ? trailing : null}
            </span>
          </Fragment>
        ))}
      </Wrapper>
    </LazyMotion>
  );
}
