"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// One-shot per-letter rise on mount. Used on the hero lockup. Reduced
// motion renders the static string. The animation runs once per page
// load (not on scroll) because the hero is above the fold.
// LazyMotion + m keeps the initial bundle to the ~5 kB shell; the
// domAnimation feature set loads with this chunk instead of the full
// framer-motion runtime.

type Props = {
  text: string;
  /** Optional ReactNode to render after the animated text. Useful for
   *  the hazard-yellow period accent. */
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
  const letters = Array.from(text);

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
      aria-label={text}
    >
      {letters.map((char, i) => (
        <m.span
          key={i}
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
          {char === " " ? " " : char}
        </m.span>
      ))}
      {trailing}
    </Wrapper>
    </LazyMotion>
  );
}
