import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A section is either an ivory surface or a tuxedo surface. There is no third.
 *
 * This sets the background AND declares `data-surface`, so the type roles and
 * focus outlines inside it resolve to the right colors without any call site
 * restating them. Sections should use this rather than a bare `bg-*` class:
 * a background set on its own leaves descendants guessing.
 */
/** Shared prop shape for a block whose surface its page decides. */
export type SurfaceTone = { tone?: "tuxedo" | "ivory" };

export function Surface({
  tone,
  children,
 className,
  as: Tag = "section",
  ...rest
}: {
  tone: "tuxedo" | "ivory";
  children: ReactNode;
 className?: string;
  as?: ElementType;
} & Record<string, unknown>) {
  const ivory = tone === "ivory";
  return (
    <Tag
      data-surface={ivory ? "ivory" : "tuxedo"}
 className={cn(
        ivory
          ? "bg-surface-ivory text-surface-tuxedo"
          : "bg-surface-tuxedo text-surface-ivory",
 className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
