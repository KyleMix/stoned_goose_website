import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  index,
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
      {(index || eyebrow) && (
        <div className="flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-eyebrow text-bone/55">
          {index && <span className="text-hazard">{index}</span>}
          {eyebrow && <span>{eyebrow}</span>}
        </div>
      )}
      <h2 className="heading-display text-[clamp(2.4rem,7vw,5.5rem)] text-bone text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl font-body text-base leading-relaxed text-bone/70 md:text-lg">
          {subtitle}
        </p>
      )}
    </header>
  );
}
