import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionSurface = "base" | "muted" | "elevated";
type SectionSpacing = "default" | "compact" | "none";

type SectionShellProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  surface?: SectionSurface;
  spacing?: SectionSpacing;
  contained?: boolean;
};

const surfaceStyles: Record<SectionSurface, string> = {
  base: "bg-background/95",
  muted: "bg-muted/10",
  elevated: "bg-gradient-to-b from-background/95 via-muted/15 to-background/95",
};

const spacingStyles: Record<SectionSpacing, string> = {
  default: "py-16 md:py-24",
  compact: "py-12 md:py-16",
  none: "",
};

export function SectionShell({
  id,
  children,
  className,
  contentClassName,
  surface = "base",
  spacing = "default",
  contained = true,
}: SectionShellProps) {
  return (
    <section id={id} className={cn("relative overflow-hidden", surfaceStyles[surface], spacingStyles[spacing], className)}>
      {contained ? (
        <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", contentClassName)}>{children}</div>
      ) : (
        children
      )}
    </section>
  );
}

export function SectionHeading({
  title,
  subtitle,
  eyebrow,
  className,
  align = "center",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
  align?: "center" | "left";
}) {
  const aligned = align === "left" ? "text-left" : "text-center";

  return (
    <div className={cn("space-y-3 md:space-y-4", aligned, className)}>
      {eyebrow ? (
        <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">{eyebrow}</p>
      ) : null}
      <h2 className="text-4xl md:text-6xl font-display uppercase tracking-tight text-white">{title}</h2>
      {subtitle ? <p className={cn("max-w-3xl text-base md:text-lg text-gray-300", align === "center" && "mx-auto")}>{subtitle}</p> : null}
    </div>
  );
}
