import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  /** Set to "light" on bone/cream section backgrounds so the header text
   *  flips to ink instead of relying on per-caller class overrides. */
  tone?: "dark" | "light";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "dark",
  className,
}: Props) {
  const light = tone === "light";
  return (
    <header
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "font-body text-[11px] font-medium uppercase tracking-[0.18em]",
            light ? "text-ink/70" : "text-bone/55",
          )}
        >
          <span>{eyebrow}</span>
        </div>
      )}
      <h2
        className={cn(
          "heading-display text-[clamp(2.4rem,7vw,5.5rem)] text-balance",
          light ? "text-ink" : "text-bone",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "max-w-2xl font-body text-base leading-relaxed md:text-lg",
            light ? "text-ink/70" : "text-bone/85",
          )}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}
