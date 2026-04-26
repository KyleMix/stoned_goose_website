import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  /** @deprecated retained for compat; index labels removed for design pass */
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: Props) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <div className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
          <span>{eyebrow}</span>
        </div>
      )}
      <h2 className="heading-display text-[clamp(2.4rem,7vw,5.5rem)] text-bone text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl font-body text-base leading-relaxed text-bone/85 md:text-lg">
          {subtitle}
        </p>
      )}
    </header>
  );
}
