import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  /** Set to "light" on ivory section backgrounds. This declares the surface
   *  rather than overriding colors per element: every type role inside flips
   *  at once, and so do focus outlines. */
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
  return (
    <header
      data-surface={tone === "light" ? "ivory" : "tuxedo"}
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <div className="t-eyebrow">
          <span>{eyebrow}</span>
        </div>
      )}
      <h2 className="t-headline display-1 text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="t-body max-w-2xl text-base md:text-lg">{subtitle}</p>
      )}
    </header>
  );
}
